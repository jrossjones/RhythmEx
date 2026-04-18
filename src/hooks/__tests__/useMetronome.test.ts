import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useMetronome } from '../useMetronome'
import type { ExercisePhase } from '@/types'
import type { LearnPhase } from '../useLearnMode'

interface HarnessArgs {
  phase?: ExercisePhase
  countdownValue?: number
  isLearnMode?: boolean
  learnPhase?: LearnPhase
  learnCountdownValue?: number
  bpm?: number
  timeSignature?: [number, number]
  metronomeOn?: boolean
  elapsedMs?: number
}

function renderMetronome(initial: HarnessArgs) {
  const play = vi.fn<(accent?: boolean) => void>()
  const elapsedRef = { current: initial.elapsedMs ?? 0 }

  const { rerender } = renderHook(
    (props: HarnessArgs) => {
      const ref = useRef(elapsedRef.current)
      ref.current = props.elapsedMs ?? elapsedRef.current
      elapsedRef.current = ref.current
      return useMetronome({
        phase: props.phase ?? 'idle',
        countdownValue: props.countdownValue ?? 0,
        isLearnMode: props.isLearnMode ?? false,
        learnPhase: props.learnPhase ?? 'idle',
        learnCountdownValue: props.learnCountdownValue ?? 0,
        bpm: props.bpm ?? 120,
        timeSignature: props.timeSignature ?? [4, 4],
        elapsedMsRef: ref,
        metronomeOn: props.metronomeOn ?? true,
        playMetronomeClick: play,
      })
    },
    { initialProps: initial }
  )

  return {
    play,
    elapsedRef,
    setProps: (next: HarnessArgs) => {
      if (next.elapsedMs !== undefined) elapsedRef.current = next.elapsedMs
      rerender(next)
    },
  }
}

describe('useMetronome', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not click when metronomeOn is false', () => {
    const { play, setProps } = renderMetronome({ phase: 'countdown', countdownValue: 4, metronomeOn: false })
    setProps({ phase: 'countdown', countdownValue: 3, metronomeOn: false })
    setProps({ phase: 'countdown', countdownValue: 2, metronomeOn: false })
    expect(play).not.toHaveBeenCalled()
  })

  it('clicks accented on each countdown value change', () => {
    const { play, setProps } = renderMetronome({ phase: 'countdown', countdownValue: 4 })
    expect(play).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenLastCalledWith(true)

    setProps({ phase: 'countdown', countdownValue: 3 })
    expect(play).toHaveBeenCalledTimes(2)

    setProps({ phase: 'countdown', countdownValue: 2 })
    setProps({ phase: 'countdown', countdownValue: 1 })
    expect(play).toHaveBeenCalledTimes(4)
    expect(play).toHaveBeenCalledWith(true)
  })

  it('clicks accented on learn-mode countdown ticks', () => {
    const { play, setProps } = renderMetronome({
      isLearnMode: true,
      learnPhase: 'countdown',
      learnCountdownValue: 4,
    })
    expect(play).toHaveBeenCalledTimes(1)

    setProps({ isLearnMode: true, learnPhase: 'countdown', learnCountdownValue: 3 })
    setProps({ isLearnMode: true, learnPhase: 'countdown', learnCountdownValue: 2 })
    setProps({ isLearnMode: true, learnPhase: 'countdown', learnCountdownValue: 1 })
    expect(play).toHaveBeenCalledTimes(4)
  })

  it('fires clicks as elapsedMs crosses beat boundaries during playing', () => {
    // 120 BPM = 500 ms per beat
    const { play, setProps } = renderMetronome({ phase: 'playing', bpm: 120, elapsedMs: 0 })

    // advance one RAF frame — currentBeat = 0, accent (downbeat)
    vi.advanceTimersByTime(16)
    expect(play).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenLastCalledWith(true)

    // advance to 600ms (past beat 1). force props update so elapsed ref syncs
    setProps({ phase: 'playing', bpm: 120, elapsedMs: 600 })
    vi.advanceTimersByTime(16)
    expect(play).toHaveBeenCalledTimes(2)
    expect(play).toHaveBeenLastCalledWith(false)

    // advance to 1100ms (beat 2) — not a downbeat
    setProps({ phase: 'playing', bpm: 120, elapsedMs: 1100 })
    vi.advanceTimersByTime(16)
    expect(play).toHaveBeenCalledTimes(3)
    expect(play).toHaveBeenLastCalledWith(false)
  })

  it('accents every beatsPerMeasure-th beat (downbeat detection)', () => {
    const { play, setProps } = renderMetronome({
      phase: 'playing',
      bpm: 120,
      timeSignature: [4, 4],
      elapsedMs: 0,
    })
    vi.advanceTimersByTime(16)
    // beat 0 → accent
    expect(play).toHaveBeenLastCalledWith(true)

    // beat 1, 2, 3 — no accent
    setProps({ phase: 'playing', bpm: 120, timeSignature: [4, 4], elapsedMs: 500 })
    vi.advanceTimersByTime(16)
    setProps({ phase: 'playing', bpm: 120, timeSignature: [4, 4], elapsedMs: 1000 })
    vi.advanceTimersByTime(16)
    setProps({ phase: 'playing', bpm: 120, timeSignature: [4, 4], elapsedMs: 1500 })
    vi.advanceTimersByTime(16)

    expect(play.mock.calls.slice(1, 4).every(([accent]) => accent === false)).toBe(true)

    // beat 4 → accent (new measure)
    setProps({ phase: 'playing', bpm: 120, timeSignature: [4, 4], elapsedMs: 2000 })
    vi.advanceTimersByTime(16)
    expect(play).toHaveBeenLastCalledWith(true)
  })

  it('survives BPM change during playing without skipping or double-clicking', () => {
    // This test guards the forthcoming mid-play BPM feature.
    // At 60 BPM, beatMs = 1000. At elapsed=500ms we are at beat 0 still.
    const { play, setProps } = renderMetronome({ phase: 'playing', bpm: 60, elapsedMs: 500 })
    vi.advanceTimersByTime(16)
    const callsAt60 = play.mock.calls.length
    expect(callsAt60).toBe(1)
    expect(play).toHaveBeenLastCalledWith(true) // beat 0 = downbeat

    // change BPM to 120 (beatMs=500). Now elapsed=500 crosses into beat 1.
    setProps({ phase: 'playing', bpm: 120, elapsedMs: 500 })
    vi.advanceTimersByTime(16)
    expect(play).toHaveBeenCalledTimes(callsAt60 + 1)
    expect(play).toHaveBeenLastCalledWith(false) // beat 1 at 4/4

    // advance to elapsed 1000 (beat 2) — no skip, no double click
    setProps({ phase: 'playing', bpm: 120, elapsedMs: 1000 })
    vi.advanceTimersByTime(16)
    expect(play).toHaveBeenCalledTimes(callsAt60 + 2)
  })

  it('does not click during idle or done phases', () => {
    const { play, setProps } = renderMetronome({ phase: 'idle' })
    vi.advanceTimersByTime(100)
    expect(play).not.toHaveBeenCalled()

    setProps({ phase: 'done' })
    vi.advanceTimersByTime(100)
    expect(play).not.toHaveBeenCalled()
  })
})

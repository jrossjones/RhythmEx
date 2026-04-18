import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useDemoMode } from '../useDemoMode'
import type { Exercise, ExercisePhase, InstrumentType } from '@/types'

const drumExercise: Exercise = {
  id: 'd',
  name: 'd',
  difficulty: 'beginner',
  timeSignature: [4, 4],
  bpm: 120,
  measures: 1,
  instrument: 'drums',
  beats: [
    { time: '0:0:0', duration: '4n', note: 'kick' },
    { time: '0:1:0', duration: '4n', note: 'snare' },
    { time: '0:2:0', duration: '4n', note: 'kick' },
    { time: '0:3:0', duration: '4n', note: 'snare' },
  ],
}

const handpanExercise: Exercise = {
  ...drumExercise,
  id: 'h',
  instrument: 'handpan',
  beats: [
    { time: '0:0:0', duration: '4n', note: 'D3' },
    { time: '0:1:0', duration: '4n', note: 'F3' },
  ],
}

const strumExercise: Exercise = {
  ...drumExercise,
  id: 's',
  instrument: 'strumming',
  beats: [
    { time: '0:0:0', duration: '4n', note: 'down', chord: 'C' },
    { time: '0:1:0', duration: '4n', note: 'up', chord: 'G' },
  ],
}

interface HarnessArgs {
  phase?: ExercisePhase
  isDemoMode?: boolean
  instrument?: InstrumentType
  exercise?: Exercise
  bpm?: number
  elapsedMs?: number
}

function renderDemo(initial: HarnessArgs) {
  const playDrum = vi.fn()
  const playHandpan = vi.fn()
  const playStrum = vi.fn()
  const elapsedRef = { current: initial.elapsedMs ?? 0 }

  const { rerender } = renderHook(
    (props: HarnessArgs) => {
      const ref = useRef(elapsedRef.current)
      ref.current = props.elapsedMs ?? elapsedRef.current
      elapsedRef.current = ref.current
      return useDemoMode({
        phase: props.phase ?? 'idle',
        isDemoMode: props.isDemoMode ?? false,
        exercise: props.exercise ?? drumExercise,
        bpm: props.bpm ?? 120,
        instrument: props.instrument ?? 'drums',
        elapsedMsRef: ref,
        playDrum,
        playHandpan,
        playStrum,
      })
    },
    { initialProps: initial }
  )

  return {
    playDrum,
    playHandpan,
    playStrum,
    setProps: (next: HarnessArgs) => {
      if (next.elapsedMs !== undefined) elapsedRef.current = next.elapsedMs
      rerender(next)
    },
  }
}

describe('useDemoMode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not fire when phase is not playing', () => {
    const { playDrum, setProps } = renderDemo({ phase: 'idle', isDemoMode: true })
    setProps({ phase: 'countdown', isDemoMode: true, elapsedMs: 1000 })
    vi.advanceTimersByTime(50)
    expect(playDrum).not.toHaveBeenCalled()

    setProps({ phase: 'done', isDemoMode: true, elapsedMs: 2000 })
    vi.advanceTimersByTime(50)
    expect(playDrum).not.toHaveBeenCalled()
  })

  it('does not fire when isDemoMode is false', () => {
    const { playDrum, setProps } = renderDemo({ phase: 'playing', isDemoMode: false })
    setProps({ phase: 'playing', isDemoMode: false, elapsedMs: 1000 })
    vi.advanceTimersByTime(50)
    expect(playDrum).not.toHaveBeenCalled()
  })

  it('fires playDrum at each drum beat time when demoing', () => {
    // 120 BPM → 500 ms per beat. Beats at 0, 500, 1000, 1500.
    const { playDrum, setProps } = renderDemo({
      phase: 'playing',
      isDemoMode: true,
      elapsedMs: 0,
    })
    vi.advanceTimersByTime(16)
    expect(playDrum).toHaveBeenLastCalledWith('kick')

    setProps({ phase: 'playing', isDemoMode: true, elapsedMs: 500 })
    vi.advanceTimersByTime(16)
    expect(playDrum).toHaveBeenCalledTimes(2)
    expect(playDrum).toHaveBeenLastCalledWith('snare')

    setProps({ phase: 'playing', isDemoMode: true, elapsedMs: 1500 })
    vi.advanceTimersByTime(16)
    // two more beats fire (beat 2 at 1000 and beat 3 at 1500)
    expect(playDrum).toHaveBeenCalledTimes(4)
  })

  it('fires playHandpan with correct notes', () => {
    const { playHandpan, setProps } = renderDemo({
      phase: 'playing',
      isDemoMode: true,
      instrument: 'handpan',
      exercise: handpanExercise,
      elapsedMs: 0,
    })
    vi.advanceTimersByTime(16)
    expect(playHandpan).toHaveBeenLastCalledWith('D3')

    setProps({
      phase: 'playing',
      isDemoMode: true,
      instrument: 'handpan',
      exercise: handpanExercise,
      elapsedMs: 500,
    })
    vi.advanceTimersByTime(16)
    expect(playHandpan).toHaveBeenLastCalledWith('F3')
  })

  it('fires playStrum with chord and direction', () => {
    const { playStrum, setProps } = renderDemo({
      phase: 'playing',
      isDemoMode: true,
      instrument: 'strumming',
      exercise: strumExercise,
      elapsedMs: 0,
    })
    vi.advanceTimersByTime(16)
    expect(playStrum).toHaveBeenLastCalledWith('C', 'down')

    setProps({
      phase: 'playing',
      isDemoMode: true,
      instrument: 'strumming',
      exercise: strumExercise,
      elapsedMs: 500,
    })
    vi.advanceTimersByTime(16)
    expect(playStrum).toHaveBeenLastCalledWith('G', 'up')
  })

  it('does not re-fire an already-fired beat on subsequent frames', () => {
    const { playDrum, setProps } = renderDemo({
      phase: 'playing',
      isDemoMode: true,
      elapsedMs: 0,
    })
    vi.advanceTimersByTime(16)
    vi.advanceTimersByTime(16)
    vi.advanceTimersByTime(16)
    // Still at elapsed=0, only beat 0 fires, once
    expect(playDrum).toHaveBeenCalledTimes(1)

    setProps({ phase: 'playing', isDemoMode: true, elapsedMs: 100 })
    vi.advanceTimersByTime(16)
    // still beat 0 territory — no new fires
    expect(playDrum).toHaveBeenCalledTimes(1)
  })
})

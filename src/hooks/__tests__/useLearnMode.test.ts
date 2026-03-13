import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLearnMode } from '../useLearnMode'
import type { Exercise } from '@/types'

const testExercise: Exercise = {
  id: 'test-learn',
  name: 'Learn Test',
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

// 120 BPM = 500ms per beat, 4-beat countdown = 2000ms
const COUNTDOWN_MS = 2000

/** Helper: start and advance past countdown to active phase */
function startAndCountdown(result: { current: ReturnType<typeof useLearnMode> }) {
  act(() => { result.current.start() })
  act(() => { vi.advanceTimersByTime(COUNTDOWN_MS) })
}

describe('useLearnMode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in idle phase with currentBeatIndex 0', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))
    expect(result.current.learnPhase).toBe('idle')
    expect(result.current.currentBeatIndex).toBe(0)
  })

  it('start() begins countdown phase', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))

    act(() => { result.current.start() })
    expect(result.current.learnPhase).toBe('countdown')
    expect(result.current.learnCountdownValue).toBe(4)
  })

  it('countdown counts down 4, 3, 2, 1 at tempo', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))

    act(() => { result.current.start() })
    expect(result.current.learnCountdownValue).toBe(4)

    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.learnCountdownValue).toBe(3)

    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.learnCountdownValue).toBe(2)

    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.learnCountdownValue).toBe(1)
  })

  it('transitions to active after countdown', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(COUNTDOWN_MS) })

    expect(result.current.learnPhase).toBe('active')
    expect(result.current.learnCountdownValue).toBe(0)
  })

  it('correct tap advances currentBeatIndex', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))
    startAndCountdown(result)

    act(() => { result.current.recordLearnTap('kick') })

    expect(result.current.currentBeatIndex).toBe(1)
    expect(result.current.learnBeatJudgments.get(0)).toBe('on-time')
  })

  it('wrong tap sets wrongPad and does not advance', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))
    startAndCountdown(result)

    act(() => { result.current.recordLearnTap('snare') }) // expected 'kick'

    expect(result.current.currentBeatIndex).toBe(0)
    expect(result.current.wrongPad).toBe('snare')
  })

  it('wrongPad clears after 400ms timeout', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))
    startAndCountdown(result)

    act(() => { result.current.recordLearnTap('snare') })
    expect(result.current.wrongPad).toBe('snare')

    act(() => { vi.advanceTimersByTime(400) })
    expect(result.current.wrongPad).toBeNull()
  })

  it('completing all beats sets learnPhase to done', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))
    startAndCountdown(result)

    act(() => { result.current.recordLearnTap('kick') })
    act(() => { result.current.recordLearnTap('snare') })
    act(() => { result.current.recordLearnTap('kick') })
    act(() => { result.current.recordLearnTap('snare') })

    expect(result.current.learnPhase).toBe('done')
    expect(result.current.currentBeatIndex).toBe(4)
  })

  it('stop() resets to initial state', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))
    startAndCountdown(result)

    act(() => { result.current.recordLearnTap('kick') })
    act(() => { result.current.stop() })

    expect(result.current.learnPhase).toBe('idle')
    expect(result.current.currentBeatIndex).toBe(0)
    expect(result.current.learnBeatJudgments.size).toBe(0)
    expect(result.current.wrongPad).toBeNull()
  })

  it('no-op when learnPhase is not active', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))

    // Idle — should be no-op
    act(() => { result.current.recordLearnTap('kick') })
    expect(result.current.currentBeatIndex).toBe(0)

    // Countdown — should be no-op
    act(() => { result.current.start() })
    act(() => { result.current.recordLearnTap('kick') })
    expect(result.current.currentBeatIndex).toBe(0)

    // Advance to active, complete all beats
    act(() => { vi.advanceTimersByTime(COUNTDOWN_MS) })
    act(() => { result.current.recordLearnTap('kick') })
    act(() => { result.current.recordLearnTap('snare') })
    act(() => { result.current.recordLearnTap('kick') })
    act(() => { result.current.recordLearnTap('snare') })
    expect(result.current.learnPhase).toBe('done')

    // Done — should be no-op
    act(() => { result.current.recordLearnTap('kick') })
    expect(result.current.currentBeatIndex).toBe(4) // unchanged
  })

  it('start() resets state from previous session', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))

    startAndCountdown(result)
    act(() => { result.current.recordLearnTap('kick') })
    act(() => { result.current.recordLearnTap('snare') })
    expect(result.current.currentBeatIndex).toBe(2)

    act(() => { result.current.start() })
    expect(result.current.currentBeatIndex).toBe(0)
    expect(result.current.learnBeatJudgments.size).toBe(0)
    expect(result.current.learnPhase).toBe('countdown')
  })

  it('stop() during countdown resets to idle', () => {
    const { result } = renderHook(() => useLearnMode(testExercise, 120))

    act(() => { result.current.start() })
    expect(result.current.learnPhase).toBe('countdown')

    act(() => { result.current.stop() })
    expect(result.current.learnPhase).toBe('idle')
    expect(result.current.learnCountdownValue).toBe(0)
  })
})

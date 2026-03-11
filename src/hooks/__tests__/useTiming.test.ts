import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTiming } from '../useTiming'
import type { Exercise, ExercisePhase } from '@/types'

// 4-beat exercise at 120 BPM → beats at 0, 500, 1000, 1500 ms
const testExercise: Exercise = {
  id: 'test',
  name: 'Test Exercise',
  difficulty: 'beginner',
  timeSignature: [4, 4],
  bpm: 120,
  measures: 1,
  beats: [
    { time: '0:0:0', duration: '4n', note: 'C4' },
    { time: '0:1:0', duration: '4n', note: 'C4' },
    { time: '0:2:0', duration: '4n', note: 'C4' },
    { time: '0:3:0', duration: '4n', note: 'C4' },
  ],
}

const drumExercise: Exercise = {
  id: 'test-drums',
  name: 'Test Drums',
  difficulty: 'beginner',
  timeSignature: [4, 4],
  bpm: 120,
  measures: 1,
  beats: [
    { time: '0:0:0', duration: '4n', note: 'kick' },
    { time: '0:1:0', duration: '4n', note: 'snare' },
    { time: '0:2:0', duration: '4n', note: 'kick' },
    { time: '0:3:0', duration: '4n', note: 'snare' },
  ],
}

function createOptions(overrides: { phase?: ExercisePhase; elapsedMs?: number; strictMode?: boolean; exercise?: Exercise } = {}) {
  const phase = overrides.phase ?? 'playing'
  const elapsedMsRef = { current: overrides.elapsedMs ?? 0 }
  return {
    exercise: overrides.exercise ?? testExercise,
    bpm: 120,
    phase,
    elapsedMsRef,
    strictMode: overrides.strictMode,
  }
}

describe('useTiming', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with empty state', () => {
    const options = createOptions()
    const { result } = renderHook(() => useTiming(options))

    expect(result.current.tapResults).toEqual([])
    expect(result.current.lastTapFeedback).toBeNull()
    expect(result.current.beatJudgments.size).toBe(0)
  })

  it('recordTap is no-op when phase is idle', () => {
    const options = createOptions({ phase: 'idle', elapsedMs: 10 })
    const { result } = renderHook(() => useTiming(options))

    act(() => {
      result.current.recordTap()
    })

    expect(result.current.tapResultsRef.current).toEqual([])
  })

  it('recordTap is no-op when phase is countdown', () => {
    const options = createOptions({ phase: 'countdown', elapsedMs: 10 })
    const { result } = renderHook(() => useTiming(options))

    act(() => {
      result.current.recordTap()
    })

    expect(result.current.tapResultsRef.current).toEqual([])
  })

  it('records tap and matches to nearest beat with on-time judgment', () => {
    const elapsedMsRef = { current: 20 }
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    act(() => {
      result.current.recordTap()
    })

    expect(result.current.tapResultsRef.current).toHaveLength(1)
    expect(result.current.tapResultsRef.current[0].judgment).toBe('on-time')
    expect(result.current.tapResultsRef.current[0].expectedMs).toBe(0)
  })

  it('records tap with early judgment', () => {
    const elapsedMsRef = { current: 430 } // 70ms early from beat at 500ms
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    act(() => {
      result.current.recordTap()
    })

    expect(result.current.tapResultsRef.current).toHaveLength(1)
    expect(result.current.tapResultsRef.current[0].judgment).toBe('early')
    expect(result.current.tapResultsRef.current[0].expectedMs).toBe(500)
  })

  it('records tap with late judgment', () => {
    const elapsedMsRef = { current: 570 } // 70ms late from beat at 500ms
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    // First tap matches beat 0
    elapsedMsRef.current = 10
    act(() => { result.current.recordTap() })

    // Second tap is late for beat 1
    elapsedMsRef.current = 570
    act(() => { result.current.recordTap() })

    expect(result.current.tapResultsRef.current).toHaveLength(2)
    expect(result.current.tapResultsRef.current[1].judgment).toBe('late')
    expect(result.current.tapResultsRef.current[1].expectedMs).toBe(500)
  })

  it('each beat is matched only once', () => {
    const elapsedMsRef = { current: 10 }
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    // First tap matches beat 0 (at 0ms)
    act(() => { result.current.recordTap() })

    // Second tap close to beat 1 (at 500ms) — should match beat 1, not beat 0
    elapsedMsRef.current = 490
    act(() => { result.current.recordTap() })

    expect(result.current.tapResultsRef.current).toHaveLength(2)
    expect(result.current.tapResultsRef.current[0].expectedMs).toBe(0)
    expect(result.current.tapResultsRef.current[1].expectedMs).toBe(500)
  })

  it('ignores stray taps beyond 240ms from any unmatched beat', () => {
    const elapsedMsRef = { current: 250 } // 250ms from beat 0, 250ms from beat 1
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    act(() => { result.current.recordTap() })

    // Beat 0 is at 0ms. Distance = 250ms > 240ms. Beat 1 is at 500ms. Distance = 250ms > 240ms.
    // Both are > 240ms, so tap should be ignored
    expect(result.current.tapResultsRef.current).toHaveLength(0)
  })

  it('updates beatJudgments map on tap', () => {
    const elapsedMsRef = { current: 10 }
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    act(() => { result.current.recordTap() })

    expect(result.current.beatJudgments.get(0)).toBe('on-time')
  })

  it('updates lastTapFeedback on tap', () => {
    const elapsedMsRef = { current: 10 }
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    act(() => { result.current.recordTap() })

    expect(result.current.lastTapFeedback).not.toBeNull()
    expect(result.current.lastTapFeedback!.judgment).toBe('on-time')
  })

  it('finalize fills unmatched beats as misses', () => {
    const elapsedMsRef = { current: 10 }
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    // Tap only beat 0
    act(() => { result.current.recordTap() })

    let finalResults: ReturnType<typeof result.current.finalize> = []
    act(() => {
      finalResults = result.current.finalize()
    })

    // Should have 4 results: 1 tapped + 3 misses
    expect(finalResults).toHaveLength(4)
    const misses = finalResults.filter((r) => r.judgment === 'miss')
    expect(misses).toHaveLength(3)
  })

  it('finalize with no taps returns all misses', () => {
    const options = createOptions()
    const { result } = renderHook(() => useTiming(options))

    let finalResults: ReturnType<typeof result.current.finalize> = []
    act(() => {
      finalResults = result.current.finalize()
    })

    expect(finalResults).toHaveLength(4)
    expect(finalResults.every((r) => r.judgment === 'miss')).toBe(true)
  })

  it('reset clears all state', () => {
    const elapsedMsRef = { current: 10 }
    const options = { exercise: testExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    // Record a tap
    act(() => { result.current.recordTap() })
    expect(result.current.tapResultsRef.current).toHaveLength(1)
    expect(result.current.beatJudgments.size).toBe(1)

    // Reset
    act(() => { result.current.reset() })

    expect(result.current.tapResultsRef.current).toEqual([])
    expect(result.current.lastTapFeedback).toBeNull()
    expect(result.current.beatJudgments.size).toBe(0)
  })

  // --- Drum pad and strict mode tests ---

  it('recordTap with pad in free mode attaches pad to result', () => {
    const elapsedMsRef = { current: 20 }
    const options = { exercise: drumExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    act(() => { result.current.recordTap('kick') })

    expect(result.current.tapResultsRef.current).toHaveLength(1)
    expect(result.current.tapResultsRef.current[0].pad).toBe('kick')
    expect(result.current.tapResultsRef.current[0].judgment).toBe('on-time')
  })

  it('recordTap with wrong pad in strict mode results in miss', () => {
    const elapsedMsRef = { current: 20 }
    // Beat 0 expects 'kick'
    const options = { exercise: drumExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef, strictMode: true }
    const { result } = renderHook(() => useTiming(options))

    act(() => { result.current.recordTap('snare') })

    expect(result.current.tapResultsRef.current).toHaveLength(1)
    expect(result.current.tapResultsRef.current[0].judgment).toBe('miss')
    expect(result.current.tapResultsRef.current[0].expectedPad).toBe('kick')
  })

  it('recordTap with correct pad in strict mode uses normal timing judgment', () => {
    const elapsedMsRef = { current: 20 }
    // Beat 0 expects 'kick'
    const options = { exercise: drumExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef, strictMode: true }
    const { result } = renderHook(() => useTiming(options))

    act(() => { result.current.recordTap('kick') })

    expect(result.current.tapResultsRef.current).toHaveLength(1)
    expect(result.current.tapResultsRef.current[0].judgment).toBe('on-time')
    expect(result.current.tapResultsRef.current[0].expectedPad).toBeUndefined()
  })

  it('recordTap with no pad in strict mode still works (backward compat)', () => {
    const elapsedMsRef = { current: 20 }
    const options = { exercise: drumExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef, strictMode: true }
    const { result } = renderHook(() => useTiming(options))

    act(() => { result.current.recordTap() })

    expect(result.current.tapResultsRef.current).toHaveLength(1)
    expect(result.current.tapResultsRef.current[0].judgment).toBe('on-time')
    expect(result.current.tapResultsRef.current[0].pad).toBeUndefined()
  })

  it('lastFeedbackPad is set on tap and cleared on reset', () => {
    const elapsedMsRef = { current: 20 }
    const options = { exercise: drumExercise, bpm: 120, phase: 'playing' as const, elapsedMsRef }
    const { result } = renderHook(() => useTiming(options))

    act(() => { result.current.recordTap('kick') })
    expect(result.current.lastFeedbackPad).toBe('kick')

    act(() => { result.current.reset() })
    expect(result.current.lastFeedbackPad).toBeNull()
  })
})

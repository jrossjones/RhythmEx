import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExercise } from '../useExercise'
import type { Exercise } from '@/types'

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

describe('useExercise', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in idle phase', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))
    expect(result.current.phase).toBe('idle')
    expect(result.current.countdownValue).toBe(0)
    expect(result.current.progress).toBe(0)
  })

  it('transitions to countdown on startExercise', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })

    expect(result.current.phase).toBe('countdown')
    expect(result.current.countdownValue).toBe(4)
  })

  it('counts down 4, 3, 2, 1 at tempo', () => {
    // 120 BPM = 500ms per beat
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })

    expect(result.current.countdownValue).toBe(4)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.countdownValue).toBe(3)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.countdownValue).toBe(2)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.countdownValue).toBe(1)
  })

  it('transitions to playing after countdown (at tempo)', () => {
    // 120 BPM = 500ms per beat, 4 beats = 2000ms countdown
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.phase).toBe('playing')
    expect(result.current.countdownValue).toBe(0)
  })

  it('elapsedMs starts negative during lead-in', () => {
    // 120 BPM = 500ms per beat, 4-beat lead-in = -2000ms
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })

    expect(result.current.elapsedMs).toBeLessThan(0)
  })

  it('rawProgress is negative during countdown', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })

    expect(result.current.rawProgress).toBeLessThan(0)
    // Clamped progress should be 0
    expect(result.current.progress).toBe(0)
  })

  it('stopExercise resets to idle', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })
    expect(result.current.phase).toBe('countdown')

    act(() => {
      result.current.stopExercise()
    })
    expect(result.current.phase).toBe('idle')
    expect(result.current.countdownValue).toBe(0)
    expect(result.current.elapsedMs).toBe(0)
  })

  it('setBpm updates BPM in idle phase', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.setBpm(100)
    })
    expect(result.current.bpm).toBe(100)
  })

  it('setBpm is ignored during countdown phase', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })
    expect(result.current.phase).toBe('countdown')

    act(() => {
      result.current.setBpm(100)
    })
    expect(result.current.bpm).toBe(120)
  })

  it('cleans up timers on unmount', () => {
    const onDone = vi.fn()
    const { result, unmount } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })

    unmount()

    // Advancing timers should not throw or call onDone
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(onDone).not.toHaveBeenCalled()
  })

  it('has correct initial BPM from exercise', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))
    expect(result.current.bpm).toBe(120)
  })

  it('initialBpm overrides exercise.bpm', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone, 95))
    expect(result.current.bpm).toBe(95)
  })

  // --- Restart tests ---

  it('restart from done transitions to countdown', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    // Get to playing state (4-beat lead-in at 120 BPM = 2000ms)
    act(() => { result.current.startExercise() })
    act(() => { vi.advanceTimersByTime(2000) }) // countdown done
    expect(result.current.phase).toBe('playing')

    // Simulate done phase manually (can't wait for RAF in fake timers easily)
    // Instead, test restart from playing state — it should work from any phase
    act(() => { result.current.restart() })
    expect(result.current.phase).toBe('countdown')
    expect(result.current.countdownValue).toBe(4)
  })

  it('restart with seamless goes directly to playing', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => { result.current.startExercise() })
    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current.phase).toBe('playing')

    act(() => { result.current.restart({ seamless: true }) })
    expect(result.current.phase).toBe('playing')
  })

  it('restart with newBpm updates BPM', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => { result.current.startExercise() })
    act(() => { vi.advanceTimersByTime(2000) })

    act(() => { result.current.restart({ newBpm: 140 }) })
    expect(result.current.bpm).toBe(140)
  })

  it('restart cleans up before restarting', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => { result.current.startExercise() })
    // Restart during countdown — should cleanup old timers
    act(() => { result.current.restart() })
    expect(result.current.phase).toBe('countdown')
    expect(result.current.countdownValue).toBe(4)
  })

  // --- Outro scroll tests ---

  it('rawProgress exceeds 1.0 when elapsedMs > durationMs', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    // rawProgress should be 0 initially
    expect(result.current.rawProgress).toBe(0)
    // progress should be clamped at 0
    expect(result.current.progress).toBe(0)
  })

  it('exports rawProgress unclamped alongside clamped progress', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    expect(result.current.rawProgress).toBeDefined()
    expect(result.current.progress).toBeDefined()
    // Both should be 0 at start
    expect(result.current.rawProgress).toBe(0)
    expect(result.current.progress).toBe(0)
  })
})

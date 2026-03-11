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
    expect(result.current.countdownValue).toBe(3)
  })

  it('counts down 3, 2, 1 at tempo', () => {
    // 120 BPM = 500ms per beat
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
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
    // 120 BPM = 500ms per beat, 3 beats = 1500ms countdown
    const onDone = vi.fn()
    const { result } = renderHook(() => useExercise(testExercise, onDone))

    act(() => {
      result.current.startExercise()
    })

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(result.current.phase).toBe('playing')
    expect(result.current.countdownValue).toBe(0)
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
})

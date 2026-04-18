import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoopMode } from '../useLoopMode'
import type { ExerciseResult } from '@/types'

vi.mock('@/utils/storage', () => ({
  saveResult: vi.fn(),
}))

import { saveResult } from '@/utils/storage'
const mockSaveResult = vi.mocked(saveResult)

const baseResult: ExerciseResult = {
  exerciseId: 'e1',
  instrument: 'drums',
  accuracy: 92,
  stars: 3,
  tapResults: [],
  timestamp: 1000,
}

describe('useLoopMode', () => {
  beforeEach(() => {
    mockSaveResult.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('saves result and triggers seamless restart when seamlessLoop is true', () => {
    const onSeamless = vi.fn()
    const onOverlay = vi.fn()
    const { result } = renderHook(() =>
      useLoopMode({ seamlessLoop: true, onSeamlessRestart: onSeamless, onOverlayRestart: onOverlay })
    )

    act(() => {
      result.current.triggerLoopCompletion(baseResult, 130)
    })

    expect(mockSaveResult).toHaveBeenCalledWith(baseResult)
    expect(onSeamless).toHaveBeenCalledWith(130)
    expect(onOverlay).not.toHaveBeenCalled()
    expect(result.current.loopOverlay).toBeNull()
    expect(result.current.lastLoopResult).toEqual(baseResult)
  })

  it('shows overlay when seamlessLoop is false', () => {
    const onSeamless = vi.fn()
    const onOverlay = vi.fn()
    const { result } = renderHook(() =>
      useLoopMode({ seamlessLoop: false, onSeamlessRestart: onSeamless, onOverlayRestart: onOverlay })
    )

    act(() => {
      result.current.triggerLoopCompletion(baseResult, 130)
    })

    expect(mockSaveResult).toHaveBeenCalledWith(baseResult)
    expect(onSeamless).not.toHaveBeenCalled()
    expect(result.current.loopOverlay).toEqual({
      accuracy: 92,
      stars: 3,
      nextBpm: 130,
    })
  })

  it('dismisses overlay and triggers onOverlayRestart with nextBpm', () => {
    const onSeamless = vi.fn()
    const onOverlay = vi.fn()
    const { result } = renderHook(() =>
      useLoopMode({ seamlessLoop: false, onSeamlessRestart: onSeamless, onOverlayRestart: onOverlay })
    )

    act(() => {
      result.current.triggerLoopCompletion(baseResult, 140)
    })
    act(() => {
      result.current.dismissOverlay()
    })

    expect(result.current.loopOverlay).toBeNull()
    expect(onOverlay).toHaveBeenCalledWith(140)
  })

  it('dismissOverlay is a no-op when no overlay is showing', () => {
    const onOverlay = vi.fn()
    const { result } = renderHook(() =>
      useLoopMode({ seamlessLoop: false, onSeamlessRestart: vi.fn(), onOverlayRestart: onOverlay })
    )

    act(() => {
      result.current.dismissOverlay()
    })

    expect(onOverlay).not.toHaveBeenCalled()
  })

  it('uses latest seamlessLoop setting when triggerLoopCompletion is called', () => {
    // Simulates user toggling seamlessLoop between exercise completions.
    const onSeamless = vi.fn()
    const onOverlay = vi.fn()
    const { result, rerender } = renderHook(
      (props: { seamlessLoop: boolean }) =>
        useLoopMode({
          seamlessLoop: props.seamlessLoop,
          onSeamlessRestart: onSeamless,
          onOverlayRestart: onOverlay,
        }),
      { initialProps: { seamlessLoop: false } }
    )

    rerender({ seamlessLoop: true })

    act(() => {
      result.current.triggerLoopCompletion(baseResult, 120)
    })

    expect(onSeamless).toHaveBeenCalledWith(120)
    expect(result.current.loopOverlay).toBeNull()
  })

  it('clearLastLoopResult resets lastLoopResult', () => {
    const { result } = renderHook(() =>
      useLoopMode({ seamlessLoop: true, onSeamlessRestart: vi.fn(), onOverlayRestart: vi.fn() })
    )

    act(() => {
      result.current.triggerLoopCompletion(baseResult, undefined)
    })
    expect(result.current.lastLoopResult).toEqual(baseResult)

    act(() => {
      result.current.clearLastLoopResult()
    })
    expect(result.current.lastLoopResult).toBeNull()
  })

  it('preserves nextBpm=undefined when speed trainer is off', () => {
    const onSeamless = vi.fn()
    const { result } = renderHook(() =>
      useLoopMode({ seamlessLoop: true, onSeamlessRestart: onSeamless, onOverlayRestart: vi.fn() })
    )

    act(() => {
      result.current.triggerLoopCompletion(baseResult)
    })

    expect(onSeamless).toHaveBeenCalledWith(undefined)
  })
})

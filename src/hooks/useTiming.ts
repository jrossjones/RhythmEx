import { useState, useRef, useCallback } from 'react'
import type { Exercise, ExercisePhase, TapResult, TimingJudgment } from '@/types'
import { beatTimesMs } from '@/utils/rhythm'
import { judgeTap } from '@/utils/scoring'

interface UseTimingOptions {
  exercise: Exercise
  bpm: number
  phase: ExercisePhase
  elapsedMsRef: React.RefObject<number>
}

interface TapFeedback {
  judgment: TimingJudgment
  timestamp: number
}

export function useTiming({ exercise, bpm, phase, elapsedMsRef }: UseTimingOptions) {
  const [lastTapFeedback, setLastTapFeedback] = useState<TapFeedback | null>(null)
  const [beatJudgments, setBeatJudgments] = useState<Map<number, TimingJudgment>>(new Map())

  const tapResultsRef = useRef<TapResult[]>([])
  const matchedBeatsRef = useRef<Set<number>>(new Set())
  const beatTimesRef = useRef<number[]>([])

  // Pre-compute beat times whenever exercise/bpm changes
  // We store in ref and recompute on access to keep it current
  const getBeatTimes = useCallback(() => {
    const times = beatTimesMs({ ...exercise, bpm })
    beatTimesRef.current = times
    return times
  }, [exercise, bpm])

  const recordTap = useCallback(() => {
    if (phase !== 'playing') return

    const tapMs = elapsedMsRef.current
    const times = getBeatTimes()

    // Find nearest unmatched beat
    let nearestIndex = -1
    let nearestDist = Infinity

    for (let i = 0; i < times.length; i++) {
      if (matchedBeatsRef.current.has(i)) continue
      const dist = Math.abs(tapMs - times[i])
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIndex = i
      }
    }

    // Stray tap beyond 240ms from any beat — silently ignore (kid-friendly)
    if (nearestIndex === -1 || nearestDist > 240) return

    const result = judgeTap(times[nearestIndex], tapMs)
    tapResultsRef.current.push(result)
    matchedBeatsRef.current.add(nearestIndex)

    // Update beat judgments map (drives UI)
    setBeatJudgments((prev) => {
      const next = new Map(prev)
      next.set(nearestIndex, result.judgment)
      return next
    })

    setLastTapFeedback({ judgment: result.judgment, timestamp: performance.now() })
  }, [phase, elapsedMsRef, getBeatTimes])

  const finalize = useCallback((): TapResult[] => {
    const times = getBeatTimes()

    // Fill unmatched beats as misses
    for (let i = 0; i < times.length; i++) {
      if (!matchedBeatsRef.current.has(i)) {
        tapResultsRef.current.push({
          expectedMs: times[i],
          actualMs: -1,
          deltaMs: -1,
          judgment: 'miss',
        })

        setBeatJudgments((prev) => {
          const next = new Map(prev)
          next.set(i, 'miss')
          return next
        })
      }
    }

    return [...tapResultsRef.current]
  }, [getBeatTimes])

  const reset = useCallback(() => {
    tapResultsRef.current = []
    matchedBeatsRef.current = new Set()
    setLastTapFeedback(null)
    setBeatJudgments(new Map())
  }, [])

  return {
    tapResults: tapResultsRef.current,
    tapResultsRef,
    lastTapFeedback,
    beatJudgments,
    recordTap,
    finalize,
    reset,
  }
}

import { useState, useRef, useCallback } from 'react'
import type { DrumPad, Exercise, ExercisePhase, TapResult, TimingJudgment } from '@/types'
import { beatTimesMs } from '@/utils/rhythm'
import { judgeTap } from '@/utils/scoring'

interface UseTimingOptions {
  exercise: Exercise
  bpm: number
  phase: ExercisePhase
  elapsedMsRef: React.RefObject<number>
  strictMode?: boolean
}

interface TapFeedback {
  judgment: TimingJudgment
  timestamp: number
}

export function useTiming({ exercise, bpm, phase, elapsedMsRef, strictMode }: UseTimingOptions) {
  const [lastTapFeedback, setLastTapFeedback] = useState<TapFeedback | null>(null)
  const [lastFeedbackPad, setLastFeedbackPad] = useState<DrumPad | null>(null)
  const [beatJudgments, setBeatJudgments] = useState<Map<number, TimingJudgment>>(new Map())

  const tapResultsRef = useRef<TapResult[]>([])
  const matchedBeatsRef = useRef<Set<number>>(new Set())
  const beatTimesRef = useRef<number[]>([])
  const feedbackTimeoutRef = useRef<number>(0)

  // Pre-compute beat times whenever exercise/bpm changes
  // We store in ref and recompute on access to keep it current
  const getBeatTimes = useCallback(() => {
    const times = beatTimesMs({ ...exercise, bpm })
    beatTimesRef.current = times
    return times
  }, [exercise, bpm])

  const recordTap = useCallback((pad?: DrumPad) => {
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

    // Attach pad info if provided
    if (pad) {
      result.pad = pad
    }

    // Strict mode: wrong pad = miss
    if (strictMode && pad) {
      const expectedNote = exercise.beats[nearestIndex].note
      if (pad !== expectedNote) {
        result.judgment = 'miss'
        result.expectedPad = expectedNote
      }
    }

    tapResultsRef.current.push(result)
    matchedBeatsRef.current.add(nearestIndex)

    // Update beat judgments map (drives UI)
    setBeatJudgments((prev) => {
      const next = new Map(prev)
      next.set(nearestIndex, result.judgment)
      return next
    })

    setLastTapFeedback({ judgment: result.judgment, timestamp: performance.now() })
    if (pad) {
      setLastFeedbackPad(pad)
    }

    // Auto-clear feedback after 300ms
    clearTimeout(feedbackTimeoutRef.current)
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setLastTapFeedback(null)
      setLastFeedbackPad(null)
    }, 300)
  }, [phase, elapsedMsRef, getBeatTimes, strictMode, exercise.beats])

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
    setLastFeedbackPad(null)
    setBeatJudgments(new Map())
  }, [])

  return {
    tapResults: tapResultsRef.current,
    tapResultsRef,
    lastTapFeedback,
    lastFeedbackPad,
    beatJudgments,
    recordTap,
    finalize,
    reset,
  }
}

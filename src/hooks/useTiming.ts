import { useState, useRef, useCallback } from 'react'
import type { DrumPad, Exercise, ExercisePhase, TapMarker, TapResult, TimingJudgment } from '@/types'
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

/** How long a tap's judgment colour stays lit on a pad. */
export const FEEDBACK_DURATION_MS = 300

export function useTiming({ exercise, bpm, phase, elapsedMsRef, strictMode }: UseTimingOptions) {
  const [lastTapFeedback, setLastTapFeedback] = useState<TapFeedback | null>(null)
  // Per-pad feedback so simultaneous / rapidly alternating pads each flash
  // independently — a single "last pad" would let every new tap steal the
  // flash from the previous one, making the other hand look unresponsive.
  const [padFeedback, setPadFeedback] = useState<Map<string, TapFeedback>>(new Map())
  const [beatJudgments, setBeatJudgments] = useState<Map<number, TimingJudgment>>(new Map())

  const tapResultsRef = useRef<TapResult[]>([])
  const tapMarkersRef = useRef<TapMarker[]>([])
  const matchedBeatsRef = useRef<Set<number>>(new Set())
  const beatTimesRef = useRef<number[]>([])
  const feedbackTimeoutRef = useRef<number>(0)
  const padTimeoutsRef = useRef<Map<string, number>>(new Map())
  const lastTapTimePerPadRef = useRef<Map<string, number>>(new Map())

  // Pre-compute beat times whenever exercise/bpm changes
  // We store in ref and recompute on access to keep it current
  const getBeatTimes = useCallback(() => {
    const times = beatTimesMs({ ...exercise, bpm })
    beatTimesRef.current = times
    return times
  }, [exercise, bpm])

  const recordTap = useCallback((pad?: DrumPad | string) => {
    if (phase !== 'playing') return

    // Per-pad debounce: ignore same-pad taps within 40ms
    const now = performance.now()
    const padKey = pad ?? '__default__'
    const lastTime = lastTapTimePerPadRef.current.get(padKey)
    if (lastTime !== undefined && now - lastTime < 40) return
    lastTapTimePerPadRef.current.set(padKey, now)

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
    tapMarkersRef.current.push({
      ms: tapMs,
      pad: pad,
      judgment: result.judgment,
      expectedPad: result.expectedPad,
      expectedMs: times[nearestIndex],
    })
    matchedBeatsRef.current.add(nearestIndex)

    // Update beat judgments map (drives UI)
    setBeatJudgments((prev) => {
      const next = new Map(prev)
      next.set(nearestIndex, result.judgment)
      return next
    })

    const feedback: TapFeedback = { judgment: result.judgment, timestamp: performance.now() }
    setLastTapFeedback(feedback)

    // Auto-clear the un-padded feedback (used by TapZone)
    clearTimeout(feedbackTimeoutRef.current)
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setLastTapFeedback(null)
    }, FEEDBACK_DURATION_MS)

    if (!pad) return

    // Each pad lights and clears on its own timer, so a fast alternation
    // between two pads leaves both lit rather than one stealing the other.
    setPadFeedback((prev) => new Map(prev).set(pad, feedback))

    clearTimeout(padTimeoutsRef.current.get(pad))
    padTimeoutsRef.current.set(
      pad,
      window.setTimeout(() => {
        padTimeoutsRef.current.delete(pad)
        setPadFeedback((prev) => {
          const next = new Map(prev)
          next.delete(pad)
          return next
        })
      }, FEEDBACK_DURATION_MS)
    )
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
    tapMarkersRef.current = []
    matchedBeatsRef.current = new Set()
    lastTapTimePerPadRef.current = new Map()
    clearTimeout(feedbackTimeoutRef.current)
    padTimeoutsRef.current.forEach((id) => clearTimeout(id))
    padTimeoutsRef.current = new Map()
    setLastTapFeedback(null)
    setPadFeedback(new Map())
    setBeatJudgments(new Map())
  }, [])

  return {
    tapResults: tapResultsRef.current,
    tapResultsRef,
    tapMarkers: tapMarkersRef.current,
    tapMarkersRef,
    lastTapFeedback,
    padFeedback,
    beatJudgments,
    recordTap,
    finalize,
    reset,
  }
}

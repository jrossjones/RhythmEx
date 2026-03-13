import { useState, useRef, useCallback, useEffect } from 'react'
import type { Exercise, TimingJudgment } from '@/types'
import { beatTimesMs, exerciseDurationMs, msPerBeat } from '@/utils/rhythm'
import { LEAD_IN_BEATS } from './useExercise'

export type LearnPhase = 'idle' | 'countdown' | 'active' | 'done'

export function useLearnMode(exercise: Exercise, bpm: number) {
  const [learnPhase, setLearnPhase] = useState<LearnPhase>('idle')
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0)
  const [learnBeatJudgments, setLearnBeatJudgments] = useState<Map<number, TimingJudgment>>(new Map())
  const [wrongPad, setWrongPad] = useState<string | null>(null)
  const [countdownValue, setCountdownValue] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  const wrongPadTimeoutRef = useRef<number>(0)
  const rafIdRef = useRef(0)
  const timeoutIdsRef = useRef<number[]>([])
  const animStartRef = useRef(0)
  const animFromRef = useRef(0)
  const animToRef = useRef(0)
  const animDurationRef = useRef(0)
  const currentBeatIndexRef = useRef(0)

  const exerciseWithBpm = { ...exercise, bpm }
  const times = beatTimesMs(exerciseWithBpm)
  const durationMs = exerciseDurationMs(exerciseWithBpm)

  // Keep ref in sync
  useEffect(() => {
    currentBeatIndexRef.current = currentBeatIndex
  })

  // Compute target progress for a given beat index
  const beatProgress = useCallback((index: number) => {
    if (durationMs <= 0 || times.length === 0) return 0
    return times[Math.min(index, times.length - 1)] / durationMs
  }, [durationMs, times])

  const cleanup = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = 0
    }
    for (const id of timeoutIdsRef.current) {
      clearTimeout(id)
    }
    timeoutIdsRef.current = []
    clearTimeout(wrongPadTimeoutRef.current)
  }, [])

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup])

  const start = useCallback(() => {
    cleanup()

    setCurrentBeatIndex(0)
    currentBeatIndexRef.current = 0
    setLearnBeatJudgments(new Map())
    setWrongPad(null)

    // Start countdown with lead-in animation
    const beatInterval = msPerBeat(bpm)
    const leadInMs = LEAD_IN_BEATS * beatInterval
    const leadInStartProgress = -(leadInMs / durationMs)
    const targetProgress = durationMs > 0 && times.length > 0 ? times[0] / durationMs : 0

    setLearnPhase('countdown')
    setCountdownValue(4)
    setAnimatedProgress(leadInStartProgress)

    // Animate from lead-in start to beat 0 over the lead-in duration
    const startTime = performance.now()
    animStartRef.current = startTime
    animFromRef.current = leadInStartProgress
    animToRef.current = targetProgress
    animDurationRef.current = leadInMs

    const tick = () => {
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / leadInMs, 1)
      const progress = leadInStartProgress + t * (targetProgress - leadInStartProgress)
      setAnimatedProgress(progress)

      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick)
      }
      // When t >= 1, the countdown timeout will transition to active
    }
    rafIdRef.current = requestAnimationFrame(tick)

    // Countdown value updates
    const t1 = window.setTimeout(() => setCountdownValue(3), beatInterval)
    const t2 = window.setTimeout(() => setCountdownValue(2), beatInterval * 2)
    const t3 = window.setTimeout(() => setCountdownValue(1), beatInterval * 3)
    const t4 = window.setTimeout(() => {
      setCountdownValue(0)
      setLearnPhase('active')
    }, beatInterval * 4)
    timeoutIdsRef.current = [t1, t2, t3, t4]
  }, [cleanup, bpm, durationMs, times, beatProgress])

  // Animate between beats on correct tap
  const animateToBeat = useCallback((targetIndex: number) => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = 0
    }

    const fromProgress = beatProgress(targetIndex - 1)
    const toProgress = beatProgress(targetIndex)
    const tweenDuration = msPerBeat(bpm)
    const startTime = performance.now()

    animStartRef.current = startTime
    animFromRef.current = fromProgress
    animToRef.current = toProgress
    animDurationRef.current = tweenDuration

    const tick = () => {
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / tweenDuration, 1)
      // Ease-out for smooth feel
      const eased = 1 - (1 - t) * (1 - t)
      const progress = fromProgress + eased * (toProgress - fromProgress)
      setAnimatedProgress(progress)

      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick)
      }
    }
    rafIdRef.current = requestAnimationFrame(tick)
  }, [beatProgress, bpm])

  const recordLearnTap = useCallback((pad: string) => {
    if (learnPhase !== 'active') return

    const idx = currentBeatIndexRef.current
    const expectedNote = exercise.beats[idx]?.note
    if (!expectedNote) return

    if (pad !== expectedNote) {
      setWrongPad(pad)
      clearTimeout(wrongPadTimeoutRef.current)
      wrongPadTimeoutRef.current = window.setTimeout(() => {
        setWrongPad(null)
      }, 400)
      return
    }

    // Correct tap
    setWrongPad(null)
    clearTimeout(wrongPadTimeoutRef.current)

    setLearnBeatJudgments(prev => {
      const next = new Map(prev)
      next.set(idx, 'on-time')
      return next
    })

    const nextIndex = idx + 1
    currentBeatIndexRef.current = nextIndex
    setCurrentBeatIndex(nextIndex)

    if (nextIndex >= exercise.beats.length) {
      setLearnPhase('done')
    } else {
      animateToBeat(nextIndex)
    }
  }, [learnPhase, exercise.beats, animateToBeat])

  const stop = useCallback(() => {
    cleanup()
    setLearnPhase('idle')
    setCurrentBeatIndex(0)
    currentBeatIndexRef.current = 0
    setLearnBeatJudgments(new Map())
    setWrongPad(null)
    setCountdownValue(0)
    setAnimatedProgress(0)
  }, [cleanup])

  return {
    learnPhase,
    currentBeatIndex,
    learnBeatJudgments,
    wrongPad,
    learnProgress: animatedProgress,
    learnCountdownValue: countdownValue,
    start,
    recordLearnTap,
    stop,
  }
}

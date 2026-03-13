import { useState, useRef, useCallback, useEffect } from 'react'
import type { Exercise, ExercisePhase } from '@/types'
import { exerciseDurationMs, msPerBeat } from '@/utils/rhythm'

export const LEAD_IN_BEATS = 4

export function useExercise(exercise: Exercise, onDone: () => void, initialBpm?: number) {
  const [phase, setPhase] = useState<ExercisePhase>('idle')
  const [countdownValue, setCountdownValue] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [bpm, setBpmState] = useState(initialBpm ?? exercise.bpm)

  const elapsedMsRef = useRef(0)
  const startTimeRef = useRef(0)
  const rafIdRef = useRef(0)
  const timeoutIdsRef = useRef<number[]>([])
  const onDoneRef = useRef(onDone)
  const durationMsRef = useRef(0)
  const phaseDoneFiredRef = useRef(false)
  const onDoneFiredRef = useRef(false)
  const outroDurationMsRef = useRef(0)
  const tickRef = useRef<() => void>(() => {})

  // Build an exercise-like object with the current BPM for duration calc
  const durationMs = exerciseDurationMs({ ...exercise, bpm })

  // Outro: one extra measure of scroll after scoring
  const outroDurationMs = exercise.timeSignature[0] * msPerBeat(bpm)

  // Keep refs in sync via useEffect
  useEffect(() => {
    onDoneRef.current = onDone
  })
  useEffect(() => {
    durationMsRef.current = durationMs
  })
  useEffect(() => {
    outroDurationMsRef.current = outroDurationMs
  })
  useEffect(() => {
    tickRef.current = () => {
      const now = performance.now()
      const elapsed = now - startTimeRef.current
      const dur = durationMsRef.current

      elapsedMsRef.current = elapsed

      // At durationMs: transition phase to stop accepting taps
      if (elapsed >= dur && !phaseDoneFiredRef.current) {
        phaseDoneFiredRef.current = true
        setPhase('done')
      }

      // After outro scroll: fire scoring callback and stop RAF
      if (elapsed >= dur + outroDurationMsRef.current) {
        if (!onDoneFiredRef.current) {
          onDoneFiredRef.current = true
          onDoneRef.current()
        }
        elapsedMsRef.current = elapsed
        setElapsedMs(elapsed)
        return // RAF stops here
      }

      setElapsedMs(elapsed)
      rafIdRef.current = requestAnimationFrame(tickRef.current)
    }
  })

  const cleanup = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = 0
    }
    for (const id of timeoutIdsRef.current) {
      clearTimeout(id)
    }
    timeoutIdsRef.current = []
  }, [])

  const startPlaying = useCallback(() => {
    phaseDoneFiredRef.current = false
    onDoneFiredRef.current = false
    startTimeRef.current = performance.now()
    elapsedMsRef.current = 0
    setElapsedMs(0)
    setPhase('playing')
    rafIdRef.current = requestAnimationFrame(tickRef.current)
  }, [])

  const startExercise = useCallback(() => {
    if (phase !== 'idle') return
    cleanup()

    // Start RAF immediately with negative elapsed time for timeline lead-in
    const beatInterval = msPerBeat(bpm)
    const leadInMs = LEAD_IN_BEATS * beatInterval
    phaseDoneFiredRef.current = false
    onDoneFiredRef.current = false
    startTimeRef.current = performance.now() + leadInMs
    elapsedMsRef.current = -leadInMs
    setElapsedMs(-leadInMs)
    setPhase('countdown')
    setCountdownValue(4)
    rafIdRef.current = requestAnimationFrame(tickRef.current)

    // setTimeout chain still drives countdownValue + phase transition
    const t1 = window.setTimeout(() => setCountdownValue(3), beatInterval)
    const t2 = window.setTimeout(() => setCountdownValue(2), beatInterval * 2)
    const t3 = window.setTimeout(() => setCountdownValue(1), beatInterval * 3)
    const t4 = window.setTimeout(() => {
      setCountdownValue(0)
      setPhase('playing')
    }, beatInterval * 4)

    timeoutIdsRef.current = [t1, t2, t3, t4]
  }, [phase, cleanup, bpm])

  const stopExercise = useCallback(() => {
    cleanup()
    phaseDoneFiredRef.current = false
    onDoneFiredRef.current = false
    setPhase('idle')
    setCountdownValue(0)
    setElapsedMs(0)
    elapsedMsRef.current = 0
  }, [cleanup])

  const restart = useCallback((options?: { seamless?: boolean; newBpm?: number }) => {
    cleanup()
    if (options?.newBpm !== undefined) {
      setBpmState(options.newBpm)
    }
    if (options?.seamless) {
      startPlaying()
    } else {
      const effectiveBpm = options?.newBpm ?? bpm
      const beatInterval = msPerBeat(effectiveBpm)
      const leadInMs = LEAD_IN_BEATS * beatInterval
      phaseDoneFiredRef.current = false
      onDoneFiredRef.current = false
      startTimeRef.current = performance.now() + leadInMs
      elapsedMsRef.current = -leadInMs
      setElapsedMs(-leadInMs)
      setPhase('countdown')
      setCountdownValue(4)
      rafIdRef.current = requestAnimationFrame(tickRef.current)

      const t1 = window.setTimeout(() => setCountdownValue(3), beatInterval)
      const t2 = window.setTimeout(() => setCountdownValue(2), beatInterval * 2)
      const t3 = window.setTimeout(() => setCountdownValue(1), beatInterval * 3)
      const t4 = window.setTimeout(() => {
        setCountdownValue(0)
        setPhase('playing')
      }, beatInterval * 4)
      timeoutIdsRef.current = [t1, t2, t3, t4]
    }
  }, [cleanup, startPlaying, bpm])

  const setBpm = useCallback((newBpm: number) => {
    if (phase !== 'idle') return
    setBpmState(newBpm)
  }, [phase])

  const progress = durationMs > 0 ? Math.max(0, Math.min(elapsedMs / durationMs, 1)) : 0
  const rawProgress = durationMs > 0 ? elapsedMs / durationMs : 0

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup])

  return {
    phase,
    countdownValue,
    elapsedMs,
    elapsedMsRef,
    progress,
    rawProgress,
    bpm,
    setBpm,
    startExercise,
    stopExercise,
    restart,
  }
}

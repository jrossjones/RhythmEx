import { useState, useRef, useCallback, useEffect } from 'react'
import type { Exercise, ExercisePhase } from '@/types'
import { exerciseDurationMs, msPerBeat } from '@/utils/rhythm'

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
  onDoneRef.current = onDone

  // Build an exercise-like object with the current BPM for duration calc
  const durationMs = exerciseDurationMs({ ...exercise, bpm })

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

  const tick = useCallback(() => {
    const now = performance.now()
    const elapsed = now - startTimeRef.current
    elapsedMsRef.current = elapsed

    if (elapsed >= durationMs) {
      elapsedMsRef.current = durationMs
      setElapsedMs(durationMs)
      setPhase('done')
      onDoneRef.current()
      return
    }

    setElapsedMs(elapsed)
    rafIdRef.current = requestAnimationFrame(tick)
  }, [durationMs])

  const startPlaying = useCallback(() => {
    startTimeRef.current = performance.now()
    elapsedMsRef.current = 0
    setElapsedMs(0)
    setPhase('playing')
    rafIdRef.current = requestAnimationFrame(tick)
  }, [tick])

  const startExercise = useCallback(() => {
    if (phase !== 'idle') return
    cleanup()
    setPhase('countdown')
    setCountdownValue(3)

    // Count-in ticks at tempo so the countdown aligns with the metronome
    const beatInterval = msPerBeat(bpm)
    const t1 = window.setTimeout(() => setCountdownValue(2), beatInterval)
    const t2 = window.setTimeout(() => setCountdownValue(1), beatInterval * 2)
    const t3 = window.setTimeout(() => {
      setCountdownValue(0)
      startPlaying()
    }, beatInterval * 3)

    timeoutIdsRef.current = [t1, t2, t3]
  }, [phase, cleanup, startPlaying, bpm])

  const stopExercise = useCallback(() => {
    cleanup()
    setPhase('idle')
    setCountdownValue(0)
    setElapsedMs(0)
    elapsedMsRef.current = 0
  }, [cleanup])

  const setBpm = useCallback((newBpm: number) => {
    if (phase !== 'idle') return
    setBpmState(newBpm)
  }, [phase])

  const progress = durationMs > 0 ? Math.min(elapsedMs / durationMs, 1) : 0

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup])

  return {
    phase,
    countdownValue,
    elapsedMs,
    elapsedMsRef,
    progress,
    bpm,
    setBpm,
    startExercise,
    stopExercise,
  }
}

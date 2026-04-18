import { useEffect, useRef } from 'react'
import { beatTimesMs } from '@/utils/rhythm'
import type { DrumPad, Exercise, ExercisePhase, InstrumentType, StrumDirection } from '@/types'

interface UseDemoModeOptions {
  phase: ExercisePhase
  isDemoMode: boolean
  exercise: Exercise
  bpm: number
  instrument: InstrumentType
  elapsedMsRef: React.RefObject<number>
  playDrum: (pad: DrumPad) => void
  playHandpan: (note: string) => void
  playStrum: (chord: string, direction: StrumDirection) => void
}

export function useDemoMode({
  phase,
  isDemoMode,
  exercise,
  bpm,
  instrument,
  elapsedMsRef,
  playDrum,
  playHandpan,
  playStrum,
}: UseDemoModeOptions): void {
  const playDrumRef = useRef(playDrum)
  const playHandpanRef = useRef(playHandpan)
  const playStrumRef = useRef(playStrum)
  useEffect(() => {
    playDrumRef.current = playDrum
    playHandpanRef.current = playHandpan
    playStrumRef.current = playStrum
  })

  useEffect(() => {
    if (phase !== 'playing' || !isDemoMode) return

    const times = beatTimesMs({ ...exercise, bpm })
    const firedBeats = new Set<number>()
    let rafId: number

    const tick = () => {
      const elapsed = elapsedMsRef.current ?? 0
      for (let i = 0; i < times.length; i++) {
        if (!firedBeats.has(i) && elapsed >= times[i]) {
          firedBeats.add(i)
          if (instrument === 'drums') {
            playDrumRef.current(exercise.beats[i].note as DrumPad)
          } else if (instrument === 'handpan') {
            playHandpanRef.current(exercise.beats[i].note)
          } else if (instrument === 'strumming') {
            playStrumRef.current(
              exercise.beats[i].chord ?? '',
              exercise.beats[i].note as StrumDirection
            )
          }
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [phase, isDemoMode, exercise, bpm, instrument, elapsedMsRef])
}

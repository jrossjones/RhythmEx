import { useEffect, useRef } from 'react'
import { msPerBeat } from '@/utils/rhythm'
import type { Exercise, ExercisePhase } from '@/types'
import type { LearnPhase } from '@/hooks/useLearnMode'

interface UseMetronomeOptions {
  phase: ExercisePhase
  countdownValue: number
  isLearnMode: boolean
  learnPhase: LearnPhase
  learnCountdownValue: number
  bpm: number
  timeSignature: Exercise['timeSignature']
  elapsedMsRef: React.RefObject<number>
  metronomeOn: boolean
  playMetronomeClick: (accent?: boolean) => void
}

export function useMetronome({
  phase,
  countdownValue,
  isLearnMode,
  learnPhase,
  learnCountdownValue,
  bpm,
  timeSignature,
  elapsedMsRef,
  metronomeOn,
  playMetronomeClick,
}: UseMetronomeOptions): void {
  const playMetronomeClickRef = useRef(playMetronomeClick)
  useEffect(() => {
    playMetronomeClickRef.current = playMetronomeClick
  })

  const prevCountdownRef = useRef<number | null>(null)
  const prevLearnCountdownRef = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'countdown') {
      prevCountdownRef.current = null
    } else if (prevCountdownRef.current !== countdownValue) {
      prevCountdownRef.current = countdownValue
      if (metronomeOn) {
        playMetronomeClickRef.current(true)
      }
    }

    if (!isLearnMode || learnPhase !== 'countdown') {
      prevLearnCountdownRef.current = null
    } else if (prevLearnCountdownRef.current !== learnCountdownValue) {
      prevLearnCountdownRef.current = learnCountdownValue
      if (metronomeOn) {
        playMetronomeClickRef.current(true)
      }
    }
  }, [phase, countdownValue, isLearnMode, learnPhase, learnCountdownValue, metronomeOn])

  const lastClickedBeatRef = useRef(-1)

  useEffect(() => {
    if (phase !== 'playing' || !metronomeOn) {
      lastClickedBeatRef.current = -1
      return
    }

    let rafId: number

    const tick = () => {
      const elapsed = elapsedMsRef.current ?? 0
      const beatMs = msPerBeat(bpm)
      const currentBeat = Math.floor(elapsed / beatMs)

      if (currentBeat > lastClickedBeatRef.current) {
        lastClickedBeatRef.current = currentBeat
        const [beatsPerMeasure] = timeSignature
        const isDownbeat = currentBeat % beatsPerMeasure === 0
        playMetronomeClickRef.current(isDownbeat)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [phase, metronomeOn, bpm, elapsedMsRef, timeSignature])
}

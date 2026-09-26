import { useCallback, useEffect, useRef, useState } from 'react'
import { saveResult } from '@/utils/storage'
import { creditResult } from '@/utils/wallet'
import type { ExerciseResult, StarRating } from '@/types'

export interface LoopOverlayState {
  accuracy: number
  stars: StarRating
  nextBpm?: number
}

interface UseLoopModeOptions {
  seamlessLoop: boolean
  onSeamlessRestart: (nextBpm?: number) => void
  onOverlayRestart: (nextBpm?: number) => void
}

export interface UseLoopModeReturn {
  loopOverlay: LoopOverlayState | null
  lastLoopResult: ExerciseResult | null
  /** Stars paid into the wallet across every loop since the last clear. */
  loopStarsEarned: number
  triggerLoopCompletion: (result: ExerciseResult, nextBpm?: number) => void
  dismissOverlay: () => void
  clearLastLoopResult: () => void
}

export function useLoopMode({
  seamlessLoop,
  onSeamlessRestart,
  onOverlayRestart,
}: UseLoopModeOptions): UseLoopModeReturn {
  const [loopOverlay, setLoopOverlay] = useState<LoopOverlayState | null>(null)
  const [lastLoopResult, setLastLoopResult] = useState<ExerciseResult | null>(null)
  const [loopStarsEarned, setLoopStarsEarned] = useState(0)

  const seamlessLoopRef = useRef(seamlessLoop)
  const onSeamlessRestartRef = useRef(onSeamlessRestart)
  const onOverlayRestartRef = useRef(onOverlayRestart)
  useEffect(() => {
    seamlessLoopRef.current = seamlessLoop
    onSeamlessRestartRef.current = onSeamlessRestart
    onOverlayRestartRef.current = onOverlayRestart
  })

  const triggerLoopCompletion = useCallback(
    (result: ExerciseResult, nextBpm?: number) => {
      saveResult(result)
      const earned = creditResult(result)
      setLoopStarsEarned((total) => total + earned)
      setLastLoopResult(result)

      if (seamlessLoopRef.current) {
        onSeamlessRestartRef.current(nextBpm)
      } else {
        setLoopOverlay({ accuracy: result.accuracy, stars: result.stars, nextBpm })
      }
    },
    []
  )

  const dismissOverlay = useCallback(() => {
    setLoopOverlay((current) => {
      if (current) onOverlayRestartRef.current(current.nextBpm)
      return null
    })
  }, [])

  const clearLastLoopResult = useCallback(() => {
    setLastLoopResult(null)
    setLoopStarsEarned(0)
  }, [])

  return { loopOverlay, lastLoopResult, loopStarsEarned, triggerLoopCompletion, dismissOverlay, clearLastLoopResult }
}

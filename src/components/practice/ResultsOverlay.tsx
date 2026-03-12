import { useEffect } from 'react'
import { StarDisplay } from '@/components/ui/StarDisplay'
import type { StarRating } from '@/types'

interface ResultsOverlayProps {
  accuracy: number
  stars: StarRating
  onDismiss: () => void
  speedTrainerNextBpm?: number
}

export function ResultsOverlay({ accuracy, stars, onDismiss, speedTrainerNextBpm }: ResultsOverlayProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 2000)
    return () => clearTimeout(id)
  }, [onDismiss])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/40" data-testid="results-overlay">
      <StarDisplay stars={stars} size="lg" />
      <span className="text-5xl font-extrabold text-white drop-shadow-lg">
        {Math.round(accuracy)}%
      </span>
      {speedTrainerNextBpm !== undefined && (
        <span className="text-lg font-medium text-emerald-300" data-testid="overlay-next-bpm">
          Next: {speedTrainerNextBpm} BPM
        </span>
      )}
    </div>
  )
}

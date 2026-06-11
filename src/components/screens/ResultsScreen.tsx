import { useMemo } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { StarDisplay } from '@/components/ui/StarDisplay'
import { Confetti } from '@/components/ui/Confetti'
import { StickerReveal } from '@/components/ui/StickerReveal'
import { getBestScore } from '@/utils/storage'
import { encouragements } from '@/data/encouragements'
import type { ExerciseResult, StickerDefinition, TimingJudgment } from '@/types'

interface ResultsScreenProps {
  result: ExerciseResult
  exerciseName: string
  onRetry: () => void
  onNewExercise: () => void
  speedTrainerNextBpm?: number
  newStickers?: StickerDefinition[]
}

const judgmentColors: Record<TimingJudgment, string> = {
  'on-time': 'bg-green-500',
  early: 'bg-yellow-500',
  late: 'bg-orange-500',
  miss: 'bg-red-500',
}

const judgmentLabels: Record<TimingJudgment, string> = {
  'on-time': 'On Time',
  early: 'Early',
  late: 'Late',
  miss: 'Miss',
}

export function ResultsScreen({
  result,
  exerciseName,
  onRetry,
  onNewExercise,
  speedTrainerNextBpm,
  newStickers,
}: ResultsScreenProps) {
  const counts = useMemo(() => {
    const c: Record<TimingJudgment, number> = {
      'on-time': 0,
      early: 0,
      late: 0,
      miss: 0,
    }
    for (const tap of result.tapResults) {
      c[tap.judgment]++
    }
    return c
  }, [result.tapResults])

  const totalTaps = result.tapResults.length

  const best = useMemo(
    () => getBestScore(result.exerciseId, result.instrument),
    [result.exerciseId, result.instrument],
  )

  const isNewBest =
    best !== null &&
    best.attempts > 1 &&
    result.accuracy >= best.bestAccuracy

  const isFullCombo = totalTaps > 0 && counts.miss === 0

  // Stable per attempt (timestamp), varies between attempts — no RNG in render.
  const message =
    encouragements[result.stars][result.timestamp % encouragements[result.stars].length]

  return (
    <Layout>
      {result.stars === 3 && <Confetti seed={result.timestamp} />}
      <Navigation title={exerciseName} />

      <div className="flex flex-col items-center gap-6 pt-4 text-center">
        {/* Stars */}
        <StarDisplay stars={result.stars} size="lg" />

        {/* Encouragement */}
        <p className="text-lg font-semibold text-indigo-600" data-testid="encouragement">
          {message}
        </p>

        {/* Accuracy */}
        <p className="text-4xl font-bold text-gray-800">
          {Math.round(result.accuracy)}%
        </p>

        {/* New stickers */}
        {newStickers && newStickers.length > 0 && (
          <StickerReveal stickers={newStickers} />
        )}

        {/* Full Combo badge */}
        {isFullCombo && (
          <span className="rounded-full bg-purple-500 px-4 py-1 text-sm font-bold text-white">
            Full Combo! 💯
          </span>
        )}

        {/* Speed Trainer next BPM hint */}
        {speedTrainerNextBpm !== undefined && (
          <p className="text-sm font-medium text-emerald-600" data-testid="speed-trainer-hint">
            Next: {speedTrainerNextBpm} BPM
          </p>
        )}

        {/* New Best badge */}
        {isNewBest && (
          <span className="rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-yellow-900">
            New Best!
          </span>
        )}

        {/* Tap breakdown */}
        {totalTaps > 0 && (
          <div className="w-full max-w-sm">
            {/* Stacked bar */}
            <div className="mb-3 flex h-6 overflow-hidden rounded-full">
              {(['on-time', 'early', 'late', 'miss'] as TimingJudgment[]).map(
                (judgment) => {
                  const pct = (counts[judgment] / totalTaps) * 100
                  if (pct === 0) return null
                  return (
                    <div
                      key={judgment}
                      className={`${judgmentColors[judgment]}`}
                      style={{ width: `${pct}%` }}
                    />
                  )
                },
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {(['on-time', 'early', 'late', 'miss'] as TimingJudgment[]).map(
                (judgment) => (
                  <div key={judgment} className="flex items-center gap-2">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${judgmentColors[judgment]}`}
                    />
                    <span className="text-gray-600">
                      {judgmentLabels[judgment]}: {counts[judgment]}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Personal best */}
        {best !== null && best.attempts > 1 && !isNewBest && (
          <div className="text-sm text-gray-500">
            Personal best: {Math.round(best.bestAccuracy)}%
          </div>
        )}

        {/* Effort */}
        {best !== null && best.attempts > 1 && (
          <p className="text-sm text-gray-500" data-testid="try-count">
            That was try #{best.attempts} — keep it up!
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onNewExercise}>
            New Exercise
          </Button>
          <Button onClick={onRetry}>Retry</Button>
        </div>
      </div>
    </Layout>
  )
}

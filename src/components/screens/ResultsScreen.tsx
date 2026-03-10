import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { StarDisplay } from '@/components/ui/StarDisplay'
import type { ExerciseResult } from '@/types'

interface ResultsScreenProps {
  result: ExerciseResult
  onRetry: () => void
  onNewExercise: () => void
}

export function ResultsScreen({ result, onRetry, onNewExercise }: ResultsScreenProps) {
  return (
    <Layout>
      <Navigation title="Results" />
      <div className="flex flex-col items-center gap-6 pt-8 text-center">
        <StarDisplay stars={result.stars} size="lg" />
        <p className="text-3xl font-bold text-gray-800">
          {Math.round(result.accuracy)}% Accuracy
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onNewExercise}>
            New Exercise
          </Button>
          <Button onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    </Layout>
  )
}

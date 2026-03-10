import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import type { Exercise, ExerciseResult, InstrumentType } from '@/types'

interface PracticeScreenProps {
  exercise: Exercise
  instrument: InstrumentType
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}

export function PracticeScreen({ exercise, instrument, onFinish, onBack }: PracticeScreenProps) {
  const handleFakePractice = () => {
    // Placeholder: simulate a completed exercise
    onFinish({
      exerciseId: exercise.id,
      instrument,
      accuracy: 85,
      stars: 2,
      tapResults: [],
      timestamp: Date.now(),
    })
  }

  return (
    <Layout>
      <Navigation title={exercise.name} onBack={onBack} />
      <div className="flex flex-col items-center gap-6 pt-8 text-center">
        <p className="text-gray-500">
          {exercise.bpm} BPM &middot; {exercise.measures} measures &middot; {instrument}
        </p>
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <p className="text-lg text-gray-400">
            Practice UI coming soon...
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleFakePractice}>
            Finish (Demo)
          </Button>
        </div>
      </div>
    </Layout>
  )
}

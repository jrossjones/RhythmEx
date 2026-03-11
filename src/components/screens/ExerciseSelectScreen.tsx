import { useState } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { StarDisplay } from '@/components/ui/StarDisplay'
import { exercisesByDifficulty } from '@/data/exercises'
import { getBestScore } from '@/utils/storage'
import type { Difficulty, Exercise, InstrumentType } from '@/types'

interface ExerciseSelectScreenProps {
  instrument: InstrumentType
  onSelect: (exercise: Exercise) => void
  onBack: () => void
}

const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced']

const difficultyColors: Record<Difficulty, string> = {
  beginner: 'bg-green-500',
  intermediate: 'bg-yellow-500',
  advanced: 'bg-red-500',
}

export function ExerciseSelectScreen({ instrument, onSelect, onBack }: ExerciseSelectScreenProps) {
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>('beginner')
  const exercises = exercisesByDifficulty(activeDifficulty)

  return (
    <Layout>
      <Navigation title="Choose Exercise" onBack={onBack} />

      <div className="mb-6 flex gap-2">
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDifficulty(d)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors cursor-pointer ${
              activeDifficulty === d
                ? `${difficultyColors[d]} text-white`
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {exercises.map((exercise) => {
          const best = getBestScore(exercise.id, instrument)
          return (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise)}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer text-left"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{exercise.name}</h3>
                <p className="text-sm text-gray-500">{exercise.bpm} BPM</p>
              </div>
              <StarDisplay stars={best?.bestStars ?? 0} size="sm" />
            </button>
          )
        })}
      </div>
    </Layout>
  )
}

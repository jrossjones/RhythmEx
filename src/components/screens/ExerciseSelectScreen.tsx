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

const difficultyHeaderColors: Record<Difficulty, string> = {
  beginner: 'bg-green-500',
  intermediate: 'bg-yellow-500',
  advanced: 'bg-red-500',
}

export function ExerciseSelectScreen({ instrument, onSelect, onBack }: ExerciseSelectScreenProps) {
  return (
    <Layout>
      <Navigation title="Choose Exercise" onBack={onBack} />

      <div className="flex flex-col gap-6">
        {difficulties.map((d) => {
          const exercises = exercisesByDifficulty(d, instrument)
          if (exercises.length === 0) return null
          return (
            <section key={d} data-testid={`difficulty-section-${d}`}>
              <h2
                className={`mb-2 rounded-xl px-4 py-2 text-lg font-bold capitalize text-white ${difficultyHeaderColors[d]}`}
              >
                {d}
              </h2>
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
            </section>
          )
        })}
      </div>
    </Layout>
  )
}

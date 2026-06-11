import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { StarDisplay } from '@/components/ui/StarDisplay'
import { exercisesByDifficulty } from '@/data/exercises'
import { getBestScore } from '@/utils/storage'
import { dailyChallengeExercise, surpriseExercise, localDateStr } from '@/utils/generator'
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

// Evaluated once at module load — avoids impure Date calls during render
const today = localDateStr(new Date())

export function ExerciseSelectScreen({ instrument, onSelect, onBack }: ExerciseSelectScreenProps) {
  return (
    <Layout>
      <Navigation title="Choose Exercise" onBack={onBack} />

      <div className="flex flex-col gap-6">
        <button
          onClick={() => onSelect(dailyChallengeExercise(instrument, today))}
          className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer text-left"
          data-testid="daily-challenge"
        >
          <div>
            <h3 className="font-bold text-white">📅 Daily Challenge</h3>
            <p className="text-sm text-indigo-100">A new rhythm every day!</p>
          </div>
          <StarDisplay
            stars={getBestScore(`daily-${today}`, instrument)?.bestStars ?? 0}
            size="sm"
          />
        </button>

        {difficulties.map((d) => {
          const exercises = exercisesByDifficulty(d, instrument)
          if (exercises.length === 0) return null
          return (
            <section key={d} data-testid={`difficulty-section-${d}`}>
              <div
                className={`mb-2 flex items-center justify-between rounded-xl px-4 py-2 ${difficultyHeaderColors[d]}`}
              >
                <h2 className="text-lg font-bold capitalize text-white">{d}</h2>
                <button
                  onClick={() => onSelect(surpriseExercise(instrument, d))}
                  className="rounded-lg bg-white/20 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/30 cursor-pointer"
                  data-testid={`surprise-me-${d}`}
                >
                  Surprise Me! 🎲
                </button>
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
            </section>
          )
        })}
      </div>
    </Layout>
  )
}

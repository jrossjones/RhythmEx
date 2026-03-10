import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { BeatTimeline } from '@/components/practice/BeatTimeline'
import { CountdownOverlay } from '@/components/practice/CountdownOverlay'
import { useExercise } from '@/hooks/useExercise'
import type { Exercise, ExerciseResult, InstrumentType } from '@/types'

interface PracticeScreenProps {
  exercise: Exercise
  instrument: InstrumentType
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}

export function PracticeScreen({ exercise, instrument, onFinish, onBack }: PracticeScreenProps) {
  const handleDone = () => {
    // Placeholder result — real scoring comes in Phase 3
    onFinish({
      exerciseId: exercise.id,
      instrument,
      accuracy: 85,
      stars: 2,
      tapResults: [],
      timestamp: Date.now(),
    })
  }

  const {
    phase,
    countdownValue,
    progress,
    bpm,
    setBpm,
    startExercise,
    stopExercise,
  } = useExercise(exercise, handleDone)

  const isIdle = phase === 'idle'

  const handleBack = () => {
    stopExercise()
    onBack()
  }

  return (
    <Layout>
      <Navigation title={exercise.name} onBack={handleBack} />

      {/* Exercise info */}
      <p className="mb-4 text-center text-gray-500">
        {bpm} BPM &middot; {exercise.measures} measures &middot; {instrument}
      </p>

      {/* BPM controls */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          disabled={!isIdle || bpm <= 40}
          onClick={() => setBpm(bpm - 5)}
        >
          &minus;
        </Button>
        <span className="w-20 text-center text-xl font-bold text-gray-700">
          {bpm} BPM
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isIdle || bpm >= 200}
          onClick={() => setBpm(bpm + 5)}
        >
          +
        </Button>
      </div>

      {/* Beat timeline */}
      <div className="mb-6">
        <BeatTimeline exercise={exercise} progress={progress} bpm={bpm} />
      </div>

      {/* Instrument placeholder */}
      <div className="mb-6 rounded-2xl bg-white/60 p-6 text-center text-gray-400">
        Tap input coming in Phase 3...
      </div>

      {/* Action area */}
      <div className="flex justify-center">
        {isIdle && (
          <Button size="lg" onClick={startExercise}>
            Start
          </Button>
        )}
        {phase === 'playing' && (
          <Button variant="secondary" size="sm" onClick={stopExercise}>
            Stop
          </Button>
        )}
      </div>

      {/* Countdown overlay */}
      {phase === 'countdown' && <CountdownOverlay value={countdownValue} />}
    </Layout>
  )
}

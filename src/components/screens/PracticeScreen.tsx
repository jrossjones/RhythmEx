import { useRef } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { BeatTimeline } from '@/components/practice/BeatTimeline'
import { TapZone } from '@/components/practice/TapZone'
import { CountdownOverlay } from '@/components/practice/CountdownOverlay'
import { useExercise } from '@/hooks/useExercise'
import { useTiming } from '@/hooks/useTiming'
import { calculateAccuracy, calculateStars } from '@/utils/scoring'
import type { Exercise, ExerciseResult, InstrumentType, TapResult } from '@/types'

interface PracticeScreenProps {
  exercise: Exercise
  instrument: InstrumentType
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}

export function PracticeScreen({ exercise, instrument, onFinish, onBack }: PracticeScreenProps) {
  // Ref to hold finalize — breaks circular dependency between useExercise and useTiming
  const finalizeRef = useRef<() => TapResult[]>(() => [])

  const handleDone = () => {
    const tapResults = finalizeRef.current()
    const accuracy = calculateAccuracy(tapResults)
    const stars = calculateStars(accuracy)

    onFinish({
      exerciseId: exercise.id,
      instrument,
      accuracy,
      stars,
      tapResults,
      timestamp: Date.now(),
    })
  }

  const {
    phase,
    countdownValue,
    progress,
    bpm,
    setBpm,
    elapsedMsRef,
    startExercise,
    stopExercise,
  } = useExercise(exercise, handleDone)

  const {
    lastTapFeedback,
    beatJudgments,
    recordTap,
    finalize,
    reset,
  } = useTiming({ exercise, bpm, phase, elapsedMsRef })

  // Keep ref up to date so handleDone always calls the latest finalize
  finalizeRef.current = finalize

  const isIdle = phase === 'idle'

  const handleStop = () => {
    stopExercise()
    reset()
  }

  const handleBack = () => {
    stopExercise()
    reset()
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
        <BeatTimeline
          exercise={exercise}
          progress={progress}
          bpm={bpm}
          beatJudgments={beatJudgments}
        />
      </div>

      {/* Tap zone */}
      <div className="mb-6">
        <TapZone
          onTap={recordTap}
          lastFeedback={lastTapFeedback}
          disabled={phase !== 'playing'}
        />
      </div>

      {/* Action area */}
      <div className="flex justify-center">
        {isIdle && (
          <Button size="lg" onClick={startExercise}>
            Start
          </Button>
        )}
        {phase === 'playing' && (
          <Button variant="secondary" size="sm" onClick={handleStop}>
            Stop
          </Button>
        )}
      </div>

      {/* Countdown overlay */}
      {phase === 'countdown' && <CountdownOverlay value={countdownValue} />}
    </Layout>
  )
}

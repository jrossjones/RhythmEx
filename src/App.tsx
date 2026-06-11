import { useState } from 'react'
import { HomeScreen } from '@/components/screens/HomeScreen'
import { InstrumentSelectScreen } from '@/components/screens/InstrumentSelectScreen'
import { ExerciseSelectScreen } from '@/components/screens/ExerciseSelectScreen'
import { PracticeScreen } from '@/components/screens/PracticeScreen'
import { ResultsScreen } from '@/components/screens/ResultsScreen'
import { StickerBookScreen } from '@/components/screens/StickerBookScreen'
import { saveResult } from '@/utils/storage'
import { evaluateAndStoreAchievements } from '@/utils/achievements'
import type { AppState, InstrumentType, Exercise, ExerciseResult } from '@/types'

const initialState: AppState = {
  screen: 'home',
  selectedInstrument: null,
  selectedExercise: null,
  lastResult: null,
  newStickers: null,
}

export function App() {
  const [state, setState] = useState<AppState>(initialState)
  const [speedTrainerBpm, setSpeedTrainerBpm] = useState<number | null>(null)

  const navigate = (screen: AppState['screen']) => {
    setState((prev) => ({ ...prev, screen, newStickers: null }))
  }

  const selectInstrument = (instrument: InstrumentType) => {
    setState((prev) => ({ ...prev, selectedInstrument: instrument, screen: 'exercise-select' }))
  }

  const selectExercise = (exercise: Exercise) => {
    setSpeedTrainerBpm(null)
    setState((prev) => ({
      ...prev,
      selectedExercise: exercise,
      screen: 'practice',
      newStickers: null,
    }))
  }

  const finishExercise = (result: ExerciseResult) => {
    saveResult(result)
    const newStickers = evaluateAndStoreAchievements(result)
    setState((prev) => ({ ...prev, lastResult: result, screen: 'results', newStickers }))
  }

  // Loop-exit path: per-loop results were already saved by useLoopMode
  const showResults = (result: ExerciseResult) => {
    const newStickers = evaluateAndStoreAchievements(result)
    setState((prev) => ({ ...prev, lastResult: result, screen: 'results', newStickers }))
  }

  switch (state.screen) {
    case 'home':
      return (
        <HomeScreen
          onStart={() => navigate('instrument-select')}
          onStickerBook={() => navigate('sticker-book')}
        />
      )

    case 'sticker-book':
      return <StickerBookScreen onBack={() => navigate('home')} />

    case 'instrument-select':
      return (
        <InstrumentSelectScreen
          onSelect={selectInstrument}
          onBack={() => navigate('home')}
        />
      )

    case 'exercise-select':
      return (
        <ExerciseSelectScreen
          instrument={state.selectedInstrument!}
          onSelect={selectExercise}
          onBack={() => navigate('instrument-select')}
        />
      )

    case 'practice':
      return (
        <PracticeScreen
          exercise={state.selectedExercise!}
          instrument={state.selectedInstrument!}
          onFinish={finishExercise}
          onBack={() => navigate('exercise-select')}
          initialBpm={speedTrainerBpm ?? undefined}
          onSpeedTrainerBpmChange={setSpeedTrainerBpm}
          onShowResults={showResults}
        />
      )

    case 'results':
      return (
        <ResultsScreen
          result={state.lastResult!}
          exerciseName={state.selectedExercise!.name}
          onRetry={() => navigate('practice')}
          onNewExercise={() => navigate('exercise-select')}
          speedTrainerNextBpm={speedTrainerBpm ?? undefined}
          newStickers={state.newStickers ?? undefined}
        />
      )
  }
}

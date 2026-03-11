import { useState } from 'react'
import { HomeScreen } from '@/components/screens/HomeScreen'
import { InstrumentSelectScreen } from '@/components/screens/InstrumentSelectScreen'
import { ExerciseSelectScreen } from '@/components/screens/ExerciseSelectScreen'
import { PracticeScreen } from '@/components/screens/PracticeScreen'
import { ResultsScreen } from '@/components/screens/ResultsScreen'
import { saveResult } from '@/utils/storage'
import type { AppState, InstrumentType, Exercise, ExerciseResult } from '@/types'

const initialState: AppState = {
  screen: 'home',
  selectedInstrument: null,
  selectedExercise: null,
  lastResult: null,
}

export function App() {
  const [state, setState] = useState<AppState>(initialState)
  const [speedTrainerBpm, setSpeedTrainerBpm] = useState<number | null>(null)

  const navigate = (screen: AppState['screen']) => {
    setState((prev) => ({ ...prev, screen }))
  }

  const selectInstrument = (instrument: InstrumentType) => {
    setState((prev) => ({ ...prev, selectedInstrument: instrument, screen: 'exercise-select' }))
  }

  const selectExercise = (exercise: Exercise) => {
    setSpeedTrainerBpm(null)
    setState((prev) => ({ ...prev, selectedExercise: exercise, screen: 'practice' }))
  }

  const finishExercise = (result: ExerciseResult) => {
    saveResult(result)
    setState((prev) => ({ ...prev, lastResult: result, screen: 'results' }))
  }

  switch (state.screen) {
    case 'home':
      return <HomeScreen onStart={() => navigate('instrument-select')} />

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
        />
      )
  }
}

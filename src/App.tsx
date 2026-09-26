import { useState } from 'react'
import { HomeScreen } from '@/components/screens/HomeScreen'
import { InstrumentSelectScreen } from '@/components/screens/InstrumentSelectScreen'
import { ExerciseSelectScreen } from '@/components/screens/ExerciseSelectScreen'
import { PracticeScreen } from '@/components/screens/PracticeScreen'
import { ResultsScreen } from '@/components/screens/ResultsScreen'
import { StickerBookScreen } from '@/components/screens/StickerBookScreen'
import { ShopScreen } from '@/components/screens/ShopScreen'
import { ProfilePickerScreen } from '@/components/screens/ProfilePickerScreen'
import { ProfileCreateScreen, type NewPlayer } from '@/components/screens/ProfileCreateScreen'
import { saveResult, loadProfiles, loadWallet, setActiveProfileId } from '@/utils/storage'
import { creditResult } from '@/utils/wallet'
import { loadLook } from '@/utils/wardrobe'
import { createProfile, deleteProfile, hasLegacyProgress } from '@/utils/profiles'
import { evaluateAndStoreAchievements } from '@/utils/achievements'
import type { AppState, InstrumentType, Exercise, ExerciseResult } from '@/types'

const initialState: AppState = {
  screen: 'home',
  selectedInstrument: null,
  selectedExercise: null,
  lastResult: null,
  newStickers: null,
  starsEarned: null,
}

// A lone player skips the picker; with several, siblings must pick themselves.
function initialProfileId(): string | null {
  const profiles = loadProfiles()
  if (profiles.length !== 1) return null
  setActiveProfileId(profiles[0].id)
  return profiles[0].id
}

export function App() {
  const [state, setState] = useState<AppState>(initialState)
  const [speedTrainerBpm, setSpeedTrainerBpm] = useState<number | null>(null)
  const [profiles, setProfiles] = useState(loadProfiles)
  const [profileId, setProfileId] = useState(initialProfileId)
  const [creatingProfile, setCreatingProfile] = useState(false)
  const profile = profiles.find((p) => p.id === profileId)

  const login = (id: string) => {
    setActiveProfileId(id)
    setProfileId(id)
    setState(initialState)
    setSpeedTrainerBpm(null)
  }

  const handleCreateProfile = (player: NewPlayer) => {
    const created = createProfile(player)
    setProfiles(loadProfiles())
    setCreatingProfile(false)
    login(created.id)
  }

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id)
    setProfiles(loadProfiles())
  }

  if (!profile) {
    if (profiles.length === 0 || creatingProfile) {
      return (
        <ProfileCreateScreen
          onCreate={handleCreateProfile}
          onCancel={profiles.length > 0 ? () => setCreatingProfile(false) : undefined}
          keepsProgress={profiles.length === 0 && hasLegacyProgress()}
        />
      )
    }
    return (
      <ProfilePickerScreen
        profiles={profiles}
        onLogin={login}
        onNewPlayer={() => setCreatingProfile(true)}
        onDelete={handleDeleteProfile}
      />
    )
  }

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
    const starsEarned = creditResult(result)
    const newStickers = evaluateAndStoreAchievements(result)
    setState((prev) => ({ ...prev, lastResult: result, screen: 'results', newStickers, starsEarned }))
  }

  // Loop-exit path: per-loop results were already saved and paid by useLoopMode
  const showResults = (result: ExerciseResult, starsEarned: number) => {
    const newStickers = evaluateAndStoreAchievements(result)
    setState((prev) => ({ ...prev, lastResult: result, screen: 'results', newStickers, starsEarned }))
  }

  switch (state.screen) {
    case 'home':
      return (
        <HomeScreen
          playerName={profile.name}
          balance={loadWallet().balance}
          look={loadLook()}
          onStart={() => navigate('instrument-select')}
          onStickerBook={() => navigate('sticker-book')}
          onShop={() => navigate('shop')}
          onPlayers={() => setProfileId(null)}
        />
      )

    case 'sticker-book':
      return <StickerBookScreen onBack={() => navigate('home')} />

    case 'shop':
      return <ShopScreen onBack={() => navigate('home')} />

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
          starsEarned={state.starsEarned ?? undefined}
          look={loadLook()}
        />
      )
  }
}

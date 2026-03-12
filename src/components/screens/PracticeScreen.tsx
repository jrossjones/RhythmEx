import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { BeatTimeline } from '@/components/practice/BeatTimeline'
import { TapZone } from '@/components/practice/TapZone'
import { DrumPad } from '@/components/instruments/DrumPad'
import { HandpanPad } from '@/components/instruments/HandpanPad'
import { CountdownOverlay } from '@/components/practice/CountdownOverlay'
import { ResultsOverlay } from '@/components/practice/ResultsOverlay'
import { SettingsPopover } from '@/components/practice/SettingsPopover'
import { useExercise } from '@/hooks/useExercise'
import { useTiming } from '@/hooks/useTiming'
import { useAudio } from '@/hooks/useAudio'
import { calculateAccuracy, calculateStars } from '@/utils/scoring'
import { exerciseDrumPads, msPerBeat } from '@/utils/rhythm'
import { getScale, DEFAULT_HANDPAN_SCALE } from '@/data/handpan/scales'
import { saveResult } from '@/utils/storage'
import type { DrumPad as DrumPadType, Exercise, ExerciseResult, InstrumentType, PracticeSettings, StarRating, TapResult } from '@/types'

interface PracticeScreenProps {
  exercise: Exercise
  instrument: InstrumentType
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
  initialBpm?: number
  onSpeedTrainerBpmChange?: (nextBpm: number | null) => void
  onShowResults?: (result: ExerciseResult) => void
}

export function PracticeScreen({ exercise, instrument, onFinish, onBack, initialBpm, onSpeedTrainerBpmChange, onShowResults }: PracticeScreenProps) {
  const [settings, setSettings] = useState<PracticeSettings>({
    metronomeOn: true,
    tapSoundOn: true,
    strictMode: false,
    speedTrainerOn: false,
    loopMode: false,
    seamlessLoop: false,
    speedTrainerStep: 5,
  })

  const [loopOverlay, setLoopOverlay] = useState<{
    accuracy: number
    stars: StarRating
    nextBpm?: number
  } | null>(null)
  const [lastLoopResult, setLastLoopResult] = useState<ExerciseResult | null>(null)

  const { playDrum, playHandpan, playMetronomeClick, startAudioContext } = useAudio()

  // Refs to break circular dependency between useExercise and useTiming/settings
  const finalizeRef = useRef<() => TapResult[]>(() => [])
  const resetRef = useRef<() => void>(() => {})
  const restartRef = useRef<(options?: { seamless?: boolean; newBpm?: number }) => void>(() => {})
  const settingsRef = useRef(settings)
  const currentBpmRef = useRef(0)
  const onSpeedTrainerBpmChangeRef = useRef(onSpeedTrainerBpmChange)

  const handleDone = () => {
    const tapResults = finalizeRef.current()
    const accuracy = calculateAccuracy(tapResults)
    const stars = calculateStars(accuracy)
    const bpmNow = currentBpmRef.current
    const callback = onSpeedTrainerBpmChangeRef.current
    const currentSettings = settingsRef.current

    // Compute speed trainer next BPM
    let nextBpm: number | undefined
    if (currentSettings.speedTrainerOn) {
      if (accuracy >= 95) {
        nextBpm = Math.min(bpmNow + currentSettings.speedTrainerStep, 200)
      } else {
        nextBpm = bpmNow
      }
    }

    if (currentSettings.loopMode) {
      // Loop mode: save result directly, restart
      const result: ExerciseResult = {
        exerciseId: exercise.id,
        instrument,
        accuracy,
        stars,
        tapResults,
        timestamp: Date.now(),
      }
      saveResult(result)
      setLastLoopResult(result)

      // Update speed trainer BPM in App
      if (currentSettings.speedTrainerOn && callback) {
        callback(nextBpm!)
      }

      if (currentSettings.seamlessLoop) {
        resetRef.current()
        restartRef.current({ seamless: true, newBpm: nextBpm })
      } else {
        setLoopOverlay({ accuracy, stars, nextBpm })
        // Overlay auto-dismisses after 2s, then restart
      }
    } else {
      // Normal mode: navigate to results
      if (currentSettings.speedTrainerOn && callback) {
        callback(nextBpm!)
      } else if (callback) {
        callback(null)
      }

      onFinish({
        exerciseId: exercise.id,
        instrument,
        accuracy,
        stars,
        tapResults,
        timestamp: Date.now(),
      })
    }
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
    restart,
  } = useExercise(exercise, handleDone, initialBpm)

  // Keep refs in sync — must be in useEffect per react-hooks/refs rule
  useEffect(() => {
    settingsRef.current = settings
    currentBpmRef.current = bpm
    onSpeedTrainerBpmChangeRef.current = onSpeedTrainerBpmChange
  })

  const {
    lastTapFeedback,
    lastFeedbackPad,
    beatJudgments,
    tapMarkers,
    recordTap,
    finalize,
    reset,
  } = useTiming({ exercise, bpm, phase, elapsedMsRef, strictMode: settings.strictMode })

  // Keep refs up to date so handleDone always calls the latest versions
  useEffect(() => {
    finalizeRef.current = finalize
    resetRef.current = reset
    restartRef.current = restart
  })

  const handleLoopOverlayDismiss = useCallback(() => {
    setLoopOverlay(null)
    resetRef.current()
    restartRef.current({ newBpm: loopOverlay?.nextBpm })
  }, [loopOverlay?.nextBpm])

  const isIdle = phase === 'idle'

  // Derive active pads and next expected pad for drums
  const activePads = useMemo(() => exerciseDrumPads(exercise), [exercise])

  const nextExpectedPad = useMemo((): DrumPadType | null => {
    for (let i = 0; i < exercise.beats.length; i++) {
      if (!beatJudgments.has(i)) {
        return exercise.beats[i].note as DrumPadType
      }
    }
    return null
  }, [exercise.beats, beatJudgments])

  // Derive handpan notes and next expected note
  const handpanScaleNotes = useMemo(() => {
    const scaleId = exercise.scale ?? DEFAULT_HANDPAN_SCALE
    const scale = getScale(scaleId)
    return scale?.notes ?? []
  }, [exercise.scale])

  const nextExpectedNote = useMemo((): string | null => {
    for (let i = 0; i < exercise.beats.length; i++) {
      if (!beatJudgments.has(i)) {
        return exercise.beats[i].note
      }
    }
    return null
  }, [exercise.beats, beatJudgments])

  // Drum tap handler
  const handleDrumTap = useCallback((pad: DrumPadType) => {
    if (settings.tapSoundOn) playDrum(pad)
    recordTap(pad)
  }, [settings.tapSoundOn, playDrum, recordTap])

  // Handpan tap handler
  const handleHandpanTap = useCallback((note: string) => {
    if (settings.tapSoundOn) playHandpan(note)
    recordTap(note)
  }, [settings.tapSoundOn, playHandpan, recordTap])

  // Start with audio context
  const handleStart = useCallback(async () => {
    await startAudioContext()
    startExercise()
  }, [startAudioContext, startExercise])

  const handleStop = () => {
    stopExercise()
    reset()
    // If we have a last loop result, show full results screen
    if (lastLoopResult && onShowResults) {
      onShowResults(lastLoopResult)
      return
    }
  }

  const handleBack = () => {
    stopExercise()
    reset()
    onBack()
  }

  // Manual BPM change resets speed trainer
  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm)
    if (onSpeedTrainerBpmChange) {
      onSpeedTrainerBpmChange(null)
    }
  }

  // Metronome — countdown clicks
  const playMetronomeClickRef = useRef(playMetronomeClick)
  useEffect(() => {
    playMetronomeClickRef.current = playMetronomeClick
  })
  const prevCountdownRef = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'countdown') {
      prevCountdownRef.current = null
      return
    }
    // Fire on each distinct countdownValue change during countdown
    if (prevCountdownRef.current !== countdownValue) {
      prevCountdownRef.current = countdownValue
      if (settings.metronomeOn) {
        playMetronomeClickRef.current(true)
      }
    }
  }, [phase, countdownValue, settings.metronomeOn])

  // Metronome — beat clicks during playing
  useEffect(() => {
    if (phase !== 'playing' || !settings.metronomeOn) return

    const beatMs = msPerBeat(bpm)
    let lastClickedBeat = -1
    let rafId: number

    const tick = () => {
      const elapsed = elapsedMsRef.current
      const currentBeat = Math.floor(elapsed / beatMs)

      if (currentBeat > lastClickedBeat) {
        lastClickedBeat = currentBeat
        const [beatsPerMeasure] = exercise.timeSignature
        const isDownbeat = currentBeat % beatsPerMeasure === 0
        playMetronomeClickRef.current(isDownbeat)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [phase, settings.metronomeOn, bpm, elapsedMsRef, exercise.timeSignature])

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <Navigation title={exercise.name} onBack={handleBack} />
        <div className="flex items-center gap-2">
          {settings.loopMode && (
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700">
              Loop
            </span>
          )}
          {settings.speedTrainerOn && (
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
              Speed Trainer
            </span>
          )}
          <SettingsPopover
            settings={settings}
            onSettingsChange={setSettings}
            disabled={!isIdle}
          />
        </div>
      </div>

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
          onClick={() => handleBpmChange(bpm - 5)}
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
          onClick={() => handleBpmChange(bpm + 5)}
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
          instrument={instrument}
          tapMarkers={tapMarkers}
        />
      </div>

      {/* Tap input area */}
      <div className="mb-6">
        {instrument === 'drums' ? (
          <DrumPad
            onTap={handleDrumTap}
            lastFeedback={lastTapFeedback}
            lastFeedbackPad={lastFeedbackPad as DrumPadType | null}
            disabled={phase !== 'playing'}
            activePads={activePads}
            nextExpectedPad={nextExpectedPad}
          />
        ) : instrument === 'handpan' ? (
          <HandpanPad
            onTap={handleHandpanTap}
            lastFeedback={lastTapFeedback}
            lastFeedbackPad={lastFeedbackPad}
            disabled={phase !== 'playing'}
            scaleNotes={handpanScaleNotes}
            nextExpectedNote={nextExpectedNote}
          />
        ) : (
          <TapZone
            onTap={recordTap}
            lastFeedback={lastTapFeedback}
            disabled={phase !== 'playing'}
          />
        )}
      </div>

      {/* Action area */}
      <div className="flex justify-center">
        {isIdle && (
          <Button size="lg" onClick={handleStart}>
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

      {/* Loop results overlay */}
      {loopOverlay && (
        <ResultsOverlay
          accuracy={loopOverlay.accuracy}
          stars={loopOverlay.stars}
          onDismiss={handleLoopOverlayDismiss}
          speedTrainerNextBpm={loopOverlay.nextBpm}
        />
      )}
    </Layout>
  )
}

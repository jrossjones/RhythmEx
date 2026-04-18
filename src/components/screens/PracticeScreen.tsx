import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { VerticalTimeline } from '@/components/practice/VerticalTimeline'
import { TapZone } from '@/components/practice/TapZone'
import { DrumPad } from '@/components/instruments/DrumPad'
import { HandpanPad } from '@/components/instruments/HandpanPad'
import { StrumZone } from '@/components/instruments/StrumZone'
import { ResultsOverlay } from '@/components/practice/ResultsOverlay'
import { SettingsPopover } from '@/components/practice/SettingsPopover'
import { useExercise, LEAD_IN_BEATS } from '@/hooks/useExercise'
import { useTiming } from '@/hooks/useTiming'
import { useLearnMode } from '@/hooks/useLearnMode'
import { useAudio } from '@/hooks/useAudio'
import { useMetronome } from '@/hooks/useMetronome'
import { useDemoMode } from '@/hooks/useDemoMode'
import { useLoopMode } from '@/hooks/useLoopMode'
import { calculateAccuracy, calculateStars } from '@/utils/scoring'
import { beatTimesMs, exerciseDrumPads, exerciseDurationMs, msPerBeat } from '@/utils/rhythm'
import { getScale, DEFAULT_HANDPAN_SCALE } from '@/data/handpan/scales'
import type { DrumPad as DrumPadType, Exercise, ExerciseResult, InstrumentType, PracticeSettings, StrumDirection, TapResult } from '@/types'

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

  const [isDemoMode, setIsDemoMode] = useState(false)
  const isDemoModeRef = useRef(false)

  const [isLearnMode, setIsLearnMode] = useState(false)

  const { playDrum, playHandpan, playStrum, playMetronomeClick, startAudioContext } = useAudio()

  // Refs to break circular dependency between useExercise and useTiming/settings
  const finalizeRef = useRef<() => TapResult[]>(() => [])
  const resetRef = useRef<() => void>(() => {})
  const restartRef = useRef<(options?: { seamless?: boolean; newBpm?: number }) => void>(() => {})
  const stopExerciseRef = useRef<() => void>(() => {})
  const settingsRef = useRef(settings)
  const currentBpmRef = useRef(0)
  const onSpeedTrainerBpmChangeRef = useRef(onSpeedTrainerBpmChange)

  const { loopOverlay, lastLoopResult, triggerLoopCompletion, dismissOverlay } = useLoopMode({
    seamlessLoop: settings.seamlessLoop,
    onSeamlessRestart: (nextBpm) => {
      resetRef.current()
      restartRef.current({ seamless: true, newBpm: nextBpm })
    },
    onOverlayRestart: (nextBpm) => {
      resetRef.current()
      restartRef.current({ newBpm: nextBpm })
    },
  })

  const handleDone = () => {
    // Demo mode: just reset, no scoring
    if (isDemoModeRef.current) {
      stopExerciseRef.current()
      resetRef.current()
      setIsDemoMode(false)
      isDemoModeRef.current = false
      return
    }

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

    const result: ExerciseResult = {
      exerciseId: exercise.id,
      instrument,
      accuracy,
      stars,
      tapResults,
      timestamp: Date.now(),
    }

    if (currentSettings.loopMode) {
      if (currentSettings.speedTrainerOn && callback) {
        callback(nextBpm!)
      }
      triggerLoopCompletion(result, nextBpm)
    } else {
      if (currentSettings.speedTrainerOn && callback) {
        callback(nextBpm!)
      } else if (callback) {
        callback(null)
      }

      onFinish(result)
    }
  }

  const {
    phase,
    countdownValue,
    rawProgress,
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
    stopExerciseRef.current = stopExercise
    isDemoModeRef.current = isDemoMode
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

  const {
    learnPhase,
    learnBeatJudgments,
    wrongPad,
    learnProgress,
    learnCountdownValue,
    start: startLearn,
    recordLearnTap,
    stop: stopLearn,
  } = useLearnMode(exercise, bpm)

  // Keep refs up to date so handleDone always calls the latest versions
  useEffect(() => {
    finalizeRef.current = finalize
    resetRef.current = reset
    restartRef.current = restart
  })

  const isIdle = phase === 'idle' && !isLearnMode

  // In idle, show timeline at lead-in start position (no jump when Start pressed)
  const durationMs = exerciseDurationMs({ ...exercise, bpm })
  const idleProgress = durationMs > 0 ? -(LEAD_IN_BEATS * msPerBeat(bpm)) / durationMs : 0

  // Derive active pads and next expected pad for drums
  const activePads = useMemo(() => exerciseDrumPads(exercise), [exercise])

  const activeJudgments = isLearnMode ? learnBeatJudgments : beatJudgments

  const nextExpectedPad = useMemo((): DrumPadType | null => {
    for (let i = 0; i < exercise.beats.length; i++) {
      if (!activeJudgments.has(i)) {
        return exercise.beats[i].note as DrumPadType
      }
    }
    return null
  }, [exercise.beats, activeJudgments])

  // Derive handpan notes and next expected note
  const handpanScaleNotes = useMemo(() => {
    const scaleId = exercise.scale ?? DEFAULT_HANDPAN_SCALE
    const scale = getScale(scaleId)
    return scale?.notes ?? []
  }, [exercise.scale])

  const nextExpectedNote = useMemo((): string | null => {
    for (let i = 0; i < exercise.beats.length; i++) {
      if (!activeJudgments.has(i)) {
        return exercise.beats[i].note
      }
    }
    return null
  }, [exercise.beats, activeJudgments])

  // Drum tap handler
  const handleDrumTap = useCallback((pad: DrumPadType) => {
    if (isLearnMode) {
      recordLearnTap(pad)
      // Play sound on correct tap (learn mode always plays correct pad sound)
      const expected = exercise.beats.find((_, i) => !learnBeatJudgments.has(i))
      if (expected && pad === expected.note) {
        playDrum(pad)
      }
      return
    }
    if (settings.tapSoundOn) playDrum(pad)
    recordTap(pad)
  }, [isLearnMode, settings.tapSoundOn, playDrum, recordTap, recordLearnTap, exercise.beats, learnBeatJudgments])

  // Derive current chord from playhead position (not judgment state)
  const beatTimes = useMemo(() => beatTimesMs({ ...exercise, bpm }), [exercise, bpm])

  const currentChord = useMemo((): string | null => {
    if (instrument !== 'strumming') return null
    const progress = isLearnMode
      ? (learnPhase === 'idle' ? idleProgress : learnProgress)
      : (phase === 'idle' ? idleProgress : rawProgress)
    const playheadMs = progress * durationMs
    // Walk beats backwards from playhead to find current chord
    for (let i = beatTimes.length - 1; i >= 0; i--) {
      if (beatTimes[i] <= playheadMs && exercise.beats[i].chord) {
        return exercise.beats[i].chord!
      }
    }
    // Before first beat, show first chord
    return exercise.beats[0]?.chord ?? null
  }, [instrument, exercise, beatTimes, durationMs, isLearnMode, learnPhase, learnProgress, phase, idleProgress, rawProgress])

  const nextExpectedDirection = useMemo((): StrumDirection | null => {
    for (let i = 0; i < exercise.beats.length; i++) {
      if (!activeJudgments.has(i)) {
        return exercise.beats[i].note as StrumDirection
      }
    }
    return null
  }, [exercise.beats, activeJudgments])

  // Strum tap handler
  const handleStrumTap = useCallback((direction: string) => {
    if (isLearnMode) {
      recordLearnTap(direction)
      const expected = exercise.beats.find((_, i) => !learnBeatJudgments.has(i))
      if (expected && direction === expected.note) {
        playStrum(expected.chord ?? '', direction as StrumDirection)
      }
      return
    }
    if (settings.tapSoundOn) {
      // Use chord from next unjudged beat for audio (not playhead-based currentChord)
      const nextBeat = exercise.beats.find((_, i) => !activeJudgments.has(i))
      const tapChord = nextBeat?.chord ?? currentChord
      if (tapChord) {
        playStrum(tapChord, direction as StrumDirection)
      }
    }
    recordTap(direction)
  }, [isLearnMode, settings.tapSoundOn, currentChord, activeJudgments, playStrum, recordTap, recordLearnTap, exercise.beats, learnBeatJudgments])

  // Handpan tap handler
  const handleHandpanTap = useCallback((note: string) => {
    if (isLearnMode) {
      recordLearnTap(note)
      const expected = exercise.beats.find((_, i) => !learnBeatJudgments.has(i))
      if (expected && note === expected.note) {
        playHandpan(note)
      }
      return
    }
    if (settings.tapSoundOn) playHandpan(note)
    recordTap(note)
  }, [isLearnMode, settings.tapSoundOn, playHandpan, recordTap, recordLearnTap, exercise.beats, learnBeatJudgments])

  // Start with audio context
  const handleStart = useCallback(async () => {
    await startAudioContext()
    startExercise()
  }, [startAudioContext, startExercise])

  // Start listen/demo mode
  const handleListen = useCallback(async () => {
    setIsDemoMode(true)
    isDemoModeRef.current = true
    await startAudioContext()
    startExercise()
  }, [startAudioContext, startExercise])

  // Start learn mode
  const handleLearn = useCallback(async () => {
    await startAudioContext()
    setIsLearnMode(true)
    startLearn()
  }, [startAudioContext, startLearn])

  const handleStop = () => {
    if (isLearnMode) {
      stopLearn()
      setIsLearnMode(false)
      return
    }
    stopExercise()
    reset()
    if (isDemoMode) {
      setIsDemoMode(false)
      isDemoModeRef.current = false
      return
    }
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

  // Auto-reset when learn mode completes
  useEffect(() => {
    if (learnPhase === 'done') {
      const t = window.setTimeout(() => {
        stopLearn()
        setIsLearnMode(false)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [learnPhase, stopLearn])

  // Manual BPM change resets speed trainer
  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm)
    if (onSpeedTrainerBpmChange) {
      onSpeedTrainerBpmChange(null)
    }
  }

  useMetronome({
    phase,
    countdownValue,
    isLearnMode,
    learnPhase,
    learnCountdownValue,
    bpm,
    timeSignature: exercise.timeSignature,
    elapsedMsRef,
    metronomeOn: settings.metronomeOn,
    playMetronomeClick,
  })

  useDemoMode({
    phase,
    isDemoMode,
    exercise,
    bpm,
    instrument,
    elapsedMsRef,
    playDrum,
    playHandpan,
    playStrum,
  })

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
          {isDemoMode && phase !== 'idle' && (
            <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-700">
              Listening...
            </span>
          )}
          {isLearnMode && (learnPhase === 'active' || learnPhase === 'countdown') && (
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">
              Learning
            </span>
          )}
          <SettingsPopover
            settings={settings}
            onSettingsChange={setSettings}
            disabled={!isIdle || isLearnMode}
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
      <div className="relative mb-6">
        <VerticalTimeline
          exercise={exercise}
          progress={isLearnMode
            ? (learnPhase === 'idle' ? idleProgress : learnProgress)
            : (phase === 'idle' ? idleProgress : rawProgress)}
          bpm={bpm}
          beatJudgments={isLearnMode ? learnBeatJudgments : beatJudgments}
          instrument={instrument}
          tapMarkers={isLearnMode ? [] : tapMarkers}
          activePads={activePads}
          scaleNotes={handpanScaleNotes}
        />
        {/* Countdown badge overlaid on timeline */}
        {((phase === 'countdown' && countdownValue > 0) ||
          (isLearnMode && learnPhase === 'countdown' && learnCountdownValue > 0)) && (
          <div
            data-testid="countdown-badge"
            className="absolute top-2 right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-2xl font-extrabold text-white"
          >
            {isLearnMode ? learnCountdownValue : countdownValue}
          </div>
        )}
      </div>

      {/* Tap input area */}
      <div className="mb-6">
        {instrument === 'drums' ? (
          <DrumPad
            onTap={handleDrumTap}
            lastFeedback={isLearnMode && wrongPad ? { judgment: 'miss' as const, timestamp: performance.now() } : lastTapFeedback}
            lastFeedbackPad={isLearnMode && wrongPad ? wrongPad as DrumPadType : lastFeedbackPad as DrumPadType | null}
            disabled={isLearnMode ? (learnPhase === 'idle' || learnPhase === 'done') : (phase === 'idle' || phase === 'done' || isDemoMode)}
            activePads={activePads}
            nextExpectedPad={nextExpectedPad}
          />
        ) : instrument === 'strumming' ? (
          <StrumZone
            onTap={handleStrumTap}
            lastFeedback={isLearnMode && wrongPad ? { judgment: 'miss' as const, timestamp: performance.now() } : lastTapFeedback}
            lastFeedbackPad={isLearnMode && wrongPad ? wrongPad : lastFeedbackPad}
            disabled={isLearnMode ? (learnPhase === 'idle' || learnPhase === 'done') : (phase === 'idle' || phase === 'done' || isDemoMode)}
            currentChord={currentChord}
            nextExpectedDirection={nextExpectedDirection}
          />
        ) : instrument === 'handpan' ? (
          <HandpanPad
            onTap={handleHandpanTap}
            lastFeedback={isLearnMode && wrongPad ? { judgment: 'miss' as const, timestamp: performance.now() } : lastTapFeedback}
            lastFeedbackPad={isLearnMode && wrongPad ? wrongPad : lastFeedbackPad}
            disabled={isLearnMode ? (learnPhase === 'idle' || learnPhase === 'done') : (phase === 'idle' || phase === 'done' || isDemoMode)}
            scaleNotes={handpanScaleNotes}
            nextExpectedNote={nextExpectedNote}
          />
        ) : (
          <TapZone
            onTap={recordTap}
            lastFeedback={lastTapFeedback}
            disabled={phase !== 'playing' || isDemoMode}
          />
        )}
      </div>

      {/* Action area */}
      <div className="flex justify-center gap-3">
        {isIdle && (
          <>
            <Button size="lg" onClick={handleStart}>
              Start
            </Button>
            <Button variant="secondary" size="lg" onClick={handleListen}>
              Listen
            </Button>
            <Button variant="secondary" size="lg" onClick={handleLearn}>
              Learn
            </Button>
          </>
        )}
        {(phase === 'playing' || phase === 'countdown' || (isLearnMode && (learnPhase === 'active' || learnPhase === 'countdown'))) && (
          <Button variant="secondary" size="sm" onClick={handleStop}>
            Stop
          </Button>
        )}
      </div>

      {/* Loop results overlay */}
      {loopOverlay && (
        <ResultsOverlay
          accuracy={loopOverlay.accuracy}
          stars={loopOverlay.stars}
          onDismiss={dismissOverlay}
          speedTrainerNextBpm={loopOverlay.nextBpm}
        />
      )}
    </Layout>
  )
}

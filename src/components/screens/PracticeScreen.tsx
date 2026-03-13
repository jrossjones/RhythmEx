import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { VerticalTimeline } from '@/components/practice/VerticalTimeline'
import { TapZone } from '@/components/practice/TapZone'
import { DrumPad } from '@/components/instruments/DrumPad'
import { HandpanPad } from '@/components/instruments/HandpanPad'
import { ResultsOverlay } from '@/components/practice/ResultsOverlay'
import { SettingsPopover } from '@/components/practice/SettingsPopover'
import { useExercise, LEAD_IN_BEATS } from '@/hooks/useExercise'
import { useTiming } from '@/hooks/useTiming'
import { useLearnMode } from '@/hooks/useLearnMode'
import { useAudio } from '@/hooks/useAudio'
import { calculateAccuracy, calculateStars } from '@/utils/scoring'
import { beatTimesMs, exerciseDrumPads, exerciseDurationMs, msPerBeat } from '@/utils/rhythm'
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

  const [isDemoMode, setIsDemoMode] = useState(false)
  const isDemoModeRef = useRef(false)

  const [isLearnMode, setIsLearnMode] = useState(false)

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
  const stopExerciseRef = useRef<() => void>(() => {})
  const settingsRef = useRef(settings)
  const currentBpmRef = useRef(0)
  const onSpeedTrainerBpmChangeRef = useRef(onSpeedTrainerBpmChange)

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

  const handleLoopOverlayDismiss = useCallback(() => {
    setLoopOverlay(null)
    resetRef.current()
    restartRef.current({ newBpm: loopOverlay?.nextBpm })
  }, [loopOverlay?.nextBpm])

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

  // Metronome — countdown clicks
  const playMetronomeClickRef = useRef(playMetronomeClick)
  useEffect(() => {
    playMetronomeClickRef.current = playMetronomeClick
  })
  const prevCountdownRef = useRef<number | null>(null)

  const prevLearnCountdownRef = useRef<number | null>(null)

  useEffect(() => {
    // Exercise countdown metronome
    if (phase !== 'countdown') {
      prevCountdownRef.current = null
    } else if (prevCountdownRef.current !== countdownValue) {
      prevCountdownRef.current = countdownValue
      if (settings.metronomeOn) {
        playMetronomeClickRef.current(true)
      }
    }

    // Learn mode countdown metronome
    if (!isLearnMode || learnPhase !== 'countdown') {
      prevLearnCountdownRef.current = null
    } else if (prevLearnCountdownRef.current !== learnCountdownValue) {
      prevLearnCountdownRef.current = learnCountdownValue
      if (settings.metronomeOn) {
        playMetronomeClickRef.current(true)
      }
    }
  }, [phase, countdownValue, isLearnMode, learnPhase, learnCountdownValue, settings.metronomeOn])

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

  // Demo mode — auto-fire beat sounds during playing
  const playDrumRef = useRef(playDrum)
  const playHandpanRef = useRef(playHandpan)
  useEffect(() => {
    playDrumRef.current = playDrum
    playHandpanRef.current = playHandpan
  })

  useEffect(() => {
    if (phase !== 'playing' || !isDemoMode) return

    const times = beatTimesMs({ ...exercise, bpm })
    const firedBeats = new Set<number>()
    let rafId: number

    const tick = () => {
      const elapsed = elapsedMsRef.current
      for (let i = 0; i < times.length; i++) {
        if (!firedBeats.has(i) && elapsed >= times[i]) {
          firedBeats.add(i)
          if (instrument === 'drums') {
            playDrumRef.current(exercise.beats[i].note as DrumPadType)
          } else if (instrument === 'handpan') {
            playHandpanRef.current(exercise.beats[i].note)
          }
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [phase, isDemoMode, exercise, bpm, instrument, elapsedMsRef])

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
          onDismiss={handleLoopOverlayDismiss}
          speedTrainerNextBpm={loopOverlay.nextBpm}
        />
      )}
    </Layout>
  )
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { Exercise, ExerciseResult, TapResult } from '@/types'

// --- Hook mocks ---------------------------------------------------------
// The hooks are unit-tested separately; here we mock them so we can drive
// PracticeScreen through its lifecycle synchronously.

type DoneCallback = () => void

interface ExerciseHarness {
  phase: 'idle' | 'countdown' | 'playing' | 'done'
  countdownValue: number
  rawProgress: number
  bpm: number
  elapsedMs: number
  onDone: DoneCallback
}

const exerciseState: ExerciseHarness = {
  phase: 'idle',
  countdownValue: 0,
  rawProgress: 0,
  bpm: 100,
  elapsedMs: 0,
  onDone: () => {},
}

let rerenderPracticeScreen: () => void = () => {}

function triggerRerender() {
  act(() => {
    rerenderPracticeScreen()
  })
}

vi.mock('@/hooks/useExercise', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useExercise')>('@/hooks/useExercise')
  return {
    ...actual,
    useExercise: (_ex: Exercise, onDone: DoneCallback, initialBpm?: number) => {
      exerciseState.onDone = onDone
      if (initialBpm !== undefined && exerciseState.bpm !== initialBpm) {
        exerciseState.bpm = initialBpm
      }
      const elapsedRef = { current: exerciseState.elapsedMs }
      return {
        phase: exerciseState.phase,
        countdownValue: exerciseState.countdownValue,
        progress: exerciseState.rawProgress > 1 ? 1 : Math.max(0, exerciseState.rawProgress),
        rawProgress: exerciseState.rawProgress,
        bpm: exerciseState.bpm,
        elapsedMs: exerciseState.elapsedMs,
        elapsedMsRef: elapsedRef,
        setBpm: (n: number) => {
          if (exerciseState.phase !== 'idle') return
          exerciseState.bpm = n
          triggerRerender()
        },
        startExercise: () => {
          exerciseState.phase = 'playing'
          triggerRerender()
        },
        stopExercise: () => {
          exerciseState.phase = 'idle'
          exerciseState.elapsedMs = 0
          triggerRerender()
        },
        restart: () => {
          exerciseState.phase = 'playing'
          triggerRerender()
        },
      }
    },
  }
})

const timingState = {
  tapResults: [] as TapResult[],
  finalized: false,
}

vi.mock('@/hooks/useTiming', () => ({
  useTiming: () => ({
    lastTapFeedback: null,
    lastFeedbackPad: null,
    beatJudgments: new Map(),
    tapMarkers: [],
    recordTap: vi.fn(),
    finalize: () => {
      timingState.finalized = true
      return timingState.tapResults
    },
    reset: vi.fn(),
  }),
}))

vi.mock('@/hooks/useLearnMode', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useLearnMode')>('@/hooks/useLearnMode')
  return {
    ...actual,
    useLearnMode: () => ({
      learnPhase: 'idle' as const,
      learnBeatJudgments: new Map(),
      wrongPad: null,
      learnProgress: 0,
      learnCountdownValue: 0,
      start: vi.fn(),
      recordLearnTap: vi.fn(),
      stop: vi.fn(),
    }),
  }
})

vi.mock('@/hooks/useAudio', () => ({
  useAudio: () => ({
    playDrum: vi.fn(),
    playHandpan: vi.fn(),
    playStrum: vi.fn(),
    playMetronomeClick: vi.fn(),
    startAudioContext: vi.fn().mockResolvedValue(undefined),
    isAudioReady: true,
  }),
}))

// No-op these — PracticeScreen passes them to hooks already fully mocked.
vi.mock('@/hooks/useMetronome', () => ({ useMetronome: () => {} }))
vi.mock('@/hooks/useDemoMode', () => ({ useDemoMode: () => {} }))

vi.mock('@/utils/storage', () => ({
  saveResult: vi.fn(),
}))

import { saveResult } from '@/utils/storage'
import { PracticeScreen } from '../PracticeScreen'
const mockSaveResult = vi.mocked(saveResult)

const drumExercise: Exercise = {
  id: 'drum-1',
  name: 'Quarter Notes',
  difficulty: 'beginner',
  timeSignature: [4, 4],
  bpm: 100,
  measures: 1,
  instrument: 'drums',
  beats: [
    { time: '0:0:0', duration: '4n', note: 'kick' },
    { time: '0:1:0', duration: '4n', note: 'snare' },
    { time: '0:2:0', duration: '4n', note: 'kick' },
    { time: '0:3:0', duration: '4n', note: 'snare' },
  ],
}

function makeTap(judgment: TapResult['judgment'] = 'on-time'): TapResult {
  return { expectedMs: 0, actualMs: 0, deltaMs: 0, judgment }
}

function resetState() {
  exerciseState.phase = 'idle'
  exerciseState.countdownValue = 0
  exerciseState.rawProgress = 0
  exerciseState.bpm = 100
  exerciseState.elapsedMs = 0
  exerciseState.onDone = () => {}
  timingState.tapResults = []
  timingState.finalized = false
}

describe('PracticeScreen', () => {
  beforeEach(() => {
    resetState()
    mockSaveResult.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function renderScreen(props: Partial<React.ComponentProps<typeof PracticeScreen>> = {}) {
    const onFinish = props.onFinish ?? vi.fn()
    const onBack = props.onBack ?? vi.fn()
    const onSpeedTrainerBpmChange = props.onSpeedTrainerBpmChange ?? vi.fn()
    const onShowResults = props.onShowResults ?? vi.fn()

    const result = render(
      <PracticeScreen
        exercise={drumExercise}
        instrument="drums"
        onFinish={onFinish}
        onBack={onBack}
        onSpeedTrainerBpmChange={onSpeedTrainerBpmChange}
        onShowResults={onShowResults}
        {...props}
      />
    )
    rerenderPracticeScreen = () =>
      result.rerender(
        <PracticeScreen
          exercise={drumExercise}
          instrument="drums"
          onFinish={onFinish}
          onBack={onBack}
          onSpeedTrainerBpmChange={onSpeedTrainerBpmChange}
          onShowResults={onShowResults}
          {...props}
        />
      )
    return { ...result, onFinish, onBack, onSpeedTrainerBpmChange, onShowResults }
  }

  it('renders BPM and controls on idle', () => {
    renderScreen()
    expect(screen.getAllByText(/100 BPM/).length).toBeGreaterThan(0)
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Listen')).toBeInTheDocument()
    expect(screen.getByText('Learn')).toBeInTheDocument()
  })

  it('BPM − and + buttons are disabled during playing phase', async () => {
    renderScreen()

    // Start exercise
    await act(async () => {
      fireEvent.click(screen.getByText('Start'))
    })
    expect(exerciseState.phase).toBe('playing')

    const buttons = screen.getAllByRole('button')
    const minus = buttons.find((b) => b.textContent === '−')
    const plus = buttons.find((b) => b.textContent === '+')
    expect(minus).toBeDefined()
    expect(plus).toBeDefined()
    expect(minus).toBeDisabled()
    expect(plus).toBeDisabled()
  })

  it('calls onFinish with result on exercise completion (normal mode)', async () => {
    timingState.tapResults = [makeTap('on-time'), makeTap('on-time'), makeTap('on-time'), makeTap('on-time')]
    const { onFinish } = renderScreen()

    await act(async () => {
      fireEvent.click(screen.getByText('Start'))
    })

    await act(async () => {
      exerciseState.onDone()
    })

    expect(onFinish).toHaveBeenCalledTimes(1)
    const result = vi.mocked(onFinish).mock.calls[0][0] as ExerciseResult
    expect(result.exerciseId).toBe('drum-1')
    expect(result.instrument).toBe('drums')
    expect(result.accuracy).toBe(100)
    expect(result.stars).toBe(3)
  })

  it('speed trainer: advances BPM by step when accuracy ≥ 95%', async () => {
    timingState.tapResults = [makeTap('on-time'), makeTap('on-time'), makeTap('on-time'), makeTap('on-time')]
    const onSpeedTrainerBpmChange = vi.fn()
    const onFinish = vi.fn()
    const { rerender } = render(
      <PracticeScreen
        exercise={drumExercise}
        instrument="drums"
        initialBpm={100}
        onFinish={onFinish}
        onBack={vi.fn()}
        onSpeedTrainerBpmChange={onSpeedTrainerBpmChange}
      />
    )
    rerenderPracticeScreen = () =>
      rerender(
        <PracticeScreen
          exercise={drumExercise}
          instrument="drums"
          initialBpm={100}
          onFinish={onFinish}
          onBack={vi.fn()}
          onSpeedTrainerBpmChange={onSpeedTrainerBpmChange}
        />
      )

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-gear'))
    })
    const speedToggle = screen.getByText('Speed Trainer').closest('label')!.querySelector('button[role="switch"]')!
    await act(async () => {
      fireEvent.click(speedToggle)
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-gear'))
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Start'))
    })
    await act(async () => {
      exerciseState.onDone()
    })

    expect(onSpeedTrainerBpmChange).toHaveBeenCalledWith(105)
  })

  it('speed trainer: keeps BPM when accuracy < 95%', async () => {
    timingState.tapResults = [makeTap('on-time'), makeTap('miss'), makeTap('miss'), makeTap('miss')]
    const onSpeedTrainerBpmChange = vi.fn()
    const onFinish = vi.fn()
    const { rerender } = render(
      <PracticeScreen
        exercise={drumExercise}
        instrument="drums"
        initialBpm={100}
        onFinish={onFinish}
        onBack={vi.fn()}
        onSpeedTrainerBpmChange={onSpeedTrainerBpmChange}
      />
    )
    rerenderPracticeScreen = () =>
      rerender(
        <PracticeScreen
          exercise={drumExercise}
          instrument="drums"
          initialBpm={100}
          onFinish={onFinish}
          onBack={vi.fn()}
          onSpeedTrainerBpmChange={onSpeedTrainerBpmChange}
        />
      )

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-gear'))
    })
    const speedToggle = screen.getByText('Speed Trainer').closest('label')!.querySelector('button[role="switch"]')!
    await act(async () => {
      fireEvent.click(speedToggle)
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-gear'))
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Start'))
    })
    await act(async () => {
      exerciseState.onDone()
    })

    expect(onSpeedTrainerBpmChange).toHaveBeenCalledWith(100)
  })

  it('sends null to onSpeedTrainerBpmChange when trainer is off', async () => {
    timingState.tapResults = [makeTap('on-time'), makeTap('on-time'), makeTap('on-time'), makeTap('on-time')]
    const { onSpeedTrainerBpmChange } = renderScreen()

    await act(async () => {
      fireEvent.click(screen.getByText('Start'))
    })
    await act(async () => {
      exerciseState.onDone()
    })

    expect(onSpeedTrainerBpmChange).toHaveBeenCalledWith(null)
  })

  it('loop mode: saves result and does not call onFinish on completion', async () => {
    timingState.tapResults = [makeTap('on-time'), makeTap('on-time'), makeTap('on-time'), makeTap('on-time')]
    const onFinish = vi.fn()
    const { rerender } = render(
      <PracticeScreen
        exercise={drumExercise}
        instrument="drums"
        onFinish={onFinish}
        onBack={vi.fn()}
      />
    )
    rerenderPracticeScreen = () =>
      rerender(
        <PracticeScreen
          exercise={drumExercise}
          instrument="drums"
          onFinish={onFinish}
          onBack={vi.fn()}
        />
      )

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-gear'))
    })
    const loopToggle = screen.getByText('Loop Mode').closest('label')!.querySelector('button[role="switch"]')!
    await act(async () => {
      fireEvent.click(loopToggle)
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-gear'))
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Start'))
    })
    await act(async () => {
      exerciseState.onDone()
    })

    expect(mockSaveResult).toHaveBeenCalledTimes(1)
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('demo mode: does not finalize timing or save result on completion', async () => {
    const { onFinish } = renderScreen()

    await act(async () => {
      fireEvent.click(screen.getByText('Listen'))
    })
    await act(async () => {
      exerciseState.onDone()
    })

    expect(timingState.finalized).toBe(false)
    expect(onFinish).not.toHaveBeenCalled()
    expect(mockSaveResult).not.toHaveBeenCalled()
  })

  it('Back button calls onBack and stops exercise', () => {
    const { onBack } = renderScreen()
    fireEvent.click(screen.getByText(/Back/))
    expect(onBack).toHaveBeenCalled()
  })
})

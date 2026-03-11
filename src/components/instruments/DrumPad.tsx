import { useEffect, useRef } from 'react'
import type { DrumPad as DrumPadType, TimingJudgment } from '@/types'
import { DRUM_PAD_MUTED_COLORS } from '@/components/practice/timelineConstants'

interface TapFeedback {
  judgment: TimingJudgment
  timestamp: number
}

interface DrumPadProps {
  onTap: (pad: DrumPadType) => void
  lastFeedback: TapFeedback | null
  lastFeedbackPad: DrumPadType | null
  disabled: boolean
  activePads: DrumPadType[]
  nextExpectedPad?: DrumPadType | null
}

const padConfig: Record<DrumPadType, { color: string; label: string; key: string }> = {
  kick: { color: 'bg-red-400', label: 'Kick', key: 'f' },
  snare: { color: 'bg-orange-400', label: 'Snare', key: 'd' },
  hihat: { color: 'bg-cyan-400', label: 'Hi-Hat', key: 'j' },
  tom1: { color: 'bg-purple-400', label: 'Tom 1', key: 'k' },
  tom2: { color: 'bg-pink-400', label: 'Tom 2', key: 'l' },
}

const feedbackColors: Record<TimingJudgment, string> = {
  'on-time': 'bg-green-400',
  early: 'bg-yellow-400',
  late: 'bg-yellow-400',
  miss: 'bg-red-600',
}

const keyToPad: Record<string, DrumPadType> = {
  f: 'kick',
  d: 'snare',
  j: 'hihat',
  k: 'tom1',
  l: 'tom2',
}

export function DrumPad({
  onTap,
  lastFeedback,
  lastFeedbackPad,
  disabled,
  activePads,
  nextExpectedPad,
}: DrumPadProps) {
  const onTapRef = useRef(onTap)
  const disabledRef = useRef(disabled)
  const activePadsRef = useRef(activePads)
  const nextExpectedPadRef = useRef(nextExpectedPad)

  useEffect(() => {
    onTapRef.current = onTap
    disabledRef.current = disabled
    activePadsRef.current = activePads
    nextExpectedPadRef.current = nextExpectedPad
  })

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || disabledRef.current) return

      if (e.code === 'Space') {
        e.preventDefault()
        const pad = nextExpectedPadRef.current ?? 'kick'
        onTapRef.current(pad)
        return
      }

      const pad = keyToPad[e.key.toLowerCase()]
      if (pad && activePadsRef.current.includes(pad)) {
        e.preventDefault()
        onTapRef.current(pad)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Flash is derived from props — useTiming auto-clears feedback after 300ms
  const getPadColor = (pad: DrumPadType) => {
    if (lastFeedback && lastFeedbackPad === pad) {
      return feedbackColors[lastFeedback.judgment]
    }
    if (disabled) return DRUM_PAD_MUTED_COLORS[pad] ?? 'bg-gray-200'
    return padConfig[pad].color
  }

  // Layout based on number of active pads
  const renderPads = () => {
    const count = activePads.length

    if (count <= 2) {
      // Single row: [kick] [snare]
      return (
        <div className="flex justify-center gap-4">
          {activePads.map((pad) => renderSinglePad(pad))}
        </div>
      )
    }

    if (count === 3) {
      // hihat top center, kick + snare bottom
      const topPad = activePads.find((p) => p === 'hihat')
      const bottomPads = activePads.filter((p) => p !== 'hihat')
      return (
        <div className="flex flex-col items-center gap-3">
          {topPad && <div className="flex justify-center">{renderSinglePad(topPad)}</div>}
          <div className="flex justify-center gap-4">
            {bottomPads.map((pad) => renderSinglePad(pad))}
          </div>
        </div>
      )
    }

    // 5 pads: hihat top, tom1+tom2 middle, snare+kick bottom
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-center">
          {renderSinglePad('hihat')}
        </div>
        <div className="flex justify-center gap-4">
          {renderSinglePad('tom1')}
          {renderSinglePad('tom2')}
        </div>
        <div className="flex justify-center gap-4">
          {renderSinglePad('snare')}
          {renderSinglePad('kick')}
        </div>
      </div>
    )
  }

  const renderSinglePad = (pad: DrumPadType) => {
    const config = padConfig[pad]
    const color = getPadColor(pad)
    return (
      <button
        key={pad}
        type="button"
        data-testid={`drum-pad-${pad}`}
        className={`flex min-h-[64px] min-w-[64px] flex-col items-center justify-center rounded-2xl px-6 py-3 text-white font-bold shadow-md select-none transition-colors duration-100 ${color}`}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onTap(pad)
        }}
        onTouchStart={(e) => {
          if (!disabled) {
            e.preventDefault()
            onTap(pad)
          }
        }}
      >
        <span className="text-lg">{config.label}</span>
        <span className="text-xs opacity-75">{config.key.toUpperCase()}</span>
      </button>
    )
  }

  return (
    <div data-testid="drum-pad-container">
      {renderPads()}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import type { TimingJudgment } from '@/types'
import type { StrumDirection } from '@/components/practice/timelineConstants'
import { STRUM_DIRECTION_COLORS, STRUM_DIRECTION_MUTED_COLORS } from '@/components/practice/timelineConstants'

interface TapFeedback {
  judgment: TimingJudgment
  timestamp: number
}

interface StrumZoneProps {
  onTap: (direction: StrumDirection) => void
  lastFeedback: TapFeedback | null
  lastFeedbackPad: string | null
  disabled: boolean
  currentChord?: string | null
  nextExpectedDirection?: StrumDirection | null
}

const feedbackColors: Record<TimingJudgment, string> = {
  'on-time': 'bg-green-400',
  early: 'bg-yellow-400',
  late: 'bg-yellow-400',
  miss: 'bg-red-600',
}

export function StrumZone({
  onTap,
  lastFeedback,
  lastFeedbackPad,
  disabled,
  currentChord,
  nextExpectedDirection,
}: StrumZoneProps) {
  const onTapRef = useRef(onTap)
  const disabledRef = useRef(disabled)
  const nextExpectedDirectionRef = useRef(nextExpectedDirection)

  useEffect(() => {
    onTapRef.current = onTap
    disabledRef.current = disabled
    nextExpectedDirectionRef.current = nextExpectedDirection
  })

  // Keyboard listener: ArrowDown → 'down', ArrowUp → 'up', Space → next expected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || disabledRef.current) return

      if (e.code === 'ArrowDown') {
        e.preventDefault()
        onTapRef.current('down')
        return
      }

      if (e.code === 'ArrowUp') {
        e.preventDefault()
        onTapRef.current('up')
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        onTapRef.current(nextExpectedDirectionRef.current ?? 'down')
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getButtonColor = (direction: StrumDirection) => {
    if (lastFeedback && lastFeedbackPad === direction) {
      return feedbackColors[lastFeedback.judgment]
    }
    if (disabled) return STRUM_DIRECTION_MUTED_COLORS[direction]
    return STRUM_DIRECTION_COLORS[direction]
  }

  return (
    <div data-testid="strum-zone-container" className="flex flex-col items-center gap-3">
      {/* Chord display */}
      {currentChord && (
        <div data-testid="strum-chord-display" className="text-3xl font-extrabold text-gray-700">
          {currentChord}
        </div>
      )}

      {/* Strum buttons */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          type="button"
          data-testid="strum-button-down"
          className={`flex items-center justify-center rounded-xl text-white font-bold shadow-md select-none transition-colors duration-100 ${getButtonColor('down')}`}
          style={{ minHeight: 64 }}
          disabled={disabled}
          onClick={() => { if (!disabled) onTap('down') }}
          onTouchStart={(e) => { if (!disabled) { e.preventDefault(); onTap('down') } }}
        >
          <span className="text-2xl mr-2">{'\u2193'}</span>
          Down
        </button>
        <button
          type="button"
          data-testid="strum-button-up"
          className={`flex items-center justify-center rounded-xl text-white font-bold shadow-md select-none transition-colors duration-100 ${getButtonColor('up')}`}
          style={{ minHeight: 64 }}
          disabled={disabled}
          onClick={() => { if (!disabled) onTap('up') }}
          onTouchStart={(e) => { if (!disabled) { e.preventDefault(); onTap('up') } }}
        >
          <span className="text-2xl mr-2">{'\u2191'}</span>
          Up
        </button>
      </div>
    </div>
  )
}

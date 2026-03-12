import { useEffect, useRef } from 'react'
import type { TimingJudgment } from '@/types'
import { HANDPAN_PAD_COLORS, HANDPAN_PAD_MUTED_COLORS, pitchClass } from '@/components/practice/timelineConstants'

interface TapFeedback {
  judgment: TimingJudgment
  timestamp: number
}

interface HandpanPadProps {
  onTap: (note: string) => void
  lastFeedback: TapFeedback | null
  lastFeedbackPad: string | null
  disabled: boolean
  scaleNotes: string[]
  nextExpectedNote?: string | null
}

const feedbackColors: Record<TimingJudgment, string> = {
  'on-time': 'bg-green-400',
  early: 'bg-yellow-400',
  late: 'bg-yellow-400',
  miss: 'bg-red-600',
}

export function HandpanPad({
  onTap,
  lastFeedback,
  lastFeedbackPad,
  disabled,
  scaleNotes,
  nextExpectedNote,
}: HandpanPadProps) {
  const onTapRef = useRef(onTap)
  const disabledRef = useRef(disabled)
  const scaleNotesRef = useRef(scaleNotes)
  const nextExpectedNoteRef = useRef(nextExpectedNote)

  useEffect(() => {
    onTapRef.current = onTap
    disabledRef.current = disabled
    scaleNotesRef.current = scaleNotes
    nextExpectedNoteRef.current = nextExpectedNote
  })

  // Keyboard listener: 1-9 for scale notes, Space for next expected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || disabledRef.current) return

      if (e.code === 'Space') {
        e.preventDefault()
        const note = nextExpectedNoteRef.current ?? scaleNotesRef.current[0]
        if (note) onTapRef.current(note)
        return
      }

      const num = parseInt(e.key)
      if (num >= 1 && num <= 9 && num <= scaleNotesRef.current.length) {
        e.preventDefault()
        onTapRef.current(scaleNotesRef.current[num - 1])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getPadColor = (note: string) => {
    if (lastFeedback && lastFeedbackPad === note) {
      return feedbackColors[lastFeedback.judgment]
    }
    const pc = pitchClass(note)
    if (disabled) return HANDPAN_PAD_MUTED_COLORS[pc] ?? 'bg-gray-200'
    return HANDPAN_PAD_COLORS[pc] ?? 'bg-gray-400'
  }

  const ding = scaleNotes[0]
  const toneFields = scaleNotes.slice(1)
  const ringRadius = 100
  const containerSize = 280

  return (
    <div data-testid="handpan-pad-container" className="flex justify-center">
      <div
        className="relative"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Center ding pad */}
        {ding && (
          <button
            type="button"
            data-testid={`handpan-pad-${ding}`}
            className={`absolute flex flex-col items-center justify-center rounded-full text-white font-bold shadow-md select-none transition-colors duration-100 ${getPadColor(ding)}`}
            style={{
              width: 64,
              height: 64,
              left: containerSize / 2 - 32,
              top: containerSize / 2 - 32,
            }}
            disabled={disabled}
            onClick={() => { if (!disabled) onTap(ding) }}
            onTouchStart={(e) => { if (!disabled) { e.preventDefault(); onTap(ding) } }}
          >
            <span className="text-sm">{ding}</span>
            <span className="text-[10px] opacity-75">1</span>
          </button>
        )}

        {/* Surrounding tone field pads */}
        {toneFields.map((note, i) => {
          const angle = (2 * Math.PI * i) / toneFields.length - Math.PI / 2
          const cx = containerSize / 2 + ringRadius * Math.cos(angle) - 26
          const cy = containerSize / 2 + ringRadius * Math.sin(angle) - 26
          const keyNum = i + 2

          return (
            <button
              key={note}
              type="button"
              data-testid={`handpan-pad-${note}`}
              className={`absolute flex flex-col items-center justify-center rounded-full text-white font-bold shadow-md select-none transition-colors duration-100 ${getPadColor(note)}`}
              style={{
                width: 52,
                height: 52,
                left: cx,
                top: cy,
              }}
              disabled={disabled}
              onClick={() => { if (!disabled) onTap(note) }}
              onTouchStart={(e) => { if (!disabled) { e.preventDefault(); onTap(note) } }}
            >
              <span className="text-xs">{note}</span>
              <span className="text-[10px] opacity-75">{keyNum}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

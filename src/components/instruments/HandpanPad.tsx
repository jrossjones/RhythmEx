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

// Numpad spatial keys for tone fields in 9-note scales (clockwise from top).
// Matches the visual ring order: top, top-right, right, bottom-right, bottom,
// bottom-left, left, top-left. Ding (center) uses 5.
const NUMPAD_TONE_FIELD_KEYS = [8, 9, 6, 3, 2, 1, 4, 7]

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
      if (!(num >= 1 && num <= 9)) return
      const notes = scaleNotesRef.current
      if (notes.length === 9) {
        // Numpad spatial layout: 5=ding (center), surround = NUMPAD_TONE_FIELD_KEYS
        if (num === 5) {
          e.preventDefault()
          onTapRef.current(notes[0])
          return
        }
        const idx = NUMPAD_TONE_FIELD_KEYS.indexOf(num)
        if (idx !== -1) {
          e.preventDefault()
          onTapRef.current(notes[idx + 1])
        }
        return
      }
      if (num <= notes.length) {
        e.preventDefault()
        onTapRef.current(notes[num - 1])
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
  const isNumpadLayout = scaleNotes.length === 9
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
            onPointerDown={(e) => { if (!disabled) { e.preventDefault(); onTap(ding) } }}
          >
            <span className="text-sm">{ding}</span>
            <span className="text-[10px] opacity-75">{isNumpadLayout ? 5 : 1}</span>
          </button>
        )}

        {/* Surrounding tone field pads */}
        {toneFields.map((note, i) => {
          const angle = (2 * Math.PI * i) / toneFields.length - Math.PI / 2
          const cx = containerSize / 2 + ringRadius * Math.cos(angle) - 26
          const cy = containerSize / 2 + ringRadius * Math.sin(angle) - 26
          const keyNum = isNumpadLayout ? NUMPAD_TONE_FIELD_KEYS[i] : i + 2

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
              onPointerDown={(e) => { if (!disabled) { e.preventDefault(); onTap(note) } }}
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

import { useEffect, useRef } from 'react'
import type { TimingJudgment } from '@/types'
import { HANDPAN_PAD_COLORS, HANDPAN_PAD_MUTED_COLORS, HANDPAN_RING_ORDER, pitchClass } from '@/components/practice/timelineConstants'
import { ApproachRing } from '@/components/instruments/ApproachRing'

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
  approachProgress?: Map<string, number>
}

// Numpad key at each ring position (clockwise from top), per tone-field count.
// The ring position → note mapping is shared with the timeline via
// HANDPAN_RING_ORDER, so pads and markers stay aligned. The ding (scaleNotes[0])
// is always the center, key 5.
//
// To support a new pad count, add an entry here plus one to HANDPAN_RING_ORDER
// (same key). Counts with no entry fall back to the sequential layout
// (ding = 1, ring = 2..N in scale order).
const DING_KEY = 5

const HANDPAN_NUMPAD_KEYS: Record<number, number[]> = {
  // 9-note scales (8 tone fields): full numpad ring.
  // top, top-right, right, bottom-right, bottom, bottom-left, left, top-left.
  8: [8, 9, 6, 3, 2, 1, 4, 7],
  // 8-note scales (7 tone fields): numpad ring with the bottom-center (2) slot
  // left open. Yields keys {1,3,4,5,6,7,8,9}.
  7: [8, 9, 6, 3, 1, 4, 7],
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
  approachProgress,
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
      const toneFields = notes.slice(1)
      const numpadKeys = HANDPAN_NUMPAD_KEYS[toneFields.length]
      const ringOrder = HANDPAN_RING_ORDER[toneFields.length]
      if (numpadKeys && ringOrder) {
        // Numpad spatial layout: 5 = ding (center), ring keys per numpadKeys
        if (num === DING_KEY) {
          e.preventDefault()
          onTapRef.current(notes[0])
          return
        }
        const pos = numpadKeys.indexOf(num)
        if (pos !== -1) {
          e.preventDefault()
          onTapRef.current(toneFields[ringOrder[pos]])
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
  const numpadKeys = HANDPAN_NUMPAD_KEYS[toneFields.length]
  const ringOrder = HANDPAN_RING_ORDER[toneFields.length]
  const hasNumpadLayout = !!numpadKeys && !!ringOrder
  const dingKey = hasNumpadLayout ? DING_KEY : 1
  const ringRadius = 140
  const containerSize = 400
  const dingSize = 96
  const toneSize = 76

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
              width: dingSize,
              height: dingSize,
              left: containerSize / 2 - dingSize / 2,
              top: containerSize / 2 - dingSize / 2,
            }}
            disabled={disabled}
            onPointerDown={(e) => { if (!disabled) { e.preventDefault(); onTap(ding) } }}
          >
            {approachProgress?.get(ding) !== undefined && (
              <ApproachRing shape="circle" progress={approachProgress.get(ding)!} />
            )}
            <span className="text-lg">{ding}</span>
            <span className="text-xs opacity-75">{dingKey}</span>
          </button>
        )}

        {/* Surrounding tone field pads. Position index runs clockwise from the
            top; the note placed there follows layout.noteOrder (real-handpan
            arrangement) or scale order when no numpad layout exists. */}
        {toneFields.map((_, pos) => {
          const noteIdx = hasNumpadLayout ? ringOrder[pos] : pos
          const note = toneFields[noteIdx]
          const keyNum = hasNumpadLayout ? numpadKeys[pos] : pos + 2
          const angle = (2 * Math.PI * pos) / toneFields.length - Math.PI / 2
          const cx = containerSize / 2 + ringRadius * Math.cos(angle) - toneSize / 2
          const cy = containerSize / 2 + ringRadius * Math.sin(angle) - toneSize / 2

          return (
            <button
              key={note}
              type="button"
              data-testid={`handpan-pad-${note}`}
              className={`absolute flex flex-col items-center justify-center rounded-full text-white font-bold shadow-md select-none transition-colors duration-100 ${getPadColor(note)}`}
              style={{
                width: toneSize,
                height: toneSize,
                left: cx,
                top: cy,
              }}
              disabled={disabled}
              onPointerDown={(e) => { if (!disabled) { e.preventDefault(); onTap(note) } }}
            >
              {approachProgress?.get(note) !== undefined && (
                <ApproachRing shape="circle" progress={approachProgress.get(note)!} />
              )}
              <span className="text-base">{note}</span>
              <span className="text-xs opacity-75">{keyNum}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import type { DjembeHand, DjembeNote, DjembeStroke, TimingJudgment } from '@/types'
import {
  DJEMBE_HAND_COLORS,
  DJEMBE_HAND_MUTED_COLORS,
  DJEMBE_RADIAL_ORDER,
  DJEMBE_STROKE_NAMES,
  DJEMBE_SYLLABLES,
  djembeHandSide,
  djembeNote,
} from '@/components/practice/timelineConstants'

interface TapFeedback {
  judgment: TimingJudgment
  timestamp: number
}

interface DjembePadGridProps {
  onTap: (note: DjembeNote) => void
  padFeedback: ReadonlyMap<string, TapFeedback>
  disabled: boolean
  activeStrokes: DjembeStroke[]
  nextExpectedNote?: DjembeNote | null
  leftHanded?: boolean
  showSyllables?: boolean
}

const feedbackColors: Record<TimingJudgment, string> = {
  'on-time': 'bg-green-400',
  early: 'bg-yellow-400',
  late: 'bg-yellow-400',
  miss: 'bg-red-600',
}

const KEY_LABELS: Record<DjembeStroke, Record<'left' | 'right', string>> = {
  bass: { left: 'S', right: 'L' },
  tone: { left: 'D', right: 'K' },
  slap: { left: 'F', right: 'J' },
}

const KEY_TO_TARGET: Record<string, { stroke: DjembeStroke; side: 'left' | 'right' }> = {
  s: { stroke: 'bass', side: 'left' },
  d: { stroke: 'tone', side: 'left' },
  f: { stroke: 'slap', side: 'left' },
  l: { stroke: 'bass', side: 'right' },
  k: { stroke: 'tone', side: 'right' },
  j: { stroke: 'slap', side: 'right' },
}

/**
 * Rectangular alternative to the fan: hands as columns, strokes as rows.
 * Larger, more forgiving targets (165 x 86) at the cost of the fan's physical
 * fidelity — the escape hatch if the fan's 74x68 bass arc proves too small for
 * young hands. Row order still follows the drum's radial order, bass (centre,
 * furthest reach) at the top down to slap (rim, nearest) at the bottom.
 */
export function DjembePadGrid({
  onTap,
  padFeedback,
  disabled,
  activeStrokes,
  nextExpectedNote,
  leftHanded = false,
  showSyllables = false,
}: DjembePadGridProps) {
  const onTapRef = useRef(onTap)
  const disabledRef = useRef(disabled)
  const nextExpectedRef = useRef(nextExpectedNote)
  const leftHandedRef = useRef(leftHanded)

  useEffect(() => {
    onTapRef.current = onTap
    disabledRef.current = disabled
    nextExpectedRef.current = nextExpectedNote
    leftHandedRef.current = leftHanded
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || disabledRef.current) return

      if (e.code === 'Space') {
        e.preventDefault()
        onTapRef.current(nextExpectedRef.current ?? 'bass-strong')
        return
      }

      const target = KEY_TO_TARGET[e.key.toLowerCase()]
      if (!target) return
      e.preventDefault()
      const strongSide = djembeHandSide('strong', leftHandedRef.current)
      const hand: DjembeHand = target.side === strongSide ? 'strong' : 'weak'
      onTapRef.current(djembeNote(target.stroke, hand))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const strokes = DJEMBE_RADIAL_ORDER.filter((s) => activeStrokes.includes(s))
  const visible = strokes.length > 0 ? strokes : DJEMBE_RADIAL_ORDER

  // Physical left-to-right order of the two hands.
  const columns: DjembeHand[] = djembeHandSide('strong', leftHanded) === 'left'
    ? ['strong', 'weak']
    : ['weak', 'strong']

  const colorFor = (note: DjembeNote, hand: DjembeHand) => {
    const feedback = padFeedback.get(note)
    if (feedback) return feedbackColors[feedback.judgment]
    if (disabled) return DJEMBE_HAND_MUTED_COLORS[hand]
    return DJEMBE_HAND_COLORS[hand]
  }

  return (
    <div data-testid="djembe-pad-grid" className="flex flex-col gap-2">
      {visible.map((stroke) => (
        <div key={stroke} className="flex justify-center gap-5">
          {columns.map((hand) => {
            const note = djembeNote(stroke, hand)
            const side = djembeHandSide(hand, leftHanded)
            const isNext = nextExpectedNote === note
            return (
              <button
                key={note}
                type="button"
                data-testid={`djembe-pad-${note}`}
                className={`relative flex min-h-[80px] flex-1 max-w-[165px] flex-col items-center justify-center rounded-2xl text-white font-bold shadow-md select-none touch-manipulation transition-colors duration-100 ${colorFor(note, hand)} ${isNext ? 'ring-4 ring-indigo-500' : ''}`}
                disabled={disabled}
                onPointerDown={(e) => {
                  if (!disabled) {
                    e.preventDefault()
                    onTap(note)
                  }
                }}
              >
                <span className="text-lg">
                  {showSyllables ? DJEMBE_SYLLABLES[stroke][hand] : DJEMBE_STROKE_NAMES[stroke]}
                </span>
                <span className="text-xs opacity-75">{KEY_LABELS[stroke][side]}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import type { DjembeHand, DjembeNote, DjembeStroke, TimingJudgment } from '@/types'
import {
  DJEMBE_HAND_FILLS,
  DJEMBE_HAND_MUTED_FILLS,
  DJEMBE_JUDGMENT_FILLS,
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

interface DjembePadFanProps {
  onTap: (note: DjembeNote) => void
  /** Judgment flash per "stroke-hand" target; each clears independently. */
  padFeedback: ReadonlyMap<string, TapFeedback>
  disabled: boolean
  activeStrokes: DjembeStroke[]
  nextExpectedNote?: DjembeNote | null
  leftHanded?: boolean
  showSyllables?: boolean
}

/**
 * Geometry. The drum's centre sits above the visible area with its apex
 * clipped, so bands radiate down toward the player and every band keeps a
 * usable arc length. A *narrow* fan is what makes the bands thick enough to
 * hit: width is capped by the screen and thickness is (OUTER - INNER) / 3, so
 * shrinking the angle permits a much larger radius. 80° total (40° per hand)
 * yields ~68px bands where 150° would give an unusable 40px.
 * See DJEMBE_LESSON_PLAN.md §12.4.
 */
const HALF_ANGLE_DEG = 40
const INNER_RADIUS = 60
const OUTER_RADIUS = 270

/**
 * Band radii, inner → outer. Bass is innermost (drum centre, furthest reach)
 * and gets extra thickness to offset its shorter arc; slap is at the rim,
 * nearest the player. The tone/slap gutter is the wide one — on a real drum
 * those two strokes are played at nearly the same spot, so the screen has to
 * supply a separation the instrument doesn't (§12.2).
 */
const BANDS: Record<DjembeStroke, { inner: number; outer: number }> = {
  bass: { inner: INNER_RADIUS, outer: 134 },
  tone: { inner: 138, outer: 202 },
  slap: { inner: 208, outer: OUTER_RADIUS },
}

/** Angular gap between the two hands, in degrees, as dead space. */
const HAND_GAP_DEG = 3

const VIEW_WIDTH = Math.ceil(2 * OUTER_RADIUS * Math.sin((HALF_ANGLE_DEG * Math.PI) / 180))
const VIEW_HEIGHT = Math.ceil(
  OUTER_RADIUS - INNER_RADIUS * Math.cos((HALF_ANGLE_DEG * Math.PI) / 180)
)
// Circle centre in viewBox coordinates: horizontally centred, and above the top
// edge by however much of the apex we clipped away.
const CX = VIEW_WIDTH / 2
const CY = -INNER_RADIUS * Math.cos((HALF_ANGLE_DEG * Math.PI) / 180)

const toRad = (deg: number) => (deg * Math.PI) / 180

/** Point on the circle at `deg` from straight-down, positive = clockwise. */
function polar(radius: number, deg: number): [number, number] {
  const a = toRad(deg)
  return [CX + radius * Math.sin(a), CY + radius * Math.cos(a)]
}

/** SVG path for an annular sector between two radii and two angles. */
function sectorPath(inner: number, outer: number, startDeg: number, endDeg: number): string {
  const [x1, y1] = polar(outer, startDeg)
  const [x2, y2] = polar(outer, endDeg)
  const [x3, y3] = polar(inner, endDeg)
  const [x4, y4] = polar(inner, startDeg)
  // Sweep flag 1 goes clockwise (increasing angle) on the outer arc, 0 back.
  return [
    `M ${x1} ${y1}`,
    `A ${outer} ${outer} 0 0 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${inner} ${inner} 0 0 0 ${x4} ${y4}`,
    'Z',
  ].join(' ')
}

const KEY_LABELS: Record<DjembeStroke, Record<'left' | 'right', string>> = {
  bass: { left: 'S', right: 'L' },
  tone: { left: 'D', right: 'K' },
  slap: { left: 'F', right: 'J' },
}

// Left-hand cluster s/d/f, right-hand cluster j/k/l, stroke order matching the
// on-screen radial order. Deliberately different from DrumPad's per-pad mapping
// because here the clusters must sit under the correct hand.
const KEY_TO_TARGET: Record<string, { stroke: DjembeStroke; side: 'left' | 'right' }> = {
  s: { stroke: 'bass', side: 'left' },
  d: { stroke: 'tone', side: 'left' },
  f: { stroke: 'slap', side: 'left' },
  l: { stroke: 'bass', side: 'right' },
  k: { stroke: 'tone', side: 'right' },
  j: { stroke: 'slap', side: 'right' },
}

export function DjembePadFan({
  onTap,
  padFeedback,
  disabled,
  activeStrokes,
  nextExpectedNote,
  leftHanded = false,
  showSyllables = false,
}: DjembePadFanProps) {
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
      // Resolve the physical side back to a hand, so the keys stay under the
      // right hands when the layout is mirrored.
      const strongSide = djembeHandSide('strong', leftHandedRef.current)
      const hand: DjembeHand = target.side === strongSide ? 'strong' : 'weak'
      onTapRef.current(djembeNote(target.stroke, hand))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const strokes = DJEMBE_RADIAL_ORDER.filter((s) => activeStrokes.includes(s))
  const visible = strokes.length > 0 ? strokes : DJEMBE_RADIAL_ORDER

  const fillFor = (note: DjembeNote, hand: DjembeHand) => {
    const feedback = padFeedback.get(note)
    if (feedback) return DJEMBE_JUDGMENT_FILLS[feedback.judgment]
    if (disabled) return DJEMBE_HAND_MUTED_FILLS[hand]
    return DJEMBE_HAND_FILLS[hand]
  }

  const hands: DjembeHand[] = ['strong', 'weak']

  return (
    <div data-testid="djembe-pad-fan" className="flex justify-center">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full max-w-[360px] touch-manipulation select-none"
        role="group"
        aria-label="Djembe drum head"
      >
        {visible.map((stroke) =>
          hands.map((hand) => {
            const side = djembeHandSide(hand, leftHanded)
            // Left half spans -HALF_ANGLE..-gap, right half +gap..+HALF_ANGLE.
            const startDeg =
              side === 'left' ? -HALF_ANGLE_DEG : HAND_GAP_DEG / 2
            const endDeg =
              side === 'left' ? -HAND_GAP_DEG / 2 : HALF_ANGLE_DEG
            const band = BANDS[stroke]
            const note = djembeNote(stroke, hand)
            const isNext = nextExpectedNote === note
            const midDeg = (startDeg + endDeg) / 2
            const [lx, ly] = polar((band.inner + band.outer) / 2, midDeg)
            const label = showSyllables
              ? DJEMBE_SYLLABLES[stroke][hand]
              : DJEMBE_STROKE_NAMES[stroke]

            return (
              <g key={note}>
                <path
                  data-testid={`djembe-pad-${note}`}
                  d={sectorPath(band.inner, band.outer, startDeg, endDeg)}
                  fill={fillFor(note, hand)}
                  stroke={isNext ? '#4f46e5' : 'white'}
                  strokeWidth={isNext ? 4 : 2}
                  className={`transition-[fill] duration-100 ${disabled ? '' : 'cursor-pointer'}`}
                  onPointerDown={(e) => {
                    if (disabled) return
                    e.preventDefault()
                    onTap(note)
                  }}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-white font-bold"
                  style={{ fontSize: 20 }}
                >
                  {label}
                </text>
                <text
                  x={lx}
                  y={ly + 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-white font-bold opacity-70"
                  style={{ fontSize: 13 }}
                >
                  {KEY_LABELS[stroke][side]}
                </text>
              </g>
            )
          })
        )}
      </svg>
    </div>
  )
}

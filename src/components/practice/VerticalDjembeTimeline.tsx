import type { ProcessedTapMarker } from './BeatTimeline'
import { BeatMarker } from './BeatMarker'
import type { MarkerShape } from './timelineConstants'
import {
  DJEMBE_LANE_ORDER,
  DJEMBE_LANE_WIDTH,
  DJEMBE_STROKE_LABELS,
  TAP_MARKER_COLORS,
  parseDjembeNote,
} from './timelineConstants'
import type { DjembeStroke } from '@/types'

interface VerticalMarker {
  beatIndex: number
  yPosition: number
  color: string
  isNext: boolean
  isJudged: boolean
  isHollow?: boolean
  borderColor?: string
  lane: string
  shape: MarkerShape
  label?: string
}

interface VerticalDjembeTimelineProps {
  markers: VerticalMarker[]
  measureLines: number[]
  scrollOffset: number
  hitLineY: number
  renderedHeight: number
  activeStrokes: DjembeStroke[]
  tapMarkers?: ProcessedTapMarker[]
  containerHeight: number
  loopBoundaryLines?: number[]
}

/** Markers are large enough to hold a legible letter, unlike the 16px default. */
const DJEMBE_MARKER_SIZE = 40

/**
 * One lane per stroke, with the hand carried by the marker's fill colour rather
 * than by a sub-lane offset. Encoding hand positionally — a small dot slightly
 * left or right inside a lane — is unreadable while scrolling; colour is
 * pre-attentive. This is the split Melodics uses (lane per kit component,
 * colour per hand). See DJEMBE_LESSON_PLAN.md §12.5.
 *
 * Lane count follows the strokes the exercise actually uses, so a single-stroke
 * drill shows one lane, not three.
 */
export function VerticalDjembeTimeline({
  markers,
  measureLines,
  scrollOffset,
  hitLineY,
  renderedHeight,
  activeStrokes,
  tapMarkers = [],
  containerHeight,
  loopBoundaryLines = [],
}: VerticalDjembeTimelineProps) {
  const lanes = activeStrokes.length > 0 ? activeStrokes : DJEMBE_LANE_ORDER
  const totalWidth = lanes.length * DJEMBE_LANE_WIDTH

  const laneIndexOf = (note: string) => {
    const parsed = parseDjembeNote(note)
    if (!parsed) return -1
    return lanes.indexOf(parsed.stroke)
  }

  return (
    <div
      data-testid="vertical-djembe-timeline"
      className="relative overflow-hidden mx-auto"
      style={{ height: containerHeight, width: totalWidth }}
    >
      {/* Lane backgrounds with stroke labels at the bottom */}
      {lanes.map((stroke, colIdx) => (
        <div
          key={`lane-${stroke}`}
          data-testid={`djembe-lane-${stroke}`}
          className={`absolute top-0 bottom-0 ${colIdx < lanes.length - 1 ? 'border-r border-gray-100' : ''}`}
          style={{ left: colIdx * DJEMBE_LANE_WIDTH, width: DJEMBE_LANE_WIDTH }}
        >
          <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-gray-400">
            {DJEMBE_STROKE_LABELS[stroke]}
          </div>
        </div>
      ))}

      {/* Scrolling content */}
      <div
        data-testid="vertical-scroll-content"
        className="absolute left-0 right-0"
        style={{
          height: renderedHeight,
          transform: `translateY(${-scrollOffset}px)`,
          willChange: 'transform',
        }}
      >
        {measureLines.map((yPos, i) => (
          <div
            key={`m-${i}`}
            className="absolute left-0 right-0 h-px bg-gray-200"
            style={{ top: yPos }}
          />
        ))}

        {loopBoundaryLines.map((yPos, i) => (
          <div
            key={`loop-${i}`}
            data-testid="loop-boundary-line"
            className="absolute left-0 right-0 z-10 h-2.5 -translate-y-1/2 bg-red-500/30"
            style={{ top: yPos }}
          />
        ))}

        {markers.map((marker) => {
          const colIdx = laneIndexOf(marker.lane)
          if (colIdx === -1) return null
          const centerX = colIdx * DJEMBE_LANE_WIDTH + DJEMBE_LANE_WIDTH / 2

          return (
            <BeatMarker
              key={`beat-${marker.beatIndex}`}
              shape={marker.shape}
              color={marker.color}
              borderColor={marker.borderColor}
              label={marker.label}
              size={DJEMBE_MARKER_SIZE}
              isNext={marker.isNext}
              isJudged={marker.isJudged}
              isHollow={marker.isHollow}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: centerX, top: marker.yPosition }}
            />
          )
        })}

        {tapMarkers.map((tm, i) => {
          const colIdx = laneIndexOf(String(tm.pad))
          if (colIdx === -1) return null

          return (
            <div
              key={`tap-${i}`}
              data-testid="tap-marker"
              className={`absolute h-0.5 ${TAP_MARKER_COLORS[tm.judgment as keyof typeof TAP_MARKER_COLORS] ?? 'bg-gray-400'} opacity-70`}
              style={{
                left: colIdx * DJEMBE_LANE_WIDTH + 4,
                width: DJEMBE_LANE_WIDTH - 8,
                top: tm.position,
              }}
            />
          )
        })}
      </div>

      {/* Hit line */}
      <div
        data-testid="hit-line"
        className="absolute left-0 right-0 z-10 flex items-center"
        style={{ top: hitLineY }}
      >
        <div className="flex-1 h-0.5 bg-indigo-600" />
        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-indigo-600 ml-0.5" />
      </div>
    </div>
  )
}

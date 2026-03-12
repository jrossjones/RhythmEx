import type { ProcessedTapMarker } from './BeatTimeline'
import { BeatMarker } from './BeatMarker'
import type { MarkerShape } from './timelineConstants'
import {
  DRUM_COLUMN_ORDER,
  DRUM_COLUMN_WIDTH,
  DRUM_LANE_LABELS,
  TAP_MARKER_COLORS,
} from './timelineConstants'
import type { DrumPad } from '@/types'

interface VerticalMarker {
  beatIndex: number
  yPosition: number // px from top of rendered content
  color: string
  isNext: boolean
  isJudged: boolean
  isHollow?: boolean
  borderColor?: string
  lane: string
  shape: MarkerShape
  label?: string
}

interface VerticalDrumTimelineProps {
  markers: VerticalMarker[]
  measureLines: number[] // y positions in px
  scrollOffset: number
  hitLineY: number
  renderedHeight: number
  activePads: DrumPad[]
  tapMarkers?: ProcessedTapMarker[]
  containerHeight: number
}

export function VerticalDrumTimeline({
  markers,
  measureLines,
  scrollOffset,
  hitLineY,
  renderedHeight,
  activePads,
  tapMarkers = [],
  containerHeight,
}: VerticalDrumTimelineProps) {
  const columns = activePads.length > 0 ? activePads : DRUM_COLUMN_ORDER
  const totalWidth = columns.length * DRUM_COLUMN_WIDTH

  return (
    <div
      data-testid="vertical-drum-timeline"
      className="relative overflow-hidden mx-auto"
      style={{ height: containerHeight, width: totalWidth }}
    >
      {/* Column backgrounds with labels at bottom */}
      {columns.map((pad, colIdx) => (
        <div
          key={`col-${pad}`}
          data-testid={`drum-column-${pad}`}
          className={`absolute top-0 bottom-0 ${colIdx < columns.length - 1 ? 'border-r border-gray-100' : ''}`}
          style={{
            left: colIdx * DRUM_COLUMN_WIDTH,
            width: DRUM_COLUMN_WIDTH,
          }}
        >
          <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-gray-400">
            {DRUM_LANE_LABELS[pad]}
          </div>
        </div>
      ))}

      {/* Scrolling content */}
      <div
        data-testid="vertical-scroll-content"
        className="absolute left-0 right-0"
        style={{
          height: renderedHeight,
          transform: `translateY(-${scrollOffset}px)`,
          willChange: 'transform',
        }}
      >
        {/* Measure dividers — horizontal lines */}
        {measureLines.map((yPos, i) => (
          <div
            key={`m-${i}`}
            className="absolute left-0 right-0 h-px bg-gray-200"
            style={{ top: yPos }}
          />
        ))}

        {/* Beat markers — placed in their column */}
        {markers.map((marker) => {
          const colIdx = columns.indexOf(marker.lane as DrumPad)
          if (colIdx === -1) return null
          const centerX = colIdx * DRUM_COLUMN_WIDTH + DRUM_COLUMN_WIDTH / 2

          return (
            <BeatMarker
              key={`beat-${marker.beatIndex}`}
              shape={marker.shape}
              color={marker.color}
              borderColor={marker.borderColor}
              label={marker.label}
              isNext={marker.isNext}
              isJudged={marker.isJudged}
              isHollow={marker.isHollow}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: centerX,
                top: marker.yPosition,
              }}
            />
          )
        })}

        {/* Tap markers — vertical tick within correct column */}
        {tapMarkers.map((tm, i) => {
          const pad = tm.pad as DrumPad
          const colIdx = columns.indexOf(pad)
          if (colIdx === -1) return null

          return (
            <div
              key={`tap-${i}`}
              data-testid="tap-marker"
              className={`absolute h-0.5 ${TAP_MARKER_COLORS[tm.judgment as keyof typeof TAP_MARKER_COLORS] ?? 'bg-gray-400'} opacity-70`}
              style={{
                left: colIdx * DRUM_COLUMN_WIDTH + 4,
                width: DRUM_COLUMN_WIDTH - 8,
                top: tm.position, // y position in rendered content
              }}
            />
          )
        })}
      </div>

      {/* Hit line — fixed horizontal line */}
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

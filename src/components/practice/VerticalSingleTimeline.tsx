import { BeatMarker } from './BeatMarker'
import type { MarkerShape } from './timelineConstants'
import {
  HANDPAN_COLUMN_WIDTH,
  TAP_MARKER_COLORS,
  handpanNoteOffset,
} from './timelineConstants'
import type { ProcessedTapMarker } from './BeatTimeline'

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
  noteIndex?: number
  totalNotes?: number
}

interface VerticalSingleTimelineProps {
  markers: VerticalMarker[]
  measureLines: number[]
  scrollOffset: number
  hitLineY: number
  renderedHeight: number
  tapMarkers?: ProcessedTapMarker[]
  containerHeight: number
  scaleNotes?: string[]
}

export function VerticalSingleTimeline({
  markers,
  measureLines,
  scrollOffset,
  hitLineY,
  renderedHeight,
  tapMarkers = [],
  containerHeight,
  scaleNotes = [],
}: VerticalSingleTimelineProps) {
  const columnWidth = HANDPAN_COLUMN_WIDTH

  return (
    <div
      data-testid="vertical-single-timeline"
      className="relative overflow-hidden mx-auto"
      style={{ height: containerHeight, width: columnWidth }}
    >
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
        {/* Measure dividers */}
        {measureLines.map((yPos, i) => (
          <div
            key={`m-${i}`}
            className="absolute left-0 right-0 h-px bg-gray-200"
            style={{ top: yPos }}
          />
        ))}

        {/* Beat markers — positioned with horizontal offset */}
        {markers.map((marker) => {
          const noteIdx = marker.noteIndex ?? 0
          const total = marker.totalNotes ?? scaleNotes.length

          // Ding (line shape) is full-width
          if (marker.shape === 'line') {
            return (
              <BeatMarker
                key={`beat-${marker.beatIndex}`}
                shape="line"
                color={marker.color}
                borderColor={marker.borderColor}
                label={marker.label}
                isNext={marker.isNext}
                isJudged={marker.isJudged}
                isHollow={marker.isHollow}
                className="absolute"
                style={{
                  left: 4,
                  right: 4,
                  top: marker.yPosition,
                  transform: 'translateY(-50%)',
                }}
              />
            )
          }

          // Other notes get horizontal offset
          const xFrac = handpanNoteOffset(noteIdx, total)
          const xPos = xFrac * columnWidth

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
                left: xPos,
                top: marker.yPosition,
              }}
            />
          )
        })}

        {/* Tap markers */}
        {tapMarkers.map((tm, i) => (
          <div
            key={`tap-${i}`}
            data-testid="tap-marker"
            className={`absolute h-0.5 ${TAP_MARKER_COLORS[tm.judgment as keyof typeof TAP_MARKER_COLORS] ?? 'bg-gray-400'} opacity-70`}
            style={{
              left: 8,
              width: columnWidth - 16,
              top: tm.position,
            }}
          />
        ))}
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

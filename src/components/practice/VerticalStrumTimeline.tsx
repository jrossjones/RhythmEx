import { BeatMarker } from './BeatMarker'
import type { MarkerShape } from './timelineConstants'
import {
  STRUM_COLUMN_WIDTH,
  TAP_MARKER_COLORS,
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
  rotation?: number
}

interface ChordChange {
  chord: string
  yPosition: number
}

interface VerticalStrumTimelineProps {
  markers: VerticalMarker[]
  measureLines: number[]
  scrollOffset: number
  hitLineY: number
  renderedHeight: number
  tapMarkers?: ProcessedTapMarker[]
  containerHeight: number
  chordChanges: ChordChange[]
}

export function VerticalStrumTimeline({
  markers,
  measureLines,
  scrollOffset,
  hitLineY,
  renderedHeight,
  tapMarkers = [],
  containerHeight,
  chordChanges,
}: VerticalStrumTimelineProps) {
  const columnWidth = STRUM_COLUMN_WIDTH

  return (
    <div
      data-testid="vertical-strum-timeline"
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

        {/* Chord change labels */}
        {chordChanges.map((cc, i) => (
          <div
            key={`chord-${i}`}
            data-testid="chord-change-label"
            className="absolute text-xs font-bold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 -translate-y-1/2 whitespace-nowrap"
            style={{
              left: 4,
              top: cc.yPosition,
            }}
          >
            {cc.chord}
          </div>
        ))}

        {/* Beat markers — all centered */}
        {markers.map((marker) => (
          <BeatMarker
            key={`beat-${marker.beatIndex}`}
            shape={marker.shape}
            color={marker.color}
            borderColor={marker.borderColor}
            label={marker.label}
            isNext={marker.isNext}
            isJudged={marker.isJudged}
            isHollow={marker.isHollow}
            rotation={marker.rotation}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: columnWidth / 2,
              top: marker.yPosition,
            }}
          />
        ))}

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

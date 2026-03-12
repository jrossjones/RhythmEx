import type { ProcessedTapMarker } from './BeatTimeline'
import { BeatMarker } from './BeatMarker'
import type { MarkerShape } from './timelineConstants'

interface Marker {
  position: number
  color: string
  isNext: boolean
  isJudged: boolean
  isHollow?: boolean
  borderColor?: string
  shape?: MarkerShape
  label?: string
}

interface SingleRowTimelineProps {
  markers: Marker[]
  measureLines: number[]
  playheadPosition: number
  isScrolling: boolean
  tapMarkers?: ProcessedTapMarker[]
}

export function SingleRowTimeline({ markers, measureLines, playheadPosition, isScrolling, tapMarkers = [] }: SingleRowTimelineProps) {
  return (
    <div className="relative h-16">
      {/* Measure dividers */}
      {measureLines.map((pos) => (
        <div
          key={`m-${pos}`}
          className="absolute top-0 bottom-0 w-px bg-gray-200"
          style={{ left: isScrolling ? pos : `${pos}%` }}
        />
      ))}

      {/* Beat markers */}
      {markers.map((marker, i) => (
        <BeatMarker
          key={`beat-${i}`}
          shape={marker.shape ?? 'circle'}
          color={marker.color}
          borderColor={marker.borderColor}
          label={marker.label}
          isNext={marker.isNext}
          isJudged={marker.isJudged}
          isHollow={marker.isHollow}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{
            left: isScrolling ? marker.position : `${marker.position}%`,
          }}
        />
      ))}

      {/* Tap markers */}
      {tapMarkers.map((tm, i) => (
        <div
          key={`tap-${i}`}
          data-testid="tap-marker"
          className={`absolute top-0 bottom-0 w-0.5 ${tm.color} opacity-70`}
          style={{ left: isScrolling ? tm.position : `${tm.position}%` }}
        />
      ))}

      {/* Playhead */}
      <div
        data-testid="playhead"
        className="absolute top-0 bottom-0 w-0.5 bg-indigo-600"
        style={{ left: isScrolling ? playheadPosition : `${playheadPosition}%` }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-indigo-600" />
      </div>
    </div>
  )
}

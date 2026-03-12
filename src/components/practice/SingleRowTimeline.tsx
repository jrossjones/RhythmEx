import type { ProcessedTapMarker } from './BeatTimeline'

interface Marker {
  position: number
  color: string
  isNext: boolean
  isJudged: boolean
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
        <div
          key={`beat-${i}`}
          data-testid="beat-marker"
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full ${marker.color} ${marker.isNext ? 'animate-pulse scale-125' : ''} ${marker.isJudged ? 'ring-2 ring-white scale-110' : ''}`}
          style={{
            left: isScrolling ? marker.position : `${marker.position}%`,
            width: 12,
            height: 12,
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

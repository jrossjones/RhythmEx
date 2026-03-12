import type { ProcessedTapMarker } from './BeatTimeline'
import { DRUM_LANE_ORDER, DRUM_PAD_BORDER_COLORS, LANE_HEIGHT } from './timelineConstants'
import type { DrumPad } from '@/types'

interface Marker {
  position: number
  color: string
  isNext: boolean
  isJudged: boolean
  lane: string
}

interface DrumLaneTimelineProps {
  markers: Marker[]
  measureLines: number[]
  playheadPosition: number
  isScrolling: boolean
  tapMarkers?: ProcessedTapMarker[]
}

export function DrumLaneTimeline({ markers, measureLines, playheadPosition, isScrolling, tapMarkers = [] }: DrumLaneTimelineProps) {
  const totalHeight = DRUM_LANE_ORDER.length * LANE_HEIGHT

  return (
    <div className="relative" style={{ height: totalHeight }}>
      {/* Lane backgrounds with subtle borders */}
      {DRUM_LANE_ORDER.map((pad, laneIdx) => (
        <div
          key={`lane-${pad}`}
          data-testid={`drum-lane-${pad}`}
          className={`absolute left-0 right-0 ${laneIdx < DRUM_LANE_ORDER.length - 1 ? 'border-b border-gray-100' : ''}`}
          style={{ top: laneIdx * LANE_HEIGHT, height: LANE_HEIGHT }}
        />
      ))}

      {/* Measure dividers */}
      {measureLines.map((pos) => (
        <div
          key={`m-${pos}`}
          className="absolute top-0 bottom-0 w-px bg-gray-200"
          style={{ left: isScrolling ? pos : `${pos}%` }}
        />
      ))}

      {/* Beat markers — placed in their lane */}
      {markers.map((marker, i) => {
        const laneIdx = DRUM_LANE_ORDER.indexOf(marker.lane as typeof DRUM_LANE_ORDER[number])
        if (laneIdx === -1) return null
        const centerY = laneIdx * LANE_HEIGHT + LANE_HEIGHT / 2

        return (
          <div
            key={`beat-${i}`}
            data-testid="beat-marker"
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${marker.color} ${marker.isNext ? 'animate-pulse scale-125' : ''} ${marker.isJudged ? 'ring-2 ring-white scale-110' : ''}`}
            style={{
              left: isScrolling ? marker.position : `${marker.position}%`,
              top: centerY,
              width: 10,
              height: 10,
            }}
          />
        )
      })}

      {/* Tap markers — tick lines showing where taps landed */}
      {tapMarkers.map((tm, i) => {
        const laneIdx = tm.lane ? DRUM_LANE_ORDER.indexOf(tm.lane as typeof DRUM_LANE_ORDER[number]) : -1
        if (laneIdx === -1) return null
        const centerY = laneIdx * LANE_HEIGHT + LANE_HEIGHT / 2

        return (
          <div key={`tap-${i}`}>
            {/* Vertical tick line */}
            <div
              data-testid="tap-marker"
              className={`absolute w-0.5 ${tm.color} opacity-70`}
              style={{
                left: isScrolling ? tm.position : `${tm.position}%`,
                top: laneIdx * LANE_HEIGHT,
                height: LANE_HEIGHT,
              }}
            />
            {/* Small dot at center of lane */}
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${tm.color}`}
              style={{
                left: isScrolling ? tm.position : `${tm.position}%`,
                top: centerY,
                width: 6,
                height: 6,
              }}
            />
            {/* Strict mode: hollow outline dot at expected position for wrong pad */}
            {tm.expectedPad && tm.expectedPosition !== undefined && (
              <div
                data-testid="expected-marker"
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${DRUM_PAD_BORDER_COLORS[tm.expectedPad as DrumPad] ?? 'border-gray-400'}`}
                style={{
                  left: isScrolling ? tm.expectedPosition : `${tm.expectedPosition}%`,
                  top: (() => {
                    const eLaneIdx = DRUM_LANE_ORDER.indexOf(tm.expectedPad as typeof DRUM_LANE_ORDER[number])
                    return eLaneIdx !== -1 ? eLaneIdx * LANE_HEIGHT + LANE_HEIGHT / 2 : centerY
                  })(),
                  width: 8,
                  height: 8,
                  backgroundColor: 'transparent',
                }}
              />
            )}
          </div>
        )
      })}

      {/* Playhead — spans full height */}
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

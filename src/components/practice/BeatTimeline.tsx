import { useEffect, useRef, useState } from 'react'
import type { Exercise, InstrumentType, TapMarker, TimingJudgment } from '@/types'
import { beatTimesMs, exerciseDurationMs, msPerBeat } from '@/utils/rhythm'
import { SingleRowTimeline } from './SingleRowTimeline'
import { DrumLaneTimeline } from './DrumLaneTimeline'
import {
  DRUM_PAD_COLORS,
  DURATION_COLORS,
  JUDGMENT_COLORS,
  TAP_MARKER_COLORS,
  DRUM_LANE_ORDER,
  DRUM_LANE_LABELS,
  PX_PER_BEAT,
  PLAYHEAD_POSITION,
  LANE_HEIGHT,
  LABEL_WIDTH,
} from './timelineConstants'

export interface ProcessedTapMarker {
  position: number
  color: string
  lane?: string
  pad?: string
  judgment: string
  expectedPosition?: number
  expectedPad?: string
}

interface BeatTimelineProps {
  exercise: Exercise
  progress: number
  bpm: number
  beatJudgments?: Map<number, TimingJudgment>
  instrument?: InstrumentType
  tapMarkers?: TapMarker[]
}

export function BeatTimeline({ exercise, progress, bpm, beatJudgments, instrument, tapMarkers }: BeatTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const isDrum = instrument === 'drums'
  const exerciseWithBpm = { ...exercise, bpm }
  const durationMs = exerciseDurationMs(exerciseWithBpm)
  const times = beatTimesMs(exerciseWithBpm)

  // Find the next upcoming beat index for pulse effect
  const playheadMs = progress * durationMs
  const nextBeatIndex = times.findIndex((t) => t > playheadMs)

  // Measure dividers
  const [beatsPerMeasure] = exercise.timeSignature
  const msPerMeasure = beatsPerMeasure * msPerBeat(bpm)
  const measureCount = exercise.measures

  // Scrolling calculations
  const totalBeats = exercise.measures * beatsPerMeasure
  const renderedWidth = totalBeats * PX_PER_BEAT
  const labelOffset = isDrum ? LABEL_WIDTH : 0
  const isScrolling = containerWidth > 0 && renderedWidth > (containerWidth - labelOffset)

  const contentWidth = isScrolling ? renderedWidth : containerWidth - labelOffset
  const visibleWidth = containerWidth - labelOffset

  // Measure line positions
  const measureLines: number[] = []
  for (let i = 1; i < measureCount; i++) {
    const frac = (i * msPerMeasure) / durationMs
    measureLines.push(isScrolling ? frac * renderedWidth : frac * 100)
  }

  // Build markers
  const markers = exercise.beats.map((beat, i) => {
    const frac = durationMs > 0 ? times[i] / durationMs : 0
    const position = isScrolling ? frac * renderedWidth : frac * 100
    const judgment = beatJudgments?.get(i)
    const baseColor = isDrum
      ? (DRUM_PAD_COLORS[beat.note as keyof typeof DRUM_PAD_COLORS] ?? 'bg-gray-400')
      : (DURATION_COLORS[beat.duration] ?? 'bg-gray-400')
    const color = judgment ? JUDGMENT_COLORS[judgment] : baseColor
    const isNext = i === nextBeatIndex && !judgment
    const isJudged = !!judgment
    return { position, color, isNext, isJudged, lane: beat.note }
  })

  // Playhead position
  const playheadPos = isScrolling ? progress * renderedWidth : progress * 100

  // Scroll offset — pin playhead at ~30% from left
  let scrollOffset = 0
  if (isScrolling && contentWidth > visibleWidth) {
    const playheadPx = progress * renderedWidth
    scrollOffset = Math.max(0, Math.min(playheadPx - visibleWidth * PLAYHEAD_POSITION, renderedWidth - visibleWidth))
  }

  // Process tap markers
  const processedTapMarkers: ProcessedTapMarker[] = (tapMarkers ?? []).map((tm) => {
    const frac = durationMs > 0 ? tm.ms / durationMs : 0
    const position = isScrolling ? frac * renderedWidth : frac * 100
    const color = TAP_MARKER_COLORS[tm.judgment]
    let expectedPosition: number | undefined
    if (tm.expectedPad && tm.expectedMs !== undefined) {
      const eFrac = durationMs > 0 ? tm.expectedMs / durationMs : 0
      expectedPosition = isScrolling ? eFrac * renderedWidth : eFrac * 100
    }
    return {
      position,
      color,
      lane: tm.pad,
      pad: tm.pad,
      judgment: tm.judgment,
      expectedPosition,
      expectedPad: tm.expectedPad,
    }
  })

  // ResizeObserver to measure container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl bg-white shadow-md">
      {/* Fixed drum lane labels (drums only) */}
      {isDrum && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex flex-col" data-testid="drum-lane-labels" style={{ width: LABEL_WIDTH }}>
          {DRUM_LANE_ORDER.map((pad) => (
            <div
              key={pad}
              className="flex items-center justify-center text-xs font-bold text-gray-500"
              style={{ height: LANE_HEIGHT }}
            >
              {DRUM_LANE_LABELS[pad]}
            </div>
          ))}
        </div>
      )}

      {/* Scrolling content area */}
      <div style={{ marginLeft: isDrum ? LABEL_WIDTH : 0, overflow: 'hidden' }}>
        <div
          data-testid="timeline-content"
          style={{
            width: isScrolling ? renderedWidth : '100%',
            transform: isScrolling ? `translateX(-${scrollOffset}px)` : undefined,
            willChange: isScrolling ? 'transform' : undefined,
          }}
        >
          {isDrum ? (
            <DrumLaneTimeline
              markers={markers}
              measureLines={measureLines}
              playheadPosition={playheadPos}
              isScrolling={isScrolling}
              tapMarkers={processedTapMarkers}
            />
          ) : (
            <SingleRowTimeline
              markers={markers}
              measureLines={measureLines}
              playheadPosition={playheadPos}
              isScrolling={isScrolling}
              tapMarkers={processedTapMarkers}
            />
          )}
        </div>
      </div>
    </div>
  )
}

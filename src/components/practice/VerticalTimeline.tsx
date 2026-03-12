import { useMemo } from 'react'
import type { DrumPad, Exercise, InstrumentType, TapMarker, TimingJudgment } from '@/types'
import { beatTimesMs, exerciseDurationMs, msPerBeat } from '@/utils/rhythm'
import { VerticalDrumTimeline } from './VerticalDrumTimeline'
import { VerticalSingleTimeline } from './VerticalSingleTimeline'
import type { MarkerShape } from './timelineConstants'
import {
  DRUM_PAD_COLORS,
  DURATION_COLORS,
  JUDGMENT_COLORS,
  JUDGMENT_BORDER_COLORS,
  TAP_MARKER_COLORS,
  DRUM_PAD_SHAPES,
  DRUM_PAD_MARKER_LABELS,
  HANDPAN_NOTE_COLORS,
  HANDPAN_REGISTER_SHAPES,
  handpanNoteRegister,
  pitchClass,
  PX_PER_BEAT_VERTICAL,
  HIT_LINE_POSITION_VERTICAL,
  VERTICAL_TIMELINE_HEIGHT,
} from './timelineConstants'

interface VerticalTimelineProps {
  exercise: Exercise
  progress: number
  bpm: number
  beatJudgments?: Map<number, TimingJudgment>
  instrument?: InstrumentType
  tapMarkers?: TapMarker[]
  activePads?: DrumPad[]
  scaleNotes?: string[]
}

export function VerticalTimeline({
  exercise,
  progress,
  bpm,
  beatJudgments,
  instrument,
  tapMarkers,
  activePads = [],
  scaleNotes = [],
}: VerticalTimelineProps) {
  const isDrum = instrument === 'drums'
  const isHandpan = instrument === 'handpan'

  const exerciseWithBpm = useMemo(() => ({ ...exercise, bpm }), [exercise, bpm])
  const durationMs = exerciseDurationMs(exerciseWithBpm)
  const times = beatTimesMs(exerciseWithBpm)

  const containerHeight = VERTICAL_TIMELINE_HEIGHT
  const hitLineY = containerHeight * HIT_LINE_POSITION_VERTICAL

  // Calculate rendered height based on exercise length
  const [beatsPerMeasure] = exercise.timeSignature
  const totalBeats = exercise.measures * beatsPerMeasure
  const renderedHeight = Math.max(totalBeats * PX_PER_BEAT_VERTICAL, containerHeight)

  // Playhead position in rendered content (Y axis)
  const playheadY = progress * renderedHeight

  // Scroll offset: pin playhead at hit line position
  const scrollOffset = Math.max(
    0,
    Math.min(playheadY - hitLineY, renderedHeight - containerHeight)
  )

  // Next beat index for pulse effect
  const playheadMs = progress * durationMs
  const nextBeatIndex = times.findIndex((t) => t > playheadMs)

  // Measure line positions (Y axis)
  const msPerMeasure = beatsPerMeasure * msPerBeat(bpm)
  const measureLines: number[] = []
  for (let i = 1; i < exercise.measures; i++) {
    const frac = (i * msPerMeasure) / durationMs
    measureLines.push(frac * renderedHeight)
  }

  // Build note index lookup for handpan
  const noteIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    scaleNotes.forEach((note, idx) => map.set(note, idx))
    return map
  }, [scaleNotes])

  // Build markers
  const markers = exercise.beats.map((beat, i) => {
    const frac = durationMs > 0 ? times[i] / durationMs : 0
    const yPosition = frac * renderedHeight
    const judgment = beatJudgments?.get(i)

    const baseColor = isDrum
      ? (DRUM_PAD_COLORS[beat.note as keyof typeof DRUM_PAD_COLORS] ?? 'bg-gray-400')
      : isHandpan
        ? (HANDPAN_NOTE_COLORS[pitchClass(beat.note)] ?? 'bg-gray-400')
        : (DURATION_COLORS[beat.duration] ?? 'bg-gray-400')
    const color = judgment ? JUDGMENT_COLORS[judgment] : baseColor
    const isNext = i === nextBeatIndex && !judgment
    const isJudged = !!judgment
    const isHollow = !!judgment
    const borderColor = judgment ? JUDGMENT_BORDER_COLORS[judgment] : undefined

    // Shape and label
    let shape: MarkerShape = 'circle'
    let label: string | undefined
    let noteIndex: number | undefined
    let totalNotes: number | undefined

    if (isDrum) {
      const pad = beat.note as keyof typeof DRUM_PAD_SHAPES
      shape = DRUM_PAD_SHAPES[pad] ?? 'circle'
      label = DRUM_PAD_MARKER_LABELS[pad]
    } else if (isHandpan) {
      const idx = noteIndexMap.get(beat.note) ?? 0
      noteIndex = idx
      totalNotes = scaleNotes.length
      // Ding (first note in scale) uses line shape
      if (idx === 0 && scaleNotes.length > 0) {
        shape = 'line'
      } else {
        shape = HANDPAN_REGISTER_SHAPES[handpanNoteRegister(beat.note)]
      }
      label = pitchClass(beat.note)
    }

    return {
      beatIndex: i,
      yPosition,
      color,
      isNext,
      isJudged,
      isHollow,
      borderColor,
      lane: beat.note,
      shape,
      label,
      noteIndex,
      totalNotes,
    }
  })

  // Process tap markers (Y positions)
  const processedTapMarkers = (tapMarkers ?? []).map((tm) => {
    const frac = durationMs > 0 ? tm.ms / durationMs : 0
    return {
      position: frac * renderedHeight,
      color: TAP_MARKER_COLORS[tm.judgment],
      lane: tm.pad,
      pad: tm.pad,
      judgment: tm.judgment,
    }
  })

  return (
    <div data-testid="vertical-timeline" className="rounded-2xl bg-white shadow-md p-2">
      {isDrum ? (
        <VerticalDrumTimeline
          markers={markers}
          measureLines={measureLines}
          scrollOffset={scrollOffset}
          hitLineY={hitLineY}
          renderedHeight={renderedHeight}
          activePads={activePads}
          tapMarkers={processedTapMarkers}
          containerHeight={containerHeight}
        />
      ) : (
        <VerticalSingleTimeline
          markers={markers}
          measureLines={measureLines}
          scrollOffset={scrollOffset}
          hitLineY={hitLineY}
          renderedHeight={renderedHeight}
          tapMarkers={processedTapMarkers}
          containerHeight={containerHeight}
          scaleNotes={scaleNotes}
        />
      )}
    </div>
  )
}

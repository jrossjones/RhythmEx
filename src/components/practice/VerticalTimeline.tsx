import { useMemo } from 'react'
import type { DrumPad, Exercise, InstrumentType, TapMarker, TimingJudgment } from '@/types'
import { beatTimesMs, exerciseDurationMs, msPerBeat } from '@/utils/rhythm'
import { VerticalDrumTimeline } from './VerticalDrumTimeline'
import { VerticalSingleTimeline } from './VerticalSingleTimeline'
import { VerticalStrumTimeline } from './VerticalStrumTimeline'
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
  STRUM_DIRECTION_COLORS,
  STRUM_DIRECTION_LABELS,
  type StrumDirection,
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
  chordDiagramMode?: 'fixed' | 'scroll'
  // Seamless-loop continuous scroll: also render the incoming (next) and
  // outgoing (previous) iterations so the wrap has no visual jump.
  showLoopGhosts?: boolean
  prevBeatJudgments?: Map<number, TimingJudgment> | null
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
  chordDiagramMode = 'fixed',
  showLoopGhosts = false,
  prevBeatJudgments = null,
}: VerticalTimelineProps) {
  const isDrum = instrument === 'drums'
  const isHandpan = instrument === 'handpan'
  const isStrumming = instrument === 'strumming'

  const exerciseWithBpm = useMemo(() => ({ ...exercise, bpm }), [exercise, bpm])
  const durationMs = exerciseDurationMs(exerciseWithBpm)
  const times = beatTimesMs(exerciseWithBpm)

  const containerHeight = VERTICAL_TIMELINE_HEIGHT
  const hitLineY = containerHeight * HIT_LINE_POSITION_VERTICAL

  // Calculate rendered height with padding so playhead can stay at hit line
  // for the entire exercise. Beats drop from top toward the hit line.
  const [beatsPerMeasure] = exercise.timeSignature
  const totalBeats = exercise.measures * beatsPerMeasure
  const exercisePixels = totalBeats * PX_PER_BEAT_VERTICAL
  const topPadding = containerHeight - hitLineY  // space above for future beats to enter
  const bottomPadding = hitLineY                 // space below for past beats to exit
  const renderedHeight = exercisePixels + topPadding + bottomPadding

  // Inverted Y: beat 0 near bottom, last beat near top. Playhead drops from bottom to top.
  const playheadY = topPadding + (1 - progress) * exercisePixels

  // Scroll offset: pin playhead at hit line position.
  // Upper clamp keeps beat 0 in view during lead-in; no lower clamp so the
  // playhead can reach the last beat and past beats can exit downward.
  const scrollOffset = Math.min(playheadY - hitLineY, renderedHeight - containerHeight)

  // Pulse the most recent unjudged beat at or behind the playhead (never ahead of it)
  const playheadMs = progress * durationMs
  let nextBeatIndex = -1
  for (let i = 0; i < times.length; i++) {
    if (times[i] > playheadMs) break
    if (beatJudgments?.get(i)) continue
    nextBeatIndex = i
  }

  // Iterations to render. Current only (0), plus the incoming next iteration (+1)
  // and — once at least one loop has completed — the outgoing previous one (-1).
  const iterationOffsets = useMemo(
    () => (showLoopGhosts ? (prevBeatJudgments ? [-1, 0, 1] : [0, 1]) : [0]),
    [showLoopGhosts, prevBeatJudgments],
  )

  // Measure line positions (Y axis, inverted). During a seamless loop, draw a
  // continuous grid (including iteration boundaries) so the lines never jump.
  const msPerMeasure = beatsPerMeasure * msPerBeat(bpm)
  const measureLines: number[] = []
  if (showLoopGhosts) {
    // Internal dividers only (i>=1); the iteration boundary (i=0) is drawn as
    // the red loop-seam line below so it isn't doubled up in gray.
    for (const k of iterationOffsets) {
      for (let i = 1; i < exercise.measures; i++) {
        const frac = i / exercise.measures
        measureLines.push(topPadding + (1 - (frac + k)) * exercisePixels)
      }
    }
  } else {
    for (let i = 1; i < exercise.measures; i++) {
      const frac = (i * msPerMeasure) / durationMs
      measureLines.push(topPadding + (1 - frac) * exercisePixels)
    }
  }

  // Loop seam: a marker at each iteration boundary (end → new start), shown only
  // during a seamless loop. Scrolls with the content so it passes the hit line
  // exactly at each wrap.
  const loopBoundaryLines: number[] = []
  if (showLoopGhosts) {
    const minK = Math.min(...iterationOffsets)
    const maxK = Math.max(...iterationOffsets)
    for (let f = minK; f <= maxK + 1; f++) {
      loopBoundaryLines.push(topPadding + (1 - f) * exercisePixels)
    }
  }

  // Build note index lookup for handpan
  const noteIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    scaleNotes.forEach((note, idx) => map.set(note, idx))
    return map
  }, [scaleNotes])

  // Build the markers for one iteration. iterationOffset shifts the whole set
  // vertically by one exercise length (+1 = incoming above, -1 = outgoing below).
  // Ghost iterations use their own judgment map and never pulse.
  const buildIterationMarkers = (
    iterationOffset: number,
    judgments: Map<number, TimingJudgment> | null | undefined,
  ) =>
    exercise.beats.map((beat, i) => {
    const frac = durationMs > 0 ? times[i] / durationMs : 0
    const yPosition = topPadding + (1 - (frac + iterationOffset)) * exercisePixels
    const judgment = judgments?.get(i)

    const baseColor = isDrum
      ? (DRUM_PAD_COLORS[beat.note as keyof typeof DRUM_PAD_COLORS] ?? 'bg-gray-400')
      : isHandpan
        ? (HANDPAN_NOTE_COLORS[pitchClass(beat.note)] ?? 'bg-gray-400')
        : isStrumming
          ? (STRUM_DIRECTION_COLORS[beat.note as StrumDirection] ?? 'bg-gray-400')
          : (DURATION_COLORS[beat.duration] ?? 'bg-gray-400')
    const color = judgment ? JUDGMENT_COLORS[judgment] : baseColor
    const isNext = iterationOffset === 0 && i === nextBeatIndex && !judgment
    const isJudged = !!judgment
    const isHollow = !!judgment
    const borderColor = judgment ? JUDGMENT_BORDER_COLORS[judgment] : undefined

    // Shape and label
    let shape: MarkerShape = 'circle'
    let label: string | undefined
    let noteIndex: number | undefined
    let totalNotes: number | undefined
    let rotation: number | undefined

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
    } else if (isStrumming) {
      shape = 'triangle'
      rotation = beat.note === 'down' ? 180 : 0
      label = STRUM_DIRECTION_LABELS[beat.note as StrumDirection]
    }

    return {
      // Offset keeps React keys unique across the ghost iterations.
      beatIndex: i + iterationOffset * 100000,
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
      rotation,
    }
  })

  // Current iteration, plus incoming/outgoing ghosts during a seamless loop.
  const markers = iterationOffsets.flatMap((k) =>
    buildIterationMarkers(
      k,
      k === 0 ? beatJudgments : k < 0 ? prevBeatJudgments : undefined,
    ),
  )

  // Process tap markers (Y positions, inverted)
  const processedTapMarkers = (tapMarkers ?? []).map((tm) => {
    const frac = durationMs > 0 ? tm.ms / durationMs : 0
    return {
      position: topPadding + (1 - frac) * exercisePixels,
      color: TAP_MARKER_COLORS[tm.judgment],
      lane: tm.pad,
      pad: tm.pad,
      judgment: tm.judgment,
    }
  })

  // Compute chord changes for strumming timeline (repeated per rendered iteration)
  const chordChanges = useMemo(() => {
    if (!isStrumming) return []
    const base: { chord: string; frac: number }[] = []
    let lastChord = ''
    for (let i = 0; i < exercise.beats.length; i++) {
      const chord = exercise.beats[i].chord
      if (chord && chord !== lastChord) {
        lastChord = chord
        base.push({ chord, frac: durationMs > 0 ? times[i] / durationMs : 0 })
      }
    }
    return iterationOffsets.flatMap((k) =>
      base.map((b) => ({
        chord: b.chord,
        yPosition: topPadding + (1 - (b.frac + k)) * exercisePixels,
      })),
    )
  }, [isStrumming, exercise.beats, durationMs, times, topPadding, exercisePixels, iterationOffsets])

  return (
    <div data-testid="vertical-timeline" className="rounded-2xl bg-white shadow-md p-2">
      {isStrumming ? (
        <VerticalStrumTimeline
          markers={markers}
          measureLines={measureLines}
          scrollOffset={scrollOffset}
          hitLineY={hitLineY}
          renderedHeight={renderedHeight}
          tapMarkers={processedTapMarkers}
          containerHeight={containerHeight}
          chordChanges={chordChanges}
          chordDiagramMode={chordDiagramMode}
          loopBoundaryLines={loopBoundaryLines}
        />
      ) : isDrum ? (
        <VerticalDrumTimeline
          markers={markers}
          measureLines={measureLines}
          scrollOffset={scrollOffset}
          hitLineY={hitLineY}
          renderedHeight={renderedHeight}
          activePads={activePads}
          tapMarkers={processedTapMarkers}
          containerHeight={containerHeight}
          loopBoundaryLines={loopBoundaryLines}
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
          loopBoundaryLines={loopBoundaryLines}
        />
      )}
    </div>
  )
}

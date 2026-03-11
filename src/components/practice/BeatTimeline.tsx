import type { Exercise, InstrumentType, TimingJudgment } from '@/types'
import { beatTimesMs, exerciseDurationMs, msPerBeat } from '@/utils/rhythm'

interface BeatTimelineProps {
  exercise: Exercise
  progress: number
  bpm: number
  beatJudgments?: Map<number, TimingJudgment>
  instrument?: InstrumentType
}

const durationColors: Record<string, string> = {
  '4n': 'bg-indigo-400',
  '8n': 'bg-sky-400',
  '16n': 'bg-violet-400',
  '2n': 'bg-amber-400',
  '1n': 'bg-amber-500',
}

const drumPadColors: Record<string, string> = {
  kick: 'bg-red-400',
  snare: 'bg-orange-400',
  hihat: 'bg-cyan-400',
  tom1: 'bg-purple-400',
  tom2: 'bg-pink-400',
}

const judgmentColors: Record<TimingJudgment, string> = {
  'on-time': 'bg-green-400',
  early: 'bg-yellow-400',
  late: 'bg-yellow-400',
  miss: 'bg-red-400',
}

export function BeatTimeline({ exercise, progress, bpm, beatJudgments, instrument }: BeatTimelineProps) {
  const exerciseWithBpm = { ...exercise, bpm }
  const durationMs = exerciseDurationMs(exerciseWithBpm)
  const times = beatTimesMs(exerciseWithBpm)
  const playheadMs = progress * durationMs

  // Find the next upcoming beat index for pulse effect
  const nextBeatIndex = times.findIndex((t) => t > playheadMs)

  // Measure dividers
  const [beatsPerMeasure] = exercise.timeSignature
  const msPerMeasure = beatsPerMeasure * msPerBeat(bpm)
  const measureCount = exercise.measures
  const measureLines: number[] = []
  for (let i = 1; i < measureCount; i++) {
    measureLines.push((i * msPerMeasure) / durationMs * 100)
  }

  return (
    <div className="relative h-16 w-full rounded-2xl bg-white shadow-md overflow-hidden">
      {/* Measure dividers */}
      {measureLines.map((pct) => (
        <div
          key={`m-${pct}`}
          className="absolute top-0 bottom-0 w-px bg-gray-200"
          style={{ left: `${pct}%` }}
        />
      ))}

      {/* Beat markers */}
      {exercise.beats.map((beat, i) => {
        const pct = durationMs > 0 ? (times[i] / durationMs) * 100 : 0
        const judgment = beatJudgments?.get(i)
        const baseColor = instrument === 'drums'
          ? (drumPadColors[beat.note] ?? 'bg-gray-400')
          : (durationColors[beat.duration] ?? 'bg-gray-400')
        const color = judgment ? judgmentColors[judgment] : baseColor
        const isNext = i === nextBeatIndex && !judgment
        const isJudged = !!judgment
        return (
          <div
            key={`${beat.time}-${i}`}
            data-testid="beat-marker"
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full ${color} ${isNext ? 'animate-pulse scale-125' : ''} ${isJudged ? 'ring-2 ring-white scale-110' : ''}`}
            style={{
              left: `${pct}%`,
              width: 12,
              height: 12,
            }}
          />
        )
      })}

      {/* Playhead */}
      <div
        data-testid="playhead"
        className="absolute top-0 bottom-0 w-0.5 bg-indigo-600"
        style={{ left: `${progress * 100}%` }}
      >
        {/* Triangle indicator */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-indigo-600" />
      </div>
    </div>
  )
}

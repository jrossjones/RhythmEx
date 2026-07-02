import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import type { AudioDebugStats } from '@/hooks/useAudio'

interface DebugOverlayProps {
  audioDebugRef: React.RefObject<AudioDebugStats>
}

interface Snapshot {
  fps: number
  contextState: string
  lookAheadMs: number
  baseLatencyMs: number
  outputLatencyMs: number
  totalLagMs: number
  tapCount: number
  lastScheduleAheadMs: number
  msSinceLastTap: number | null
}

// Reads the live Tone.js audio-context latency figures. These are the *actual*
// values in effect, so the panel reflects reality rather than assumptions.
function readSnapshot(fps: number, audio: AudioDebugStats): Snapshot {
  const ctx = Tone.getContext()
  const raw = ctx.rawContext as unknown as AudioContext
  const lookAheadMs = ctx.lookAhead * 1000
  const baseLatencyMs = (raw.baseLatency ?? 0) * 1000
  const outputLatencyMs = (raw.outputLatency ?? 0) * 1000
  return {
    fps,
    contextState: raw.state,
    lookAheadMs,
    baseLatencyMs,
    outputLatencyMs,
    totalLagMs: lookAheadMs + baseLatencyMs + outputLatencyMs,
    tapCount: audio.tapCount,
    lastScheduleAheadMs: audio.lastScheduleAheadMs,
    msSinceLastTap: audio.lastTapPerfMs > 0 ? performance.now() - audio.lastTapPerfMs : null,
  }
}

export function DebugOverlay({ audioDebugRef }: DebugOverlayProps) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)

  const frameCountRef = useRef(0)
  const windowStartRef = useRef(0)

  useEffect(() => {
    let raf = 0
    let mounted = true

    const loop = () => {
      const now = performance.now()
      if (windowStartRef.current === 0) windowStartRef.current = now
      frameCountRef.current += 1

      const elapsed = now - windowStartRef.current
      if (elapsed >= 400) {
        const fps = Math.round((frameCountRef.current / elapsed) * 1000)
        setSnapshot(readSnapshot(fps, audioDebugRef.current))
        frameCountRef.current = 0
        windowStartRef.current = now
      }

      if (mounted) raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      mounted = false
      cancelAnimationFrame(raf)
    }
  }, [audioDebugRef])

  const rows: Array<[string, string, boolean]> = snapshot
    ? [
        ['FPS', String(snapshot.fps), snapshot.fps < 50],
        ['Audio', snapshot.contextState, snapshot.contextState !== 'running'],
        ['Look-ahead', `${snapshot.lookAheadMs.toFixed(0)} ms`, snapshot.lookAheadMs > 30],
        ['Base latency', `${snapshot.baseLatencyMs.toFixed(1)} ms`, false],
        ['Output latency', `${snapshot.outputLatencyMs.toFixed(1)} ms`, snapshot.outputLatencyMs > 60],
        ['Est. total lag', `${snapshot.totalLagMs.toFixed(0)} ms`, snapshot.totalLagMs > 80],
        ['Taps', String(snapshot.tapCount), false],
        [
          'Last sched-ahead',
          `${snapshot.lastScheduleAheadMs.toFixed(0)} ms`,
          snapshot.lastScheduleAheadMs > 30,
        ],
        [
          'Since last tap',
          snapshot.msSinceLastTap === null ? '—' : `${(snapshot.msSinceLastTap / 1000).toFixed(1)} s`,
          false,
        ],
      ]
    : [['Debug', 'starting…', false]]

  return (
    <div
      data-testid="debug-overlay"
      className="pointer-events-none fixed bottom-2 left-2 z-50 rounded-lg bg-black/80 p-3 font-mono text-[11px] leading-tight text-green-300 shadow-lg"
    >
      <div className="mb-1 font-bold text-white">Debug stats</div>
      <table>
        <tbody>
          {rows.map(([label, value, warn]) => (
            <tr key={label}>
              <td className="pr-3 text-gray-400">{label}</td>
              <td className={`text-right tabular-nums ${warn ? 'text-red-400' : 'text-green-300'}`}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

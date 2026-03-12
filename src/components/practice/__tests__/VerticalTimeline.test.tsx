import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerticalTimeline } from '../VerticalTimeline'
import type { Exercise, TimingJudgment } from '@/types'

const drumExercise: Exercise = {
  id: 'drum-test',
  name: 'Drum Test',
  difficulty: 'beginner',
  timeSignature: [4, 4],
  bpm: 120,
  measures: 1,
  beats: [
    { time: '0:0:0', duration: '4n', note: 'kick' },
    { time: '0:1:0', duration: '4n', note: 'snare' },
    { time: '0:2:0', duration: '4n', note: 'hihat' },
    { time: '0:3:0', duration: '4n', note: 'tom1' },
  ],
}

const handpanExercise: Exercise = {
  id: 'handpan-test',
  name: 'Handpan Test',
  difficulty: 'beginner',
  timeSignature: [4, 4],
  bpm: 120,
  measures: 1,
  instrument: 'handpan',
  scale: 'd-kurd',
  beats: [
    { time: '0:0:0', duration: '4n', note: 'D3' },
    { time: '0:1:0', duration: '4n', note: 'A3' },
    { time: '0:2:0', duration: '4n', note: 'C4' },
    { time: '0:3:0', duration: '4n', note: 'D4' },
  ],
}

describe('VerticalTimeline', () => {
  it('renders vertical-timeline container', () => {
    render(
      <VerticalTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" activePads={['kick', 'snare', 'hihat', 'tom1']} />
    )
    expect(screen.getByTestId('vertical-timeline')).toBeInTheDocument()
  })

  it('renders VerticalDrumTimeline for drum instrument', () => {
    render(
      <VerticalTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" activePads={['kick', 'snare', 'hihat', 'tom1']} />
    )
    expect(screen.getByTestId('vertical-drum-timeline')).toBeInTheDocument()
    expect(screen.queryByTestId('vertical-single-timeline')).not.toBeInTheDocument()
  })

  it('renders VerticalSingleTimeline for handpan instrument', () => {
    render(
      <VerticalTimeline exercise={handpanExercise} progress={0} bpm={120} instrument="handpan" scaleNotes={['D3', 'A3', 'Bb3', 'C4', 'D4']} />
    )
    expect(screen.getByTestId('vertical-single-timeline')).toBeInTheDocument()
    expect(screen.queryByTestId('vertical-drum-timeline')).not.toBeInTheDocument()
  })

  it('renders correct number of beat markers', () => {
    render(
      <VerticalTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" activePads={['kick', 'snare', 'hihat', 'tom1']} />
    )
    const markers = screen.getAllByTestId('beat-marker')
    expect(markers).toHaveLength(4)
  })

  it('renders hit line', () => {
    render(
      <VerticalTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" activePads={['kick', 'snare']} />
    )
    expect(screen.getByTestId('hit-line')).toBeInTheDocument()
  })

  it('markers have correct shapes for drums', () => {
    render(
      <VerticalTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" activePads={['kick', 'snare', 'hihat', 'tom1']} />
    )
    const markers = screen.getAllByTestId('beat-marker')
    expect(markers[0].dataset.shape).toBe('circle')      // kick
    expect(markers[1].dataset.shape).toBe('diamond')      // snare
    expect(markers[2].dataset.shape).toBe('triangle')     // hihat
    expect(markers[3].dataset.shape).toBe('square')       // tom1
  })

  it('judged markers become hollow with correct border color', () => {
    const judgments = new Map<number, TimingJudgment>()
    judgments.set(0, 'on-time')
    judgments.set(1, 'miss')
    render(
      <VerticalTimeline exercise={drumExercise} progress={0.5} bpm={120} instrument="drums" beatJudgments={judgments} activePads={['kick', 'snare', 'hihat', 'tom1']} />
    )
    const markers = screen.getAllByTestId('beat-marker')
    expect(markers[0].className).toContain('bg-transparent')
    expect(markers[0].className).toContain('border-green-400')
    expect(markers[1].className).toContain('bg-transparent')
    expect(markers[1].className).toContain('border-red-400')
    // Third marker (not judged) should be filled
    expect(markers[2].className).not.toContain('bg-transparent')
  })

  it('handpan ding note uses line shape', () => {
    render(
      <VerticalTimeline exercise={handpanExercise} progress={0} bpm={120} instrument="handpan" scaleNotes={['D3', 'A3', 'Bb3', 'C4', 'D4']} />
    )
    const markers = screen.getAllByTestId('beat-marker')
    // D3 is the first note (ding) in the scale
    expect(markers[0].dataset.shape).toBe('line')
  })

  it('future beats are above past beats (drop-down direction)', () => {
    // At progress=0.5, beat 0 (already played) should be below beat 3 (future)
    render(
      <VerticalTimeline exercise={drumExercise} progress={0.5} bpm={120} instrument="drums" activePads={['kick', 'snare', 'hihat', 'tom1']} />
    )
    const markers = screen.getAllByTestId('beat-marker')
    const y0 = parseFloat(markers[0].style.top) // beat 0 (time=0, past)
    const y3 = parseFloat(markers[3].style.top) // beat 3 (time=1500ms, future)
    // Past beats should have larger Y (lower on screen) than future beats
    expect(y0).toBeGreaterThan(y3)
  })

  it('beat at time 0 starts near hit line at progress=0', () => {
    render(
      <VerticalTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" activePads={['kick', 'snare', 'hihat', 'tom1']} />
    )
    // Hit line is at 70% of 300px = 210px. Beat 0 should be near the hit line
    // (accounting for scroll offset pinning the playhead at the hit line)
    const scrollContent = screen.getByTestId('vertical-scroll-content')
    const scrollOffset = parseFloat(scrollContent.style.transform.replace('translateY(-', '').replace('px)', ''))
    const markers = screen.getAllByTestId('beat-marker')
    const beat0Y = parseFloat(markers[0].style.top)
    const visualY = beat0Y - scrollOffset
    // Should be at or very near the hit line (210px)
    expect(visualY).toBeCloseTo(210, 0)
  })

  it('renders tap markers', () => {
    const tapMarkers = [
      { ms: 20, pad: 'kick' as const, judgment: 'on-time' as const, expectedMs: 0 },
    ]
    render(
      <VerticalTimeline exercise={drumExercise} progress={0.5} bpm={120} instrument="drums" tapMarkers={tapMarkers} activePads={['kick', 'snare']} />
    )
    expect(screen.getByTestId('tap-marker')).toBeInTheDocument()
  })
})

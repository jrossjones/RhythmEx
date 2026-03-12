import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BeatTimeline } from '../BeatTimeline'
import type { Exercise } from '@/types'

const testExercise: Exercise = {
  id: 'test',
  name: 'Test',
  difficulty: 'beginner',
  timeSignature: [4, 4],
  bpm: 120,
  measures: 1,
  beats: [
    { time: '0:0:0', duration: '4n', note: 'C4' },
    { time: '0:1:0', duration: '4n', note: 'C4' },
    { time: '0:2:0', duration: '4n', note: 'C4' },
    { time: '0:3:0', duration: '4n', note: 'C4' },
  ],
}

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

describe('BeatTimeline', () => {
  it('renders correct number of beat markers', () => {
    render(<BeatTimeline exercise={testExercise} progress={0} bpm={120} />)
    const markers = screen.getAllByTestId('beat-marker')
    expect(markers).toHaveLength(4)
  })

  it('renders playhead element', () => {
    render(<BeatTimeline exercise={testExercise} progress={0.5} bpm={120} />)
    const playhead = screen.getByTestId('playhead')
    expect(playhead).toBeInTheDocument()
  })

  it('renders correct markers for exercise with fewer beats', () => {
    const twoBeats: Exercise = {
      ...testExercise,
      beats: [
        { time: '0:0:0', duration: '2n', note: 'C4' },
        { time: '0:2:0', duration: '2n', note: 'C4' },
      ],
    }
    render(<BeatTimeline exercise={twoBeats} progress={0} bpm={120} />)
    const markers = screen.getAllByTestId('beat-marker')
    expect(markers).toHaveLength(2)
  })

  it('uses drum pad colors when instrument is drums', () => {
    render(<BeatTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" />)
    const markers = screen.getAllByTestId('beat-marker')
    expect(markers[0].className).toContain('bg-red-400')
    expect(markers[1].className).toContain('bg-orange-400')
    expect(markers[2].className).toContain('bg-cyan-400')
    expect(markers[3].className).toContain('bg-purple-400')
  })

  it('uses duration colors when instrument is not drums (backward compat)', () => {
    render(<BeatTimeline exercise={testExercise} progress={0} bpm={120} />)
    const markers = screen.getAllByTestId('beat-marker')
    // All 4n beats should use indigo
    markers.forEach((marker) => {
      expect(marker.className).toContain('bg-indigo-400')
    })
  })

  // New tests for multi-lane and scrolling

  it('renders lane labels for drum exercise', () => {
    render(<BeatTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" />)
    const labels = screen.getByTestId('drum-lane-labels')
    expect(labels).toBeInTheDocument()
    expect(screen.getByText('HH')).toBeInTheDocument()
    expect(screen.getByText('SN')).toBeInTheDocument()
    expect(screen.getByText('KK')).toBeInTheDocument()
    expect(screen.getByText('T1')).toBeInTheDocument()
    expect(screen.getByText('T2')).toBeInTheDocument()
  })

  it('does not render lane labels for non-drum exercise', () => {
    render(<BeatTimeline exercise={testExercise} progress={0} bpm={120} />)
    expect(screen.queryByTestId('drum-lane-labels')).not.toBeInTheDocument()
  })

  it('short exercise has no translateX transform', () => {
    // 1 measure at 120bpm — 4 beats × 60px = 240px, which should fit in most containers
    render(<BeatTimeline exercise={testExercise} progress={0} bpm={120} />)
    const content = screen.getByTestId('timeline-content')
    // containerWidth starts at 0, so isScrolling is false
    expect(content.style.transform).toBe('')
  })

  it('renders drum lanes for drum exercise', () => {
    render(<BeatTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" />)
    // Should render drum lane testids from DrumLaneTimeline
    expect(screen.getByTestId('drum-lane-kick')).toBeInTheDocument()
    expect(screen.getByTestId('drum-lane-snare')).toBeInTheDocument()
    expect(screen.getByTestId('drum-lane-hihat')).toBeInTheDocument()
  })

  it('does not render drum lanes for non-drum exercise', () => {
    render(<BeatTimeline exercise={testExercise} progress={0} bpm={120} />)
    expect(screen.queryByTestId('drum-lane-kick')).not.toBeInTheDocument()
  })

  it('passes tapMarkers prop through to drum timeline', () => {
    const tapMarkers = [
      { ms: 20, pad: 'kick' as const, judgment: 'on-time' as const, expectedMs: 0 },
    ]
    render(
      <BeatTimeline exercise={drumExercise} progress={0} bpm={120} instrument="drums" tapMarkers={tapMarkers} />
    )
    // Tap marker should render in the drum lane timeline
    expect(screen.getByTestId('tap-marker')).toBeInTheDocument()
  })

  it('passes tapMarkers prop through to single row timeline', () => {
    const tapMarkers = [
      { ms: 20, judgment: 'on-time' as const, expectedMs: 0 },
    ]
    render(
      <BeatTimeline exercise={testExercise} progress={0} bpm={120} tapMarkers={tapMarkers} />
    )
    expect(screen.getByTestId('tap-marker')).toBeInTheDocument()
  })
})

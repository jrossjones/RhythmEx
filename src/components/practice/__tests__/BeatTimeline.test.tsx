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
    const drumExercise: Exercise = {
      ...testExercise,
      beats: [
        { time: '0:0:0', duration: '4n', note: 'kick' },
        { time: '0:1:0', duration: '4n', note: 'snare' },
        { time: '0:2:0', duration: '4n', note: 'hihat' },
        { time: '0:3:0', duration: '4n', note: 'tom1' },
      ],
    }
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
})

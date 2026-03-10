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
})

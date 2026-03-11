import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DrumLaneTimeline } from '../DrumLaneTimeline'
import { DRUM_LANE_ORDER } from '../timelineConstants'

const makeMarker = (lane: string, position: number, color = 'bg-red-400') => ({
  position,
  color,
  isNext: false,
  isJudged: false,
  lane,
})

describe('DrumLaneTimeline', () => {
  it('renders 5 lane backgrounds in correct order', () => {
    render(
      <DrumLaneTimeline
        markers={[]}
        measureLines={[]}
        playheadPosition={0}
        isScrolling={false}
      />
    )
    DRUM_LANE_ORDER.forEach((pad) => {
      expect(screen.getByTestId(`drum-lane-${pad}`)).toBeInTheDocument()
    })
  })

  it('renders markers in correct lanes based on beat.note', () => {
    const markers = [
      makeMarker('kick', 10, 'bg-red-400'),
      makeMarker('snare', 30, 'bg-orange-400'),
      makeMarker('hihat', 50, 'bg-cyan-400'),
    ]

    render(
      <DrumLaneTimeline
        markers={markers}
        measureLines={[]}
        playheadPosition={0}
        isScrolling={false}
      />
    )

    const beatMarkers = screen.getAllByTestId('beat-marker')
    expect(beatMarkers).toHaveLength(3)

    // Kick is in lane index 4, snare in 3, hihat in 0
    // kick: centerY = 4 * 28 + 14 = 126
    expect(beatMarkers[0].style.top).toBe('126px')
    // snare: centerY = 3 * 28 + 14 = 98
    expect(beatMarkers[1].style.top).toBe('98px')
    // hihat: centerY = 0 * 28 + 14 = 14
    expect(beatMarkers[2].style.top).toBe('14px')
  })

  it('renders empty lanes for unused pads', () => {
    // Only kick markers — but all 5 lanes should render
    const markers = [makeMarker('kick', 10)]

    render(
      <DrumLaneTimeline
        markers={markers}
        measureLines={[]}
        playheadPosition={0}
        isScrolling={false}
      />
    )

    DRUM_LANE_ORDER.forEach((pad) => {
      expect(screen.getByTestId(`drum-lane-${pad}`)).toBeInTheDocument()
    })
    expect(screen.getAllByTestId('beat-marker')).toHaveLength(1)
  })

  it('renders playhead spanning full height', () => {
    render(
      <DrumLaneTimeline
        markers={[]}
        measureLines={[]}
        playheadPosition={50}
        isScrolling={false}
      />
    )

    const playhead = screen.getByTestId('playhead')
    expect(playhead).toBeInTheDocument()
    expect(playhead.style.left).toBe('50%')
  })

  it('uses px positioning when scrolling', () => {
    const markers = [makeMarker('kick', 120)]

    render(
      <DrumLaneTimeline
        markers={markers}
        measureLines={[50]}
        playheadPosition={100}
        isScrolling={true}
      />
    )

    const playhead = screen.getByTestId('playhead')
    expect(playhead.style.left).toBe('100px')

    const beatMarker = screen.getByTestId('beat-marker')
    expect(beatMarker.style.left).toBe('120px')
  })

  it('uses percentage positioning when not scrolling', () => {
    const markers = [makeMarker('kick', 25)]

    render(
      <DrumLaneTimeline
        markers={markers}
        measureLines={[]}
        playheadPosition={10}
        isScrolling={false}
      />
    )

    const playhead = screen.getByTestId('playhead')
    expect(playhead.style.left).toBe('10%')

    const beatMarker = screen.getByTestId('beat-marker')
    expect(beatMarker.style.left).toBe('25%')
  })

  it('renders measure lines', () => {
    const { container } = render(
      <DrumLaneTimeline
        markers={[]}
        measureLines={[50]}
        playheadPosition={0}
        isScrolling={false}
      />
    )

    // Measure line is a div with bg-gray-200
    const measureLine = container.querySelector('.bg-gray-200')
    expect(measureLine).toBeInTheDocument()
  })
})

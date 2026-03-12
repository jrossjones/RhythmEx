import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerticalDrumTimeline } from '../VerticalDrumTimeline'
import { DRUM_COLUMN_WIDTH, VERTICAL_TIMELINE_HEIGHT, HIT_LINE_POSITION_VERTICAL } from '../timelineConstants'

const hitLineY = VERTICAL_TIMELINE_HEIGHT * HIT_LINE_POSITION_VERTICAL

const makeMarker = (lane: string, yPosition: number, beatIndex: number, shape: 'circle' | 'diamond' | 'triangle' = 'circle') => ({
  beatIndex,
  yPosition,
  color: 'bg-red-400',
  isNext: false,
  isJudged: false,
  lane,
  shape,
  label: 'K',
})

describe('VerticalDrumTimeline', () => {
  it('renders columns for active pads', () => {
    render(
      <VerticalDrumTimeline
        markers={[]}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        activePads={['kick', 'snare', 'hihat']}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
      />
    )
    expect(screen.getByTestId('drum-column-kick')).toBeInTheDocument()
    expect(screen.getByTestId('drum-column-snare')).toBeInTheDocument()
    expect(screen.getByTestId('drum-column-hihat')).toBeInTheDocument()
    expect(screen.queryByTestId('drum-column-tom1')).not.toBeInTheDocument()
  })

  it('renders markers in correct columns', () => {
    const markers = [
      makeMarker('kick', 100, 0),
      makeMarker('snare', 200, 1, 'diamond'),
    ]
    render(
      <VerticalDrumTimeline
        markers={markers}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        activePads={['kick', 'snare']}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
      />
    )
    const beatMarkers = screen.getAllByTestId('beat-marker')
    expect(beatMarkers).toHaveLength(2)

    // Kick is column 0 → centerX = 32
    expect(beatMarkers[0].style.left).toBe('32px')
    expect(beatMarkers[0].style.top).toBe('100px')

    // Snare is column 1 → centerX = 96
    expect(beatMarkers[1].style.left).toBe('96px')
    expect(beatMarkers[1].style.top).toBe('200px')
  })

  it('applies vertical scroll transform', () => {
    render(
      <VerticalDrumTimeline
        markers={[]}
        measureLines={[]}
        scrollOffset={50}
        hitLineY={hitLineY}
        renderedHeight={600}
        activePads={['kick']}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
      />
    )
    const scrollContent = screen.getByTestId('vertical-scroll-content')
    expect(scrollContent.style.transform).toBe('translateY(-50px)')
  })

  it('renders hit line at correct position', () => {
    render(
      <VerticalDrumTimeline
        markers={[]}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        activePads={['kick']}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
      />
    )
    const hitLine = screen.getByTestId('hit-line')
    expect(hitLine.style.top).toBe(`${hitLineY}px`)
  })

  it('renders measure lines as horizontal dividers', () => {
    const { container } = render(
      <VerticalDrumTimeline
        markers={[]}
        measureLines={[200]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        activePads={['kick']}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
      />
    )
    const measureLine = container.querySelector('.bg-gray-200')
    expect(measureLine).toBeInTheDocument()
  })

  it('renders column labels', () => {
    render(
      <VerticalDrumTimeline
        markers={[]}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        activePads={['kick', 'snare']}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
      />
    )
    expect(screen.getByText('KK')).toBeInTheDocument()
    expect(screen.getByText('SN')).toBeInTheDocument()
  })

  it('total width equals columns * DRUM_COLUMN_WIDTH', () => {
    render(
      <VerticalDrumTimeline
        markers={[]}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        activePads={['kick', 'snare', 'hihat']}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
      />
    )
    const timeline = screen.getByTestId('vertical-drum-timeline')
    expect(timeline.style.width).toBe(`${3 * DRUM_COLUMN_WIDTH}px`)
  })
})

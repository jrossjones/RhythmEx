import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerticalStrumTimeline } from '../VerticalStrumTimeline'
import { STRUM_COLUMN_WIDTH, VERTICAL_TIMELINE_HEIGHT, HIT_LINE_POSITION_VERTICAL } from '../timelineConstants'

const hitLineY = VERTICAL_TIMELINE_HEIGHT * HIT_LINE_POSITION_VERTICAL

const makeMarker = (yPosition: number, beatIndex: number, note: 'down' | 'up' = 'down') => ({
  beatIndex,
  yPosition,
  color: note === 'down' ? 'bg-blue-400' : 'bg-amber-400',
  isNext: false,
  isJudged: false,
  lane: note,
  shape: 'triangle' as const,
  label: note === 'down' ? '\u2193' : '\u2191',
  rotation: note === 'down' ? 180 : 0,
})

describe('VerticalStrumTimeline', () => {
  it('renders markers', () => {
    const markers = [
      makeMarker(100, 0, 'down'),
      makeMarker(200, 1, 'up'),
    ]
    render(
      <VerticalStrumTimeline
        markers={markers}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
        chordChanges={[]}
      />
    )
    const beatMarkers = screen.getAllByTestId('beat-marker')
    expect(beatMarkers).toHaveLength(2)
  })

  it('renders chord change labels', () => {
    render(
      <VerticalStrumTimeline
        markers={[makeMarker(100, 0)]}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
        chordChanges={[
          { chord: 'G', yPosition: 100 },
          { chord: 'C', yPosition: 200 },
        ]}
      />
    )
    const labels = screen.getAllByTestId('chord-change-label')
    expect(labels).toHaveLength(2)
    expect(labels[0]).toHaveTextContent('G')
    expect(labels[1]).toHaveTextContent('C')
  })

  it('hit line present', () => {
    render(
      <VerticalStrumTimeline
        markers={[]}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
        chordChanges={[]}
      />
    )
    const hitLine = screen.getByTestId('hit-line')
    expect(hitLine.style.top).toBe(`${hitLineY}px`)
  })

  it('scroll offset applied', () => {
    render(
      <VerticalStrumTimeline
        markers={[]}
        measureLines={[]}
        scrollOffset={75}
        hitLineY={hitLineY}
        renderedHeight={600}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
        chordChanges={[]}
      />
    )
    const scrollContent = screen.getByTestId('vertical-scroll-content')
    expect(scrollContent.style.transform).toBe('translateY(-75px)')
  })

  it('has correct column width', () => {
    render(
      <VerticalStrumTimeline
        markers={[]}
        measureLines={[]}
        scrollOffset={0}
        hitLineY={hitLineY}
        renderedHeight={400}
        containerHeight={VERTICAL_TIMELINE_HEIGHT}
        chordChanges={[]}
      />
    )
    const timeline = screen.getByTestId('vertical-strum-timeline')
    expect(timeline.style.width).toBe(`${STRUM_COLUMN_WIDTH}px`)
  })
})

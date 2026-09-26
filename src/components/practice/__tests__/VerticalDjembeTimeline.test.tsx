import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerticalDjembeTimeline } from '../VerticalDjembeTimeline'
import { DJEMBE_LANE_WIDTH } from '../timelineConstants'
import type { DjembeStroke } from '@/types'

const marker = (lane: string, yPosition: number, color: string) => ({
  beatIndex: 0,
  yPosition,
  color,
  isNext: false,
  isJudged: false,
  lane,
  shape: 'circle' as const,
})

const defaultProps = {
  markers: [],
  measureLines: [],
  scrollOffset: 0,
  hitLineY: 168,
  renderedHeight: 800,
  activeStrokes: ['slap', 'tone', 'bass'] as DjembeStroke[],
  containerHeight: 240,
}

describe('VerticalDjembeTimeline', () => {
  it('renders one lane per active stroke', () => {
    render(<VerticalDjembeTimeline {...defaultProps} />)
    expect(screen.getByTestId('djembe-lane-bass')).toBeInTheDocument()
    expect(screen.getByTestId('djembe-lane-tone')).toBeInTheDocument()
    expect(screen.getByTestId('djembe-lane-slap')).toBeInTheDocument()
  })

  it('collapses to a single lane for a one-stroke drill', () => {
    render(<VerticalDjembeTimeline {...defaultProps} activeStrokes={['bass']} />)
    expect(screen.getByTestId('djembe-lane-bass')).toBeInTheDocument()
    expect(screen.queryByTestId('djembe-lane-tone')).not.toBeInTheDocument()
    expect(screen.queryByTestId('djembe-lane-slap')).not.toBeInTheDocument()
    // Width follows the lane count so a single lane isn't stranded in dead space.
    expect(screen.getByTestId('vertical-djembe-timeline')).toHaveStyle({
      width: `${DJEMBE_LANE_WIDTH}px`,
    })
  })

  it('places a marker in the lane matching its stroke, regardless of hand', () => {
    render(
      <VerticalDjembeTimeline
        {...defaultProps}
        activeStrokes={['slap', 'tone', 'bass']}
        markers={[
          { ...marker('tone-strong', 100, 'bg-amber-400'), beatIndex: 0 },
          { ...marker('tone-weak', 200, 'bg-blue-500'), beatIndex: 1 },
        ]}
      />
    )
    const markers = screen.getAllByTestId('beat-marker')
    expect(markers).toHaveLength(2)
    // Both sit in the tone lane (index 1) — hand is carried by colour, not by
    // horizontal position.
    const expectedX = 1 * DJEMBE_LANE_WIDTH + DJEMBE_LANE_WIDTH / 2
    for (const m of markers) {
      expect(m).toHaveStyle({ left: `${expectedX}px` })
    }
  })

  it('drops markers whose stroke has no lane', () => {
    render(
      <VerticalDjembeTimeline
        {...defaultProps}
        activeStrokes={['bass']}
        markers={[marker('slap-strong', 100, 'bg-amber-400')]}
      />
    )
    expect(screen.queryByTestId('beat-marker')).not.toBeInTheDocument()
  })

  it('ignores malformed notes rather than throwing', () => {
    render(
      <VerticalDjembeTimeline {...defaultProps} markers={[marker('kick', 100, 'bg-red-400')]} />
    )
    expect(screen.queryByTestId('beat-marker')).not.toBeInTheDocument()
  })

  it('renders the hit line and loop seam bands', () => {
    render(<VerticalDjembeTimeline {...defaultProps} loopBoundaryLines={[50, 450]} />)
    expect(screen.getByTestId('hit-line')).toBeInTheDocument()
    expect(screen.getAllByTestId('loop-boundary-line')).toHaveLength(2)
  })

  it('applies a negative scroll offset as valid CSS', () => {
    render(<VerticalDjembeTimeline {...defaultProps} scrollOffset={-40} />)
    expect(screen.getByTestId('vertical-scroll-content')).toHaveStyle({
      transform: 'translateY(40px)',
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultsOverlay } from '../ResultsOverlay'

describe('ResultsOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders stars and accuracy', () => {
    render(<ResultsOverlay accuracy={85.7} stars={2} onDismiss={vi.fn()} />)
    expect(screen.getByText('86%')).toBeInTheDocument()
    expect(screen.getByLabelText('2 out of 3 stars')).toBeInTheDocument()
  })

  it('renders speed trainer next BPM hint', () => {
    render(<ResultsOverlay accuracy={96} stars={3} onDismiss={vi.fn()} speedTrainerNextBpm={125} />)
    expect(screen.getByTestId('overlay-next-bpm')).toHaveTextContent('Next: 125 BPM')
  })

  it('does not render next BPM hint when not provided', () => {
    render(<ResultsOverlay accuracy={80} stars={2} onDismiss={vi.fn()} />)
    expect(screen.queryByTestId('overlay-next-bpm')).not.toBeInTheDocument()
  })

  it('auto-dismisses after 2 seconds', () => {
    const onDismiss = vi.fn()
    render(<ResultsOverlay accuracy={90} stars={3} onDismiss={onDismiss} />)

    expect(onDismiss).not.toHaveBeenCalled()

    vi.advanceTimersByTime(2000)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('cleans up timeout on unmount', () => {
    const onDismiss = vi.fn()
    const { unmount } = render(<ResultsOverlay accuracy={90} stars={3} onDismiss={onDismiss} />)

    unmount()
    vi.advanceTimersByTime(3000)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('renders the overlay container', () => {
    render(<ResultsOverlay accuracy={75} stars={1} onDismiss={vi.fn()} />)
    expect(screen.getByTestId('results-overlay')).toBeInTheDocument()
  })
})

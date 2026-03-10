import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TapZone } from '../TapZone'

describe('TapZone', () => {
  it('shows "Tap!" when enabled', () => {
    render(<TapZone onTap={vi.fn()} lastFeedback={null} disabled={false} />)
    expect(screen.getByText('Tap!')).toBeInTheDocument()
  })

  it('shows "Press Start" when disabled', () => {
    render(<TapZone onTap={vi.fn()} lastFeedback={null} disabled={true} />)
    expect(screen.getByText('Press Start')).toBeInTheDocument()
  })

  it('calls onTap on click when enabled', () => {
    const onTap = vi.fn()
    render(<TapZone onTap={onTap} lastFeedback={null} disabled={false} />)

    fireEvent.click(screen.getByTestId('tap-zone'))
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('does not call onTap when disabled', () => {
    const onTap = vi.fn()
    render(<TapZone onTap={onTap} lastFeedback={null} disabled={true} />)

    fireEvent.click(screen.getByTestId('tap-zone'))
    expect(onTap).not.toHaveBeenCalled()
  })

  it('calls onTap on spacebar keydown', () => {
    const onTap = vi.fn()
    render(<TapZone onTap={onTap} lastFeedback={null} disabled={false} />)

    fireEvent.keyDown(window, { code: 'Space' })
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('ignores repeat keydown events', () => {
    const onTap = vi.fn()
    render(<TapZone onTap={onTap} lastFeedback={null} disabled={false} />)

    fireEvent.keyDown(window, { code: 'Space', repeat: true })
    expect(onTap).not.toHaveBeenCalled()
  })

  it('shows judgment text on feedback', () => {
    // Mock performance.now to return a recent timestamp so flash is active
    const now = performance.now()
    vi.spyOn(performance, 'now').mockReturnValue(now)

    const feedback = { judgment: 'on-time' as const, timestamp: now }
    render(<TapZone onTap={vi.fn()} lastFeedback={feedback} disabled={false} />)

    expect(screen.getByText('Perfect!')).toBeInTheDocument()
  })
})

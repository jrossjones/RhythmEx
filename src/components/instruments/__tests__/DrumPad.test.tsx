import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DrumPad } from '../DrumPad'
import type { DrumPad as DrumPadType } from '@/types'

const defaultProps = {
  onTap: vi.fn(),
  lastFeedback: null,
  lastFeedbackPad: null,
  disabled: false,
  activePads: ['kick', 'snare'] as DrumPadType[],
  nextExpectedPad: null as DrumPadType | null,
}

describe('DrumPad', () => {
  it('renders correct number of pads for 2 active pads', () => {
    render(<DrumPad {...defaultProps} activePads={['kick', 'snare']} />)
    expect(screen.getByTestId('drum-pad-kick')).toBeInTheDocument()
    expect(screen.getByTestId('drum-pad-snare')).toBeInTheDocument()
  })

  it('renders correct number of pads for 3 active pads', () => {
    render(<DrumPad {...defaultProps} activePads={['kick', 'snare', 'hihat']} />)
    expect(screen.getByTestId('drum-pad-kick')).toBeInTheDocument()
    expect(screen.getByTestId('drum-pad-snare')).toBeInTheDocument()
    expect(screen.getByTestId('drum-pad-hihat')).toBeInTheDocument()
  })

  it('renders 5 pads for advanced', () => {
    render(<DrumPad {...defaultProps} activePads={['kick', 'snare', 'hihat', 'tom1', 'tom2']} />)
    expect(screen.getByTestId('drum-pad-kick')).toBeInTheDocument()
    expect(screen.getByTestId('drum-pad-snare')).toBeInTheDocument()
    expect(screen.getByTestId('drum-pad-hihat')).toBeInTheDocument()
    expect(screen.getByTestId('drum-pad-tom1')).toBeInTheDocument()
    expect(screen.getByTestId('drum-pad-tom2')).toBeInTheDocument()
  })

  it('shows correct labels', () => {
    render(<DrumPad {...defaultProps} activePads={['kick', 'snare']} />)
    expect(screen.getByText('Kick')).toBeInTheDocument()
    expect(screen.getByText('Snare')).toBeInTheDocument()
  })

  it('calls onTap with pad name on click', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} />)

    fireEvent.click(screen.getByTestId('drum-pad-kick'))
    expect(onTap).toHaveBeenCalledWith('kick')

    fireEvent.click(screen.getByTestId('drum-pad-snare'))
    expect(onTap).toHaveBeenCalledWith('snare')
  })

  it('calls onTap on touchStart', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} />)

    fireEvent.touchStart(screen.getByTestId('drum-pad-kick'))
    expect(onTap).toHaveBeenCalledWith('kick')
  })

  it('keyboard shortcut f triggers kick', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} />)

    fireEvent.keyDown(window, { key: 'f' })
    expect(onTap).toHaveBeenCalledWith('kick')
  })

  it('keyboard shortcut d triggers snare', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} />)

    fireEvent.keyDown(window, { key: 'd' })
    expect(onTap).toHaveBeenCalledWith('snare')
  })

  it('keyboard shortcut j triggers hihat when active', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} activePads={['kick', 'snare', 'hihat']} />)

    fireEvent.keyDown(window, { key: 'j' })
    expect(onTap).toHaveBeenCalledWith('hihat')
  })

  it('keyboard shortcut j is ignored when hihat not active', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} activePads={['kick', 'snare']} />)

    fireEvent.keyDown(window, { key: 'j' })
    expect(onTap).not.toHaveBeenCalled()
  })

  it('Space key triggers nextExpectedPad', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} nextExpectedPad="snare" />)

    fireEvent.keyDown(window, { code: 'Space' })
    expect(onTap).toHaveBeenCalledWith('snare')
  })

  it('Space key defaults to kick when no nextExpectedPad', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} nextExpectedPad={null} />)

    fireEvent.keyDown(window, { code: 'Space' })
    expect(onTap).toHaveBeenCalledWith('kick')
  })

  it('ignores repeat key events', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} />)

    fireEvent.keyDown(window, { key: 'f', repeat: true })
    expect(onTap).not.toHaveBeenCalled()
  })

  it('no-op when disabled', () => {
    const onTap = vi.fn()
    render(<DrumPad {...defaultProps} onTap={onTap} disabled={true} />)

    fireEvent.click(screen.getByTestId('drum-pad-kick'))
    expect(onTap).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'f' })
    expect(onTap).not.toHaveBeenCalled()
  })

  it('disabled kick pad shows muted red color instead of gray', () => {
    render(<DrumPad {...defaultProps} disabled={true} />)
    const kickPad = screen.getByTestId('drum-pad-kick')
    expect(kickPad.className).toContain('bg-red-200')
    expect(kickPad.className).not.toContain('bg-gray-300')
  })

  it('shows feedback flash on the correct pad', () => {
    render(
      <DrumPad
        {...defaultProps}
        lastFeedback={{ judgment: 'on-time', timestamp: performance.now() }}
        lastFeedbackPad="kick"
      />
    )

    const kickPad = screen.getByTestId('drum-pad-kick')
    expect(kickPad.className).toContain('bg-green-400')
  })
})

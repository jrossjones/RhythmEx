import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StrumZone } from '../StrumZone'

const defaultProps = {
  onTap: vi.fn(),
  lastFeedback: null,
  lastFeedbackPad: null,
  disabled: false,
  currentChord: 'G' as string | null,
  nextExpectedDirection: null as 'down' | 'up' | null,
}

describe('StrumZone', () => {
  it('renders down and up buttons', () => {
    render(<StrumZone {...defaultProps} />)
    expect(screen.getByTestId('strum-button-down')).toBeInTheDocument()
    expect(screen.getByTestId('strum-button-up')).toBeInTheDocument()
  })

  it('calls onTap with down on click', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} />)
    fireEvent.click(screen.getByTestId('strum-button-down'))
    expect(onTap).toHaveBeenCalledWith('down')
  })

  it('calls onTap with up on click', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} />)
    fireEvent.click(screen.getByTestId('strum-button-up'))
    expect(onTap).toHaveBeenCalledWith('up')
  })

  it('calls onTap on touchStart', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} />)
    fireEvent.touchStart(screen.getByTestId('strum-button-down'))
    expect(onTap).toHaveBeenCalledWith('down')
  })

  it('ArrowDown triggers down', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} />)
    fireEvent.keyDown(window, { code: 'ArrowDown' })
    expect(onTap).toHaveBeenCalledWith('down')
  })

  it('ArrowUp triggers up', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} />)
    fireEvent.keyDown(window, { code: 'ArrowUp' })
    expect(onTap).toHaveBeenCalledWith('up')
  })

  it('Space triggers nextExpectedDirection', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} nextExpectedDirection="up" />)
    fireEvent.keyDown(window, { code: 'Space' })
    expect(onTap).toHaveBeenCalledWith('up')
  })

  it('Space defaults to down when no nextExpectedDirection', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} nextExpectedDirection={null} />)
    fireEvent.keyDown(window, { code: 'Space' })
    expect(onTap).toHaveBeenCalledWith('down')
  })

  it('ignores repeat key events', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} />)
    fireEvent.keyDown(window, { code: 'ArrowDown', repeat: true })
    expect(onTap).not.toHaveBeenCalled()
  })

  it('no-op when disabled', () => {
    const onTap = vi.fn()
    render(<StrumZone {...defaultProps} onTap={onTap} disabled={true} />)
    fireEvent.click(screen.getByTestId('strum-button-down'))
    expect(onTap).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { code: 'ArrowDown' })
    expect(onTap).not.toHaveBeenCalled()
  })

  it('shows feedback flash on the correct button', () => {
    render(
      <StrumZone
        {...defaultProps}
        lastFeedback={{ judgment: 'on-time', timestamp: performance.now() }}
        lastFeedbackPad="down"
      />
    )
    const downBtn = screen.getByTestId('strum-button-down')
    expect(downBtn.className).toContain('bg-green-400')
  })

  it('shows miss feedback color', () => {
    render(
      <StrumZone
        {...defaultProps}
        lastFeedback={{ judgment: 'miss', timestamp: performance.now() }}
        lastFeedbackPad="up"
      />
    )
    const upBtn = screen.getByTestId('strum-button-up')
    expect(upBtn.className).toContain('bg-red-600')
  })

  it('disabled buttons show muted colors', () => {
    render(<StrumZone {...defaultProps} disabled={true} />)
    const downBtn = screen.getByTestId('strum-button-down')
    expect(downBtn.className).toContain('bg-blue-200')
    const upBtn = screen.getByTestId('strum-button-up')
    expect(upBtn.className).toContain('bg-amber-200')
  })

  it('chord display rendered', () => {
    render(<StrumZone {...defaultProps} currentChord="Am" />)
    expect(screen.getByTestId('strum-chord-display')).toHaveTextContent('Am')
  })
})

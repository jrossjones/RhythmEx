import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HandpanPad } from '../HandpanPad'

const dKurdNotes = ['D3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4']

const defaultProps = {
  onTap: vi.fn(),
  lastFeedback: null,
  lastFeedbackPad: null,
  disabled: false,
  scaleNotes: dKurdNotes,
  nextExpectedNote: null as string | null,
}

describe('HandpanPad', () => {
  it('renders correct number of pads (9 for D Kurd)', () => {
    render(<HandpanPad {...defaultProps} />)
    for (const note of dKurdNotes) {
      expect(screen.getByTestId(`handpan-pad-${note}`)).toBeInTheDocument()
    }
  })

  it('renders fewer pads for smaller scale', () => {
    const cAmaraNotes = ['C3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'G4']
    render(<HandpanPad {...defaultProps} scaleNotes={cAmaraNotes} />)
    for (const note of cAmaraNotes) {
      expect(screen.getByTestId(`handpan-pad-${note}`)).toBeInTheDocument()
    }
    // Should not have D Kurd-specific notes
    expect(screen.queryByTestId('handpan-pad-Bb3')).not.toBeInTheDocument()
  })

  it('calls onTap with note on click', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} />)

    fireEvent.click(screen.getByTestId('handpan-pad-D3'))
    expect(onTap).toHaveBeenCalledWith('D3')

    fireEvent.click(screen.getByTestId('handpan-pad-A3'))
    expect(onTap).toHaveBeenCalledWith('A3')
  })

  it('calls onTap on touchStart', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} />)

    fireEvent.touchStart(screen.getByTestId('handpan-pad-D3'))
    expect(onTap).toHaveBeenCalledWith('D3')
  })

  it('keyboard shortcut 1 triggers first note (ding)', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} />)

    fireEvent.keyDown(window, { key: '1' })
    expect(onTap).toHaveBeenCalledWith('D3')
  })

  it('keyboard shortcut 2 triggers second note', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} />)

    fireEvent.keyDown(window, { key: '2' })
    expect(onTap).toHaveBeenCalledWith('A3')
  })

  it('keyboard shortcut 9 triggers ninth note', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} />)

    fireEvent.keyDown(window, { key: '9' })
    expect(onTap).toHaveBeenCalledWith('A4')
  })

  it('Space key triggers nextExpectedNote', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} nextExpectedNote="C4" />)

    fireEvent.keyDown(window, { code: 'Space' })
    expect(onTap).toHaveBeenCalledWith('C4')
  })

  it('Space key defaults to first note when no nextExpectedNote', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} nextExpectedNote={null} />)

    fireEvent.keyDown(window, { code: 'Space' })
    expect(onTap).toHaveBeenCalledWith('D3')
  })

  it('ignores repeat key events', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} />)

    fireEvent.keyDown(window, { key: '1', repeat: true })
    expect(onTap).not.toHaveBeenCalled()
  })

  it('no-op when disabled', () => {
    const onTap = vi.fn()
    render(<HandpanPad {...defaultProps} onTap={onTap} disabled={true} />)

    fireEvent.click(screen.getByTestId('handpan-pad-D3'))
    expect(onTap).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: '1' })
    expect(onTap).not.toHaveBeenCalled()
  })

  it('shows feedback flash on the correct pad', () => {
    render(
      <HandpanPad
        {...defaultProps}
        lastFeedback={{ judgment: 'on-time', timestamp: performance.now() }}
        lastFeedbackPad="D3"
      />
    )

    const dingPad = screen.getByTestId('handpan-pad-D3')
    expect(dingPad.className).toContain('bg-green-400')
  })

  it('shows miss feedback color', () => {
    render(
      <HandpanPad
        {...defaultProps}
        lastFeedback={{ judgment: 'miss', timestamp: performance.now() }}
        lastFeedbackPad="A3"
      />
    )

    const pad = screen.getByTestId('handpan-pad-A3')
    expect(pad.className).toContain('bg-red-600')
  })

  it('disabled pads show muted colors', () => {
    render(<HandpanPad {...defaultProps} disabled={true} />)
    const dingPad = screen.getByTestId('handpan-pad-D3')
    expect(dingPad.className).toContain('bg-orange-200')
  })
})

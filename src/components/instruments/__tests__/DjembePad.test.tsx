import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DjembePad } from '../DjembePad'
import type { DjembeStroke } from '@/types'

const defaultProps = {
  onTap: vi.fn(),
  padFeedback: new Map(),
  disabled: false,
  activeStrokes: ['bass', 'tone', 'slap'] as DjembeStroke[],
  nextExpectedNote: null,
}

describe('DjembePad', () => {
  it('renders the fan layout by default', () => {
    render(<DjembePad {...defaultProps} />)
    expect(screen.getByTestId('djembe-pad-fan')).toBeInTheDocument()
    expect(screen.queryByTestId('djembe-pad-grid')).not.toBeInTheDocument()
  })

  it('renders the grid layout when selected', () => {
    render(<DjembePad {...defaultProps} layout="grid" />)
    expect(screen.getByTestId('djembe-pad-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('djembe-pad-fan')).not.toBeInTheDocument()
  })

  it.each(['fan', 'grid'] as const)('%s renders all six stroke-hand targets', (layout) => {
    render(<DjembePad {...defaultProps} layout={layout} />)
    for (const stroke of ['bass', 'tone', 'slap']) {
      for (const hand of ['strong', 'weak']) {
        expect(screen.getByTestId(`djembe-pad-${stroke}-${hand}`)).toBeInTheDocument()
      }
    }
  })

  it.each(['fan', 'grid'] as const)('%s only renders the strokes in use', (layout) => {
    render(<DjembePad {...defaultProps} layout={layout} activeStrokes={['bass']} />)
    expect(screen.getByTestId('djembe-pad-bass-strong')).toBeInTheDocument()
    expect(screen.getByTestId('djembe-pad-bass-weak')).toBeInTheDocument()
    expect(screen.queryByTestId('djembe-pad-tone-strong')).not.toBeInTheDocument()
    expect(screen.queryByTestId('djembe-pad-slap-strong')).not.toBeInTheDocument()
  })

  it.each(['fan', 'grid'] as const)('%s emits the stroke-hand note on tap', (layout) => {
    const onTap = vi.fn()
    render(<DjembePad {...defaultProps} layout={layout} onTap={onTap} />)

    fireEvent.pointerDown(screen.getByTestId('djembe-pad-tone-weak'))
    expect(onTap).toHaveBeenCalledWith('tone-weak')
  })

  it.each(['fan', 'grid'] as const)('%s does not emit when disabled', (layout) => {
    const onTap = vi.fn()
    render(<DjembePad {...defaultProps} layout={layout} onTap={onTap} disabled />)

    fireEvent.pointerDown(screen.getByTestId('djembe-pad-bass-strong'))
    expect(onTap).not.toHaveBeenCalled()
  })

  it.each(['fan', 'grid'] as const)('%s flashes both hands independently', (layout) => {
    render(
      <DjembePad
        {...defaultProps}
        layout={layout}
        padFeedback={
          new Map([
            ['tone-strong', { judgment: 'on-time' as const, timestamp: 0 }],
            ['tone-weak', { judgment: 'miss' as const, timestamp: 0 }],
          ])
        }
      />
    )

    const strong = screen.getByTestId('djembe-pad-tone-strong')
    const weak = screen.getByTestId('djembe-pad-tone-weak')
    // Fan paths use SVG fills, grid buttons use Tailwind classes.
    const strongStyle = strong.getAttribute('fill') ?? strong.className
    const weakStyle = weak.getAttribute('fill') ?? weak.className
    expect(strongStyle).not.toBe(weakStyle)
  })

  describe('keyboard', () => {
    it('maps the left cluster s/d/f and right cluster j/k/l', () => {
      const onTap = vi.fn()
      render(<DjembePad {...defaultProps} onTap={onTap} />)

      // Right-handed: strong hand is the right cluster.
      fireEvent.keyDown(window, { key: 'l' })
      expect(onTap).toHaveBeenLastCalledWith('bass-strong')
      fireEvent.keyDown(window, { key: 'k' })
      expect(onTap).toHaveBeenLastCalledWith('tone-strong')
      fireEvent.keyDown(window, { key: 'j' })
      expect(onTap).toHaveBeenLastCalledWith('slap-strong')
      fireEvent.keyDown(window, { key: 's' })
      expect(onTap).toHaveBeenLastCalledWith('bass-weak')
      fireEvent.keyDown(window, { key: 'f' })
      expect(onTap).toHaveBeenLastCalledWith('slap-weak')
    })

    it('mirrors the key clusters for a left-handed player', () => {
      const onTap = vi.fn()
      render(<DjembePad {...defaultProps} onTap={onTap} leftHanded />)

      // Left-handed: the strong hand is now the left cluster.
      fireEvent.keyDown(window, { key: 's' })
      expect(onTap).toHaveBeenLastCalledWith('bass-strong')
      fireEvent.keyDown(window, { key: 'l' })
      expect(onTap).toHaveBeenLastCalledWith('bass-weak')
    })

    it('Space plays the next expected note', () => {
      const onTap = vi.fn()
      render(<DjembePad {...defaultProps} onTap={onTap} nextExpectedNote="slap-weak" />)

      fireEvent.keyDown(window, { code: 'Space' })
      expect(onTap).toHaveBeenCalledWith('slap-weak')
    })

    it('ignores keys when disabled and ignores auto-repeat', () => {
      const onTap = vi.fn()
      render(<DjembePad {...defaultProps} onTap={onTap} disabled />)
      fireEvent.keyDown(window, { key: 'l' })
      expect(onTap).not.toHaveBeenCalled()
    })
  })

  it('shows traditional syllables when asked', () => {
    render(<DjembePad {...defaultProps} layout="grid" showSyllables />)
    // Gun/Dun = strong/weak bass, Go/Do = tone, Pa/Ta = slap.
    expect(screen.getByText('Gun')).toBeInTheDocument()
    expect(screen.getByText('Dun')).toBeInTheDocument()
    expect(screen.getByText('Pa')).toBeInTheDocument()
    expect(screen.getByText('Ta')).toBeInTheDocument()
  })
})

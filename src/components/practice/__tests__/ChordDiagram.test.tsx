import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChordDiagram } from '../ChordDiagram'

describe('ChordDiagram', () => {
  it('renders chord name and a diagram for known chord', () => {
    render(<ChordDiagram chord="G" />)
    const root = screen.getByTestId('chord-diagram')
    expect(root).toHaveAttribute('data-chord', 'G')
    expect(root).toHaveTextContent('G')
  })

  it('returns null for unknown chord', () => {
    const { container } = render(<ChordDiagram chord="Q9" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders dots for fingered notes (G has 3 fingered notes)', () => {
    const { container } = render(<ChordDiagram chord="G" />)
    // G frets: [3, 2, 0, 0, 0, 3] -> 3 fingered dots
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(3)
  })

  it('renders O markers for open strings and X for muted (C chord)', () => {
    const { container } = render(<ChordDiagram chord="C" />)
    // C frets: [null, 3, 2, 0, 1, 0] -> 1 X, 2 O
    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent)
    const xCount = texts.filter((t) => t === 'X').length
    const oCount = texts.filter((t) => t === 'O').length
    expect(xCount).toBe(1)
    expect(oCount).toBe(2)
  })

  it('applies dimmed opacity when dimmed prop is true', () => {
    render(<ChordDiagram chord="G" dimmed />)
    const root = screen.getByTestId('chord-diagram')
    expect(root.style.opacity).toBe('0.45')
  })
})

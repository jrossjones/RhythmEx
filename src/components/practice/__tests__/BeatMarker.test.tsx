import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BeatMarker } from '../BeatMarker'

describe('BeatMarker', () => {
  it('renders circle shape', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker).toBeInTheDocument()
    expect(marker.dataset.shape).toBe('circle')
    expect(marker.className).toContain('rounded-full')
  })

  it('renders diamond shape', () => {
    render(<BeatMarker shape="diamond" color="bg-orange-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.dataset.shape).toBe('diamond')
    expect(marker.className).toContain('rotate-45')
  })

  it('renders triangle shape', () => {
    render(<BeatMarker shape="triangle" color="bg-cyan-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.dataset.shape).toBe('triangle')
    expect(marker.style.clipPath).toBe('polygon(50% 0%, 0% 100%, 100% 100%)')
  })

  it('renders square shape', () => {
    render(<BeatMarker shape="square" color="bg-purple-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.dataset.shape).toBe('square')
    expect(marker.className).toContain('rounded-sm')
  })

  it('renders rounded-rect shape', () => {
    render(<BeatMarker shape="rounded-rect" color="bg-pink-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.dataset.shape).toBe('rounded-rect')
    expect(marker.className).toContain('rounded')
  })

  it('renders line shape', () => {
    render(<BeatMarker shape="line" color="bg-orange-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.dataset.shape).toBe('line')
    expect(marker.style.width).toBe('100%')
    expect(marker.style.height).toBe('6px')
  })

  it('renders label text inside marker', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" label="K" />)
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders multi-char labels', () => {
    render(<BeatMarker shape="square" color="bg-purple-400" label="T1" />)
    expect(screen.getByText('T1')).toBeInTheDocument()
  })

  it('applies pulse class when isNext', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" isNext />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.className).toContain('animate-pulse')
    expect(marker.className).toContain('scale-125')
  })

  it('applies ring class when isJudged and not hollow', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" isJudged />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.className).toContain('ring-2')
    expect(marker.className).toContain('ring-white')
  })

  it('does not apply ring class when isJudged and hollow', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" isJudged isHollow borderColor="border-green-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.className).not.toContain('ring-2')
  })

  it('uses default size of 16px', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.style.width).toBe('16px')
    expect(marker.style.height).toBe('16px')
  })

  it('uses custom size', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" size={24} />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.style.width).toBe('24px')
    expect(marker.style.height).toBe('24px')
  })

  it('rounded-rect width is 1.2x size', () => {
    render(<BeatMarker shape="rounded-rect" color="bg-pink-400" size={20} />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.style.width).toBe('24px')
    expect(marker.style.height).toBe('20px')
  })

  // --- Hollow/filled state tests ---

  it('renders filled by default (not hollow)', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.className).toContain('bg-red-400')
    expect(marker.className).not.toContain('bg-transparent')
  })

  it('renders hollow with transparent bg and colored border', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" isHollow borderColor="border-green-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.className).toContain('bg-transparent')
    expect(marker.className).toContain('border-2')
    expect(marker.className).toContain('border-green-400')
    expect(marker.className).not.toContain('bg-red-400')
  })

  it('hollow marker uses default border color when none specified', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" isHollow />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.className).toContain('border-gray-400')
  })

  it('has transition-colors class for smooth state transitions', () => {
    render(<BeatMarker shape="circle" color="bg-red-400" />)
    const marker = screen.getByTestId('beat-marker')
    expect(marker.className).toContain('transition-colors')
  })
})

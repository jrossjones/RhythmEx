import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StickerBookScreen } from '../StickerBookScreen'
import { stickers } from '@/data/stickers'
import { saveStickerState } from '@/utils/storage'

describe('StickerBookScreen', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows all stickers as locked when nothing is earned', () => {
    render(<StickerBookScreen onBack={vi.fn()} />)
    expect(screen.getByText(`0 / ${stickers.length} collected`)).toBeInTheDocument()
    expect(screen.getAllByText('???')).toHaveLength(stickers.length)
  })

  it('shows earned stickers with emoji and name', () => {
    saveStickerState({ earned: { unicorn: 123 }, practiceDays: [] })
    render(<StickerBookScreen onBack={vi.fn()} />)
    expect(screen.getByText(`1 / ${stickers.length} collected`)).toBeInTheDocument()
    expect(screen.getByText('🦄')).toBeInTheDocument()
    expect(screen.getByText('Unicorn')).toBeInTheDocument()
    expect(screen.getAllByText('???')).toHaveLength(stickers.length - 1)
  })

  it('shows the goal description for locked stickers', () => {
    render(<StickerBookScreen onBack={vi.fn()} />)
    expect(screen.getByText('Hit every single beat right on time')).toBeInTheDocument()
  })

  it('back button calls onBack', () => {
    const onBack = vi.fn()
    render(<StickerBookScreen onBack={onBack} />)
    fireEvent.click(screen.getByText(/Back/))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})

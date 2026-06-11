import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StickerBookScreen } from '../StickerBookScreen'
import { stickers } from '@/data/stickers'
import {
  saveStickerState,
  loadStickerState,
  saveResult,
  getAllScores,
} from '@/utils/storage'
import type { ExerciseResult } from '@/types'

function makeResult(): ExerciseResult {
  return {
    exerciseId: 'test-ex',
    instrument: 'drums',
    accuracy: 85,
    stars: 2,
    tapResults: [],
    timestamp: 1000,
  }
}

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

  it('reset button clears collected stickers after confirmation', () => {
    saveStickerState({ earned: { unicorn: 123 }, practiceDays: ['2026-06-11'] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<StickerBookScreen onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('reset-stickers'))
    expect(screen.getByText(`0 / ${stickers.length} collected`)).toBeInTheDocument()
    expect(loadStickerState()).toEqual({ earned: {}, practiceDays: [] })
  })

  it('reset does nothing when confirmation is declined', () => {
    saveStickerState({ earned: { unicorn: 123 }, practiceDays: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<StickerBookScreen onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('reset-stickers'))
    expect(screen.getByText(`1 / ${stickers.length} collected`)).toBeInTheDocument()
    expect(loadStickerState().earned).toEqual({ unicorn: 123 })
  })

  it('hides the reset button when nothing is earned', () => {
    render(<StickerBookScreen onBack={vi.fn()} />)
    expect(screen.queryByTestId('reset-stickers')).not.toBeInTheDocument()
  })

  it('full reset clears stickers and scores after confirmation', () => {
    saveStickerState({ earned: { unicorn: 123 }, practiceDays: ['2026-06-11'] })
    saveResult(makeResult())
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<StickerBookScreen onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('reset-all'))
    expect(loadStickerState()).toEqual({ earned: {}, practiceDays: [] })
    expect(getAllScores()).toEqual({})
    expect(screen.getByText(`0 / ${stickers.length} collected`)).toBeInTheDocument()
    expect(screen.queryByTestId('reset-all')).not.toBeInTheDocument()
  })

  it('shows full reset when only scores exist (no stickers)', () => {
    saveResult(makeResult())
    render(<StickerBookScreen onBack={vi.fn()} />)
    expect(screen.queryByTestId('reset-stickers')).not.toBeInTheDocument()
    expect(screen.getByTestId('reset-all')).toBeInTheDocument()
  })

  it('full reset does nothing when confirmation is declined', () => {
    saveStickerState({ earned: { unicorn: 123 }, practiceDays: [] })
    saveResult(makeResult())
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<StickerBookScreen onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('reset-all'))
    expect(loadStickerState().earned).toEqual({ unicorn: 123 })
    expect(Object.keys(getAllScores())).toHaveLength(1)
  })

  it('hides both reset buttons when there is no progress at all', () => {
    render(<StickerBookScreen onBack={vi.fn()} />)
    expect(screen.queryByTestId('reset-stickers')).not.toBeInTheDocument()
    expect(screen.queryByTestId('reset-all')).not.toBeInTheDocument()
  })
})

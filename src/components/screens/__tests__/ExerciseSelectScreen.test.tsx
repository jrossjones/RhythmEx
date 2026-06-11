import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExerciseSelectScreen } from '../ExerciseSelectScreen'

beforeEach(() => {
  localStorage.clear()
})

describe('ExerciseSelectScreen', () => {
  it('renders all three difficulty sections for drums', () => {
    render(<ExerciseSelectScreen instrument="drums" onSelect={() => {}} onBack={() => {}} />)
    expect(screen.getByTestId('difficulty-section-beginner')).toBeInTheDocument()
    expect(screen.getByTestId('difficulty-section-intermediate')).toBeInTheDocument()
    expect(screen.getByTestId('difficulty-section-advanced')).toBeInTheDocument()
  })

  it('renders all three sections for strumming', () => {
    render(<ExerciseSelectScreen instrument="strumming" onSelect={() => {}} onBack={() => {}} />)
    expect(screen.getByTestId('difficulty-section-beginner')).toBeInTheDocument()
    expect(screen.getByTestId('difficulty-section-intermediate')).toBeInTheDocument()
    expect(screen.getByTestId('difficulty-section-advanced')).toBeInTheDocument()
  })

  it('shows beginner, intermediate, and advanced exercises simultaneously (no tabs)', () => {
    render(<ExerciseSelectScreen instrument="drums" onSelect={() => {}} onBack={() => {}} />)
    // 9 drum exercises across 3 difficulties — all visible at once
    const beginnerSection = screen.getByTestId('difficulty-section-beginner')
    const advancedSection = screen.getByTestId('difficulty-section-advanced')
    expect(beginnerSection.querySelectorAll('button').length).toBeGreaterThan(0)
    expect(advancedSection.querySelectorAll('button').length).toBeGreaterThan(0)
  })

  it('calls onSelect with the exercise when a card is clicked', () => {
    const onSelect = vi.fn()
    render(<ExerciseSelectScreen instrument="drums" onSelect={onSelect} onBack={() => {}} />)
    const advancedSection = screen.getByTestId('difficulty-section-advanced')
    const firstAdvanced = advancedSection.querySelector('button')!
    fireEvent.click(firstAdvanced)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0].difficulty).toBe('advanced')
  })

  it('calls onBack from the navigation back button', () => {
    const onBack = vi.fn()
    render(<ExerciseSelectScreen instrument="drums" onSelect={() => {}} onBack={onBack} />)
    fireEvent.click(screen.getByText(/back/i))
    expect(onBack).toHaveBeenCalled()
  })

  it('daily challenge card selects a generated daily exercise', () => {
    const onSelect = vi.fn()
    render(<ExerciseSelectScreen instrument="drums" onSelect={onSelect} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId('daily-challenge'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    const exercise = onSelect.mock.calls[0][0]
    expect(exercise.id).toMatch(/^daily-\d{4}-\d{2}-\d{2}$/)
    expect(exercise.instrument).toBe('drums')
  })

  it('surprise me button selects a generated exercise of that difficulty', () => {
    const onSelect = vi.fn()
    render(<ExerciseSelectScreen instrument="handpan" onSelect={onSelect} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId('surprise-me-intermediate'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    const exercise = onSelect.mock.calls[0][0]
    expect(exercise.id).toMatch(/^surprise-\d+$/)
    expect(exercise.difficulty).toBe('intermediate')
    expect(exercise.instrument).toBe('handpan')
  })
})

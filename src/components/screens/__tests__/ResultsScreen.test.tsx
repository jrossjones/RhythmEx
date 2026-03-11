import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultsScreen } from '../ResultsScreen'
import type { ExerciseResult, TapResult } from '@/types'

vi.mock('@/utils/storage', () => ({
  getBestScore: vi.fn(() => null),
}))

import { getBestScore } from '@/utils/storage'
const mockGetBestScore = vi.mocked(getBestScore)

function makeTap(judgment: TapResult['judgment']): TapResult {
  return { expectedMs: 0, actualMs: 0, deltaMs: 0, judgment }
}

function makeResult(overrides: Partial<ExerciseResult> = {}): ExerciseResult {
  return {
    exerciseId: 'test-ex',
    instrument: 'drums',
    accuracy: 85,
    stars: 2,
    tapResults: [
      makeTap('on-time'),
      makeTap('on-time'),
      makeTap('early'),
      makeTap('miss'),
    ],
    timestamp: 1000,
    ...overrides,
  }
}

describe('ResultsScreen', () => {
  it('renders star display with correct rating', () => {
    render(
      <ResultsScreen
        result={makeResult({ stars: 3 })}
        exerciseName="Quarter Notes"
        onRetry={vi.fn()}
        onNewExercise={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('3 out of 3 stars')).toBeInTheDocument()
  })

  it('renders accuracy percentage', () => {
    render(
      <ResultsScreen
        result={makeResult({ accuracy: 92.7 })}
        exerciseName="Quarter Notes"
        onRetry={vi.fn()}
        onNewExercise={vi.fn()}
      />,
    )
    expect(screen.getByText('93%')).toBeInTheDocument()
  })

  it('renders tap breakdown counts', () => {
    render(
      <ResultsScreen
        result={makeResult()}
        exerciseName="Quarter Notes"
        onRetry={vi.fn()}
        onNewExercise={vi.fn()}
      />,
    )
    expect(screen.getByText('On Time: 2')).toBeInTheDocument()
    expect(screen.getByText('Early: 1')).toBeInTheDocument()
    expect(screen.getByText('Miss: 1')).toBeInTheDocument()
    expect(screen.getByText('Late: 0')).toBeInTheDocument()
  })

  it('shows "New Best!" when accuracy beats stored best', () => {
    mockGetBestScore.mockReturnValue({
      bestStars: 2,
      bestAccuracy: 85,
      lastPlayed: 500,
      instrument: 'drums',
      attempts: 2,
      totalAccuracy: 150,
    })

    render(
      <ResultsScreen
        result={makeResult({ accuracy: 90 })}
        exerciseName="Quarter Notes"
        onRetry={vi.fn()}
        onNewExercise={vi.fn()}
      />,
    )
    expect(screen.getByText('New Best!')).toBeInTheDocument()
  })

  it('does not show "New Best!" on first attempt', () => {
    mockGetBestScore.mockReturnValue({
      bestStars: 2,
      bestAccuracy: 85,
      lastPlayed: 1000,
      instrument: 'drums',
      attempts: 1,
      totalAccuracy: 85,
    })

    render(
      <ResultsScreen
        result={makeResult({ accuracy: 85 })}
        exerciseName="Quarter Notes"
        onRetry={vi.fn()}
        onNewExercise={vi.fn()}
      />,
    )
    expect(screen.queryByText('New Best!')).not.toBeInTheDocument()
  })

  it('does not show "New Best!" on worse attempt', () => {
    mockGetBestScore.mockReturnValue({
      bestStars: 3,
      bestAccuracy: 95,
      lastPlayed: 500,
      instrument: 'drums',
      attempts: 3,
      totalAccuracy: 270,
    })

    render(
      <ResultsScreen
        result={makeResult({ accuracy: 80 })}
        exerciseName="Quarter Notes"
        onRetry={vi.fn()}
        onNewExercise={vi.fn()}
      />,
    )
    expect(screen.queryByText('New Best!')).not.toBeInTheDocument()
  })

  it('Retry button calls onRetry', () => {
    const onRetry = vi.fn()
    render(
      <ResultsScreen
        result={makeResult()}
        exerciseName="Quarter Notes"
        onRetry={onRetry}
        onNewExercise={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Retry'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('New Exercise button calls onNewExercise', () => {
    const onNewExercise = vi.fn()
    render(
      <ResultsScreen
        result={makeResult()}
        exerciseName="Quarter Notes"
        onRetry={vi.fn()}
        onNewExercise={onNewExercise}
      />,
    )
    fireEvent.click(screen.getByText('New Exercise'))
    expect(onNewExercise).toHaveBeenCalledTimes(1)
  })

  it('renders exercise name as title', () => {
    render(
      <ResultsScreen
        result={makeResult()}
        exerciseName="Half Notes"
        onRetry={vi.fn()}
        onNewExercise={vi.fn()}
      />,
    )
    expect(screen.getByText('Half Notes')).toBeInTheDocument()
  })
})

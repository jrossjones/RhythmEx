import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from '../App'
import { saveProfiles } from '@/utils/storage'
import type { ExerciseResult } from '@/types'

const threeStars: ExerciseResult = {
  exerciseId: 'quarter-note-basics',
  instrument: 'drums',
  accuracy: 95,
  stars: 3,
  tapResults: [],
  timestamp: 1,
}

// Practice pulls in Tone.js; App-level tests only need its exits.
vi.mock('@/components/screens/PracticeScreen', () => ({
  PracticeScreen: ({ onFinish, onShowResults }: {
    onFinish: (r: ExerciseResult) => void
    onShowResults: (r: ExerciseResult, starsEarned: number) => void
  }) => (
    <div>
      <button onClick={() => onFinish(threeStars)}>finish</button>
      <button onClick={() => onShowResults(threeStars, 5)}>exit loop</button>
    </div>
  ),
}))

function playQuarterNotes() {
  fireEvent.click(screen.getByRole('button', { name: /start playing/i }))
  fireEvent.click(screen.getByRole('button', { name: /drums/i }))
  fireEvent.click(screen.getByText('Quarter Note Basics'))
}

function createPlayer(name: string, secret: string, avatar: RegExp = /unicorn/i) {
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: secret }))
  fireEvent.click(screen.getByRole('button', { name: avatar }))
  fireEvent.click(screen.getByRole('button', { name: /let's go/i }))
}

describe('App profiles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with player creation on a fresh device', () => {
    render(<App />)
    createPlayer('Mia', '🐶', /wizard/i)
    expect(screen.getByText('Hi Mia!')).toBeInTheDocument()
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-avatar', 'wizard')
  })

  it('goes straight home when there is only one player', () => {
    saveProfiles([{ id: 'p1', name: 'Mia', secret: '🐶' }])
    render(<App />)
    expect(screen.getByText('Hi Mia!')).toBeInTheDocument()
  })

  it('shows the picker when there are several players', () => {
    saveProfiles([
      { id: 'p1', name: 'Mia', secret: '🐶' },
      { id: 'p2', name: 'Leo', secret: '🚀' },
    ])
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /leo/i }))
    fireEvent.click(screen.getByRole('button', { name: '🚀' }))
    expect(screen.getByText('Hi Leo!')).toBeInTheDocument()
  })

  it('can switch players from home and add a new one', () => {
    saveProfiles([{ id: 'p1', name: 'Mia', secret: '🐶' }])
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /players/i }))
    fireEvent.click(screen.getByRole('button', { name: /new player/i }))
    createPlayer('Leo', '🚀')
    expect(screen.getByText('Hi Leo!')).toBeInTheDocument()
  })

  it('removes a deleted player from the picker', () => {
    saveProfiles([
      { id: 'p1', name: 'Mia', secret: '🐶' },
      { id: 'p2', name: 'Leo', secret: '🚀' },
    ])
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /grown-ups/i }))
    const [, a, b] = screen.getByText(/what is/i).textContent!.match(/(\d+) \+ (\d+)/)!
    fireEvent.change(screen.getByLabelText(/answer/i), { target: { value: String(+a + +b) } })
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    fireEvent.click(screen.getByRole('button', { name: /delete leo/i }))
    expect(screen.queryByRole('button', { name: /delete leo/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete mia/i })).toBeInTheDocument()
  })
})

describe('App star wallet', () => {
  beforeEach(() => {
    localStorage.clear()
    saveProfiles([{ id: 'p1', name: 'Mia', secret: '🐶' }])
  })

  it('pays a finished exercise into the wallet shown at home', () => {
    render(<App />)
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('0')
    playQuarterNotes()
    fireEvent.click(screen.getByRole('button', { name: 'finish' }))
    expect(screen.getByTestId('stars-earned')).toHaveTextContent('+3 ⭐')
    expect(screen.getByTestId('avatar')).toHaveClass('motion-safe:animate-avatar-dance')
    fireEvent.click(screen.getByRole('button', { name: /new exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: '← Back' }))
    fireEvent.click(screen.getByRole('button', { name: '← Back' }))
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('3')
  })

  it('shows the loop total on the loop-exit results', () => {
    render(<App />)
    playQuarterNotes()
    fireEvent.click(screen.getByRole('button', { name: 'exit loop' }))
    expect(screen.getByTestId('stars-earned')).toHaveTextContent('+5 ⭐')
  })

  it('keeps each player’s wallet separate', () => {
    saveProfiles([
      { id: 'p1', name: 'Mia', secret: '🐶' },
      { id: 'p2', name: 'Leo', secret: '🚀' },
    ])
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /mia/i }))
    fireEvent.click(screen.getByRole('button', { name: '🐶' }))
    playQuarterNotes()
    fireEvent.click(screen.getByRole('button', { name: 'finish' }))
    fireEvent.click(screen.getByRole('button', { name: /new exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: '← Back' }))
    fireEvent.click(screen.getByRole('button', { name: '← Back' }))
    fireEvent.click(screen.getByRole('button', { name: /players/i }))
    fireEvent.click(screen.getByRole('button', { name: /leo/i }))
    fireEvent.click(screen.getByRole('button', { name: '🚀' }))
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('0')
  })
})
describe('App shop', () => {
  it('opens the shop from home and comes back', () => {
    localStorage.clear()
    saveProfiles([{ id: 'p1', name: 'Mia', secret: '🐶' }])
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /shop/i }))
    expect(screen.getByTestId('shop-balance')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '← Back' }))
    expect(screen.getByText('Hi Mia!')).toBeInTheDocument()
  })
})

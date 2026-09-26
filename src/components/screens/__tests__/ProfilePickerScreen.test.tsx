import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ProfilePickerScreen } from '../ProfilePickerScreen'
import { MAX_PROFILES } from '@/utils/profiles'
import { saveWardrobe } from '@/utils/storage'
import { newWardrobe } from '@/utils/wardrobe'
import type { Profile } from '@/types'

const profiles: Profile[] = [
  { id: 'p1', name: 'Mia', secret: '🐶' },
  { id: 'p2', name: 'Leo', secret: '🚀' },
]

function renderPicker(overrides: Partial<Parameters<typeof ProfilePickerScreen>[0]> = {}) {
  const props = {
    profiles,
    onLogin: vi.fn(),
    onNewPlayer: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
  render(<ProfilePickerScreen {...props} />)
  return props
}

function solveGate() {
  fireEvent.click(screen.getByRole('button', { name: /grown-ups/i }))
  const [, a, b] = screen.getByText(/what is/i).textContent!.match(/(\d+) \+ (\d+)/)!
  fireEvent.change(screen.getByLabelText(/answer/i), { target: { value: String(+a + +b) } })
  fireEvent.click(screen.getByRole('button', { name: 'OK' }))
}

describe('ProfilePickerScreen', () => {
  it('shows a tile per player', () => {
    renderPicker()
    expect(screen.getByRole('button', { name: /mia/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /leo/i })).toBeInTheDocument()
  })

  it("shows each player's own avatar on their tile", () => {
    localStorage.clear()
    saveWardrobe(newWardrobe('witch'), 'p1')
    renderPicker()
    const tile = screen.getByRole('button', { name: /mia/i })
    expect(within(tile).getByTestId('avatar')).toHaveAttribute('data-avatar', 'witch')
  })

  it('asks for the secret picture and logs in when it is right', () => {
    const { onLogin } = renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /mia/i }))
    fireEvent.click(screen.getByRole('button', { name: '🐶' }))
    expect(onLogin).toHaveBeenCalledWith('p1')
  })

  it('says try again on the wrong picture and does not log in', () => {
    const { onLogin } = renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /mia/i }))
    fireEvent.click(screen.getByRole('button', { name: '🚀' }))
    expect(onLogin).not.toHaveBeenCalled()
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
  })

  it('offers a new player tile until the limit is reached', () => {
    const { onNewPlayer } = renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /new player/i }))
    expect(onNewPlayer).toHaveBeenCalled()
  })

  it('hides the new player tile at the limit', () => {
    const full = Array.from({ length: MAX_PROFILES }, (_, i) => ({
      id: `p${i}`,
      name: `Kid ${i}`,
      secret: '🐶',
    }))
    renderPicker({ profiles: full })
    expect(screen.queryByRole('button', { name: /new player/i })).not.toBeInTheDocument()
  })

  it('keeps the grown-up panel closed on a wrong answer', () => {
    renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /grown-ups/i }))
    fireEvent.change(screen.getByLabelText(/answer/i), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.getByText(/not quite/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete mia/i })).not.toBeInTheDocument()
  })

  it('reveals secrets and allows deleting after the grown-up gate', () => {
    const { onDelete } = renderPicker()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    solveGate()
    expect(screen.getByTestId('secret-p1')).toHaveTextContent('🐶')
    fireEvent.click(screen.getByRole('button', { name: /delete mia/i }))
    expect(onDelete).toHaveBeenCalledWith('p1')
  })
})

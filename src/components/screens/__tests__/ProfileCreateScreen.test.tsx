import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileCreateScreen } from '../ProfileCreateScreen'

describe('ProfileCreateScreen', () => {
  it("enables Let's go only once a name, secret and buddy are chosen", () => {
    const onCreate = vi.fn()
    render(<ProfileCreateScreen onCreate={onCreate} />)
    const create = screen.getByRole('button', { name: /let's go/i })
    expect(create).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Mia' } })
    expect(create).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '🐶' }))
    expect(create).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /wizard/i }))
    expect(create).toBeEnabled()

    fireEvent.click(create)
    expect(onCreate).toHaveBeenCalledWith({ name: 'Mia', secret: '🐶', avatar: 'wizard' })
  })

  it('offers all three buddies for free as the starter', () => {
    render(<ProfileCreateScreen onCreate={vi.fn()} />)
    for (const name of [/unicorn/i, /witch/i, /wizard/i]) {
      expect(screen.getByRole('button', { name })).not.toHaveTextContent(/\d/)
    }
  })

  it('treats a whitespace-only name as empty', () => {
    render(<ProfileCreateScreen onCreate={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: '🐶' }))
    fireEvent.click(screen.getByRole('button', { name: /unicorn/i }))
    expect(screen.getByRole('button', { name: /let's go/i })).toBeDisabled()
  })

  it('shows Back only when a cancel handler is given', () => {
    const onCancel = vi.fn()
    const { rerender } = render(<ProfileCreateScreen onCreate={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    rerender(<ProfileCreateScreen onCreate={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('tells returning players their progress is kept', () => {
    render(<ProfileCreateScreen onCreate={vi.fn()} keepsProgress />)
    expect(screen.getByText(/stars and stickers will be kept/i)).toBeInTheDocument()
  })
})

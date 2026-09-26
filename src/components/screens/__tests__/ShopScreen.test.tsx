import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ShopScreen } from '../ShopScreen'
import { loadWallet, loadWardrobe, saveWallet, saveWardrobe, setActiveProfileId } from '@/utils/storage'
import { emptyWallet } from '@/utils/wallet'
import { newWardrobe } from '@/utils/wardrobe'
import type { AvatarId } from '@/types'

function setup(balance: number, avatar: AvatarId = 'unicorn') {
  localStorage.clear()
  setActiveProfileId('p1')
  saveWardrobe(newWardrobe(avatar))
  saveWallet({ ...emptyWallet(), balance })
  const onBack = vi.fn()
  render(<ShopScreen onBack={onBack} />)
  return { onBack }
}

const preview = () => screen.getByTestId('shop-preview')
const tab = (name: RegExp) => fireEvent.click(screen.getByRole('tab', { name }))

describe('ShopScreen', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the star balance and goes back', () => {
    const { onBack } = setup(10)
    expect(screen.getByTestId('shop-balance')).toHaveTextContent('10')
    fireEvent.click(screen.getByRole('button', { name: '← Back' }))
    expect(onBack).toHaveBeenCalled()
  })

  it('tries an item on before buying, then buys and wears it', () => {
    setup(10)
    tab(/hats/i)
    fireEvent.click(screen.getByRole('button', { name: 'Crown' }))
    expect(within(preview()).getByTestId('avatar-item-crown')).toBeInTheDocument()
    expect(loadWardrobe()!.ownedItems).not.toContain('crown')

    fireEvent.click(screen.getByRole('button', { name: /buy for 8/i }))
    expect(screen.getByTestId('shop-balance')).toHaveTextContent('2')
    expect(loadWallet().balance).toBe(2)
    expect(loadWardrobe()!.ownedItems).toContain('crown')
    expect(within(preview()).getByTestId('avatar-item-crown')).toBeInTheDocument()
  })

  it('cancelling a try-on takes the item back off', () => {
    setup(10)
    tab(/hats/i)
    fireEvent.click(screen.getByRole('button', { name: 'Crown' }))
    fireEvent.click(screen.getByRole('button', { name: /not now/i }))
    expect(within(preview()).queryByTestId('avatar-item-crown')).not.toBeInTheDocument()
  })

  it('says how many more stars are needed when short', () => {
    setup(2)
    tab(/hats/i)
    fireEvent.click(screen.getByRole('button', { name: 'Crown' }))
    expect(screen.getByText(/need 6 more/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /buy for/i })).not.toBeInTheDocument()
  })

  it('takes an owned item off and puts it back on for free', () => {
    setup(10)
    tab(/hats/i)
    fireEvent.click(screen.getByRole('button', { name: 'Crown' }))
    fireEvent.click(screen.getByRole('button', { name: /buy for 8/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Crown' }))
    expect(within(preview()).queryByTestId('avatar-item-crown')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Crown' }))
    expect(within(preview()).getByTestId('avatar-item-crown')).toBeInTheDocument()
    expect(loadWallet().balance).toBe(2)
  })

  it('only lists items that fit the current buddy', () => {
    setup(10)
    tab(/extras/i)
    expect(screen.queryByRole('button', { name: /magic wand/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /glitter horn/i })).toBeInTheDocument()
  })

  it('buys a new buddy and switches to it', () => {
    setup(25)
    tab(/buddies/i)
    fireEvent.click(screen.getByRole('button', { name: /wizard/i }))
    fireEvent.click(screen.getByRole('button', { name: /buy for 20/i }))
    expect(within(preview()).getByTestId('avatar')).toHaveAttribute('data-avatar', 'wizard')
    expect(loadWardrobe()!.activeAvatar).toBe('wizard')
    expect(loadWallet().balance).toBe(5)

    fireEvent.click(screen.getByRole('button', { name: /unicorn/i }))
    expect(within(preview()).getByTestId('avatar')).toHaveAttribute('data-avatar', 'unicorn')
    expect(loadWallet().balance).toBe(5)
  })

  it('sells coat colours', () => {
    setup(10)
    tab(/colou?rs/i)
    fireEvent.click(screen.getByRole('button', { name: /coat: pink/i }))
    fireEvent.click(screen.getByRole('button', { name: /buy for 2/i }))
    expect(loadWardrobe()!.outfits.unicorn!.body).toBe('pink')
    expect(loadWallet().balance).toBe(8)
  })

  it('lets anyone pick any skin tone for free', () => {
    setup(0, 'witch')
    tab(/colou?rs/i)
    fireEvent.click(screen.getByRole('button', { name: /skin: skin 4/i }))
    expect(loadWardrobe()!.outfits.witch!.body).toBe('skin-4')
    expect(screen.queryByRole('button', { name: /buy for/i })).not.toBeInTheDocument()
  })

  it('offers colours for worn items', () => {
    setup(0, 'witch')
    tab(/colou?rs/i)
    expect(screen.getByRole('button', { name: /witch hat: purple/i })).toHaveTextContent('2')
  })
})

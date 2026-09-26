import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from '../Avatar'
import { COLORS } from '@/data/avatarColors'
import type { AvatarLook } from '@/types'

const unicorn: AvatarLook = {
  avatar: 'unicorn',
  outfit: { body: 'pink', hair: 'sky', items: { hat: { id: 'crown', color: 'gold' } } },
}

describe('Avatar', () => {
  it('colours the body and hair from the outfit', () => {
    render(<Avatar look={unicorn} />)
    expect(screen.getByTestId('avatar-body')).toHaveClass(COLORS.pink.fill)
    expect(screen.getByTestId('avatar-hair')).toHaveClass(COLORS.sky.fill)
  })

  it('draws equipped items in their chosen colour', () => {
    render(<Avatar look={unicorn} />)
    expect(screen.getByTestId('avatar-item-crown')).toHaveClass(COLORS.gold.fill)
  })

  it('gives only the unicorn a horn', () => {
    const { unmount } = render(<Avatar look={unicorn} />)
    expect(screen.getByTestId('avatar-horn')).toBeInTheDocument()
    unmount()
    render(<Avatar look={{ avatar: 'witch', outfit: { body: 'skin-1', hair: 'black', items: {} } }} />)
    expect(screen.queryByTestId('avatar-horn')).not.toBeInTheDocument()
  })

  it('skips items that do not fit the avatar', () => {
    render(
      <Avatar
        look={{ avatar: 'unicorn', outfit: { body: 'white', hair: 'magenta', items: { hand: { id: 'wand', color: 'gold' } } } }}
      />,
    )
    expect(screen.queryByTestId('avatar-item-wand')).not.toBeInTheDocument()
  })

  it('exposes which avatar it is and passes through extra classes', () => {
    render(<Avatar look={unicorn} className="animate-bounce" />)
    const svg = screen.getByTestId('avatar')
    expect(svg).toHaveAttribute('data-avatar', 'unicorn')
    expect(svg).toHaveClass('animate-bounce')
  })
})

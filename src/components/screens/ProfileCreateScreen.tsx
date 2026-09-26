import { useState } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { SecretGrid } from '@/components/profile/SecretGrid'
import { Avatar } from '@/components/avatar/Avatar'
import { AVATARS } from '@/data/avatars'
import { defaultOutfit } from '@/utils/wardrobe'
import type { AvatarId } from '@/types'

export interface NewPlayer {
  name: string
  secret: string
  avatar: AvatarId
}

interface ProfileCreateScreenProps {
  onCreate: (player: NewPlayer) => void
  /** Omitted for the very first player — there is nowhere to go back to. */
  onCancel?: () => void
  /** Pre-profiles progress exists and will be moved into this player. */
  keepsProgress?: boolean
}

export function ProfileCreateScreen({ onCreate, onCancel, keepsProgress }: ProfileCreateScreenProps) {
  const [name, setName] = useState('')
  const [secret, setSecret] = useState<string | undefined>()
  const [avatar, setAvatar] = useState<AvatarId | undefined>()
  const ready = name.trim() !== '' && secret !== undefined && avatar !== undefined

  return (
    <Layout>
      <Navigation title="New player" onBack={onCancel} />

      <div className="flex flex-col gap-6">
        {keepsProgress && (
          <p className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800">
            Welcome back! Your stars and stickers will be kept for this player.
          </p>
        )}

        <label className="flex flex-col gap-2 font-semibold text-gray-700">
          Your name
          <input
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 text-lg font-normal text-gray-800"
          />
        </label>

        <div className="flex flex-col gap-2">
          <p className="font-semibold text-gray-700">Pick your secret picture</p>
          <p className="text-sm text-gray-500">You'll tap it to start playing. Keep it secret!</p>
          <SecretGrid onPick={setSecret} selected={secret} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-semibold text-gray-700">Pick your buddy</p>
          <div className="grid grid-cols-3 gap-3">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAvatar(a.id)}
                aria-pressed={avatar === a.id}
                className={`flex flex-col items-center gap-1 rounded-2xl p-2 font-semibold text-gray-700 cursor-pointer touch-manipulation ${
                  avatar === a.id ? 'bg-indigo-200 ring-4 ring-indigo-400' : 'bg-white hover:bg-indigo-50'
                }`}
              >
                <Avatar look={{ avatar: a.id, outfit: defaultOutfit(a.id) }} size="sm" />
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <Button size="lg" disabled={!ready} onClick={() => ready && onCreate({ name, secret, avatar })}>
          Let's go!
        </Button>
      </div>
    </Layout>
  )
}

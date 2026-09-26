import { Layout } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/avatar/Avatar'
import type { AvatarLook } from '@/types'

interface HomeScreenProps {
  playerName: string
  balance: number
  look: AvatarLook
  onStart: () => void
  onStickerBook: () => void
  onShop: () => void
  onPlayers: () => void
}

// Injected at build time; 'dev' during local dev or if git is unavailable.
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : ''

export function HomeScreen({ playerName, balance, look, onStart, onStickerBook, onShop, onPlayers }: HomeScreenProps) {
  return (
    <Layout>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-amber-100 px-4 py-1 text-lg font-bold text-amber-700" data-testid="wallet-balance">
          ⭐ {balance}
        </span>
        <Button variant="ghost" size="sm" onClick={onPlayers}>
          👥 Players
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center pt-4 text-center">
        <h1 className="mb-2 text-5xl font-extrabold text-indigo-600">
          RhythmEx
        </h1>
        <Avatar look={look} size="lg" className="my-2" />
        <p className="mb-2 text-2xl font-bold text-gray-700">Hi {playerName}!</p>
        <p className="mb-8 text-lg text-gray-500">
          Practice your rhythm skills!
        </p>
        <div className="flex flex-col items-center gap-4">
          <Button size="lg" onClick={onStart}>
            Start Playing
          </Button>
          <Button variant="secondary" onClick={onShop}>
            Shop &amp; Wardrobe 🛍️
          </Button>
          <Button variant="secondary" onClick={onStickerBook}>
            Sticker Book 📒
          </Button>
        </div>
      </div>
      <span className="fixed bottom-2 right-2 text-[10px] text-gray-400 select-none">
        v{appVersion}{buildDate && ` · ${buildDate} UTC`}
      </span>
    </Layout>
  )
}

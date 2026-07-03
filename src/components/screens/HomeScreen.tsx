import { Layout } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'

interface HomeScreenProps {
  onStart: () => void
  onStickerBook: () => void
}

// Injected at build time; 'dev' during local dev or if git is unavailable.
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : ''

export function HomeScreen({ onStart, onStickerBook }: HomeScreenProps) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-16 text-center">
        <h1 className="mb-2 text-5xl font-extrabold text-indigo-600">
          RhythmEx
        </h1>
        <p className="mb-12 text-lg text-gray-500">
          Practice your rhythm skills!
        </p>
        <div className="flex flex-col items-center gap-4">
          <Button size="lg" onClick={onStart}>
            Start Playing
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

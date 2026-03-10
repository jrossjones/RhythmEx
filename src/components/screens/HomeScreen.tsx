import { Layout } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'

interface HomeScreenProps {
  onStart: () => void
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-16 text-center">
        <h1 className="mb-2 text-5xl font-extrabold text-indigo-600">
          RhythmEx
        </h1>
        <p className="mb-12 text-lg text-gray-500">
          Practice your rhythm skills!
        </p>
        <Button size="lg" onClick={onStart}>
          Start Playing
        </Button>
      </div>
    </Layout>
  )
}

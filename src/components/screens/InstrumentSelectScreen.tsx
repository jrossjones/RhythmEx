import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import type { InstrumentType } from '@/types'

interface InstrumentSelectScreenProps {
  onSelect: (instrument: InstrumentType) => void
  onBack: () => void
}

const instruments: { type: InstrumentType; label: string; emoji: string; color: string }[] = [
  { type: 'drums', label: 'Drums', emoji: '\uD83E\uDD41', color: 'from-orange-400 to-red-500' },
  { type: 'handpan', label: 'Handpan', emoji: '\uD83C\uDFB6', color: 'from-teal-400 to-cyan-500' },
]

export function InstrumentSelectScreen({ onSelect, onBack }: InstrumentSelectScreenProps) {
  return (
    <Layout>
      <Navigation title="Pick an Instrument" onBack={onBack} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {instruments.map(({ type, label, emoji, color }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${color} p-8 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
          >
            <span className="mb-2 text-5xl">{emoji}</span>
            <span className="text-xl font-bold">{label}</span>
          </button>
        ))}
      </div>
    </Layout>
  )
}

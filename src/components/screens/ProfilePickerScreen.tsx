import { useState } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { SecretGrid } from '@/components/profile/SecretGrid'
import { ParentGate } from '@/components/profile/ParentGate'
import { ParentPanel } from '@/components/profile/ParentPanel'
import { Avatar } from '@/components/avatar/Avatar'
import { MAX_PROFILES } from '@/utils/profiles'
import { loadLook } from '@/utils/wardrobe'
import type { Profile } from '@/types'

interface ProfilePickerScreenProps {
  profiles: Profile[]
  onLogin: (id: string) => void
  onNewPlayer: () => void
  onDelete: (id: string) => void
}

type Mode =
  | { kind: 'pick' }
  | { kind: 'secret'; profile: Profile; wrong: boolean }
  | { kind: 'gate'; question: [number, number] }
  | { kind: 'parent' }

export function ProfilePickerScreen({ profiles, onLogin, onNewPlayer, onDelete }: ProfilePickerScreenProps) {
  const [mode, setMode] = useState<Mode>({ kind: 'pick' })

  const openGate = () => {
    const addend = () => 6 + Math.floor(Math.random() * 4)
    setMode({ kind: 'gate', question: [addend(), addend()] })
  }

  if (mode.kind === 'secret') {
    const { profile } = mode
    return (
      <Layout>
        <div className="flex flex-col items-center gap-4 pt-8 text-center">
          <Avatar look={loadLook(profile.id)} />
          <h1 className="text-2xl font-bold text-indigo-600">Hi {profile.name}!</h1>
          <p className="text-gray-600">Tap your secret picture</p>
          <SecretGrid
            onPick={(secret) =>
              secret === profile.secret ? onLogin(profile.id) : setMode({ ...mode, wrong: true })
            }
          />
          {mode.wrong && <p className="font-semibold text-orange-500">Oops — try again!</p>}
          <Button variant="ghost" onClick={() => setMode({ kind: 'pick' })}>
            &larr; Back
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="mb-6 pt-4 text-center text-3xl font-extrabold text-indigo-600">Who's playing?</h1>

      {mode.kind === 'gate' && (
        <ParentGate
          question={mode.question}
          onPass={() => setMode({ kind: 'parent' })}
          onCancel={() => setMode({ kind: 'pick' })}
        />
      )}

      {mode.kind === 'parent' && (
        <ParentPanel profiles={profiles} onDelete={onDelete} onClose={() => setMode({ kind: 'pick' })} />
      )}

      {mode.kind === 'pick' && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setMode({ kind: 'secret', profile: p, wrong: false })}
                className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 text-lg font-bold text-gray-800 shadow-sm cursor-pointer touch-manipulation hover:bg-indigo-50"
              >
                <Avatar look={loadLook(p.id)} size="sm" />
                {p.name}
              </button>
            ))}
            {profiles.length < MAX_PROFILES && (
              <button
                onClick={onNewPlayer}
                className="flex min-h-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 p-4 text-lg font-bold text-indigo-500 cursor-pointer touch-manipulation hover:bg-indigo-50"
              >
                + New player
              </button>
            )}
          </div>
          <div className="mt-8 text-center">
            <button onClick={openGate} className="text-xs text-gray-400 underline cursor-pointer hover:text-gray-600">
              Grown-ups
            </button>
          </div>
        </>
      )}
    </Layout>
  )
}

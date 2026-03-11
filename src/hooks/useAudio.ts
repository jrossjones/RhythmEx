import { useRef, useState, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import type { DrumPad } from '@/types'

interface Synths {
  kick: Tone.MembraneSynth
  snare: Tone.NoiseSynth
  hihat: Tone.MetalSynth
  tom1: Tone.MembraneSynth
  tom2: Tone.MembraneSynth
  metronome: Tone.Synth
}

export interface UseAudioReturn {
  playDrum: (pad: DrumPad) => void
  playMetronomeClick: (accent?: boolean) => void
  startAudioContext: () => Promise<void>
  isAudioReady: boolean
}

export function useAudio(): UseAudioReturn {
  const [isAudioReady, setIsAudioReady] = useState(false)
  const synthsRef = useRef<Synths | null>(null)

  const createSynths = useCallback((): Synths => {
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
    }).toDestination()

    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
    }).toDestination()

    const hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination()
    hihat.volume.value = -10

    const tom1 = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    }).toDestination()

    const tom2 = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    }).toDestination()

    const metronome = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
    }).toDestination()
    metronome.volume.value = -12

    return { kick, snare, hihat, tom1, tom2, metronome }
  }, [])

  const startAudioContext = useCallback(async () => {
    if (synthsRef.current) return
    await Tone.start()
    synthsRef.current = createSynths()
    setIsAudioReady(true)
  }, [createSynths])

  const playDrum = useCallback((pad: DrumPad) => {
    const synths = synthsRef.current
    if (!synths) return

    const now = Tone.now()
    switch (pad) {
      case 'kick':
        synths.kick.triggerAttackRelease('C1', '8n', now)
        break
      case 'snare':
        synths.snare.triggerAttackRelease('8n', now)
        break
      case 'hihat':
        synths.hihat.triggerAttackRelease('C4', '32n', now)
        break
      case 'tom1':
        synths.tom1.triggerAttackRelease('A1', '8n', now)
        break
      case 'tom2':
        synths.tom2.triggerAttackRelease('E1', '8n', now)
        break
    }
  }, [])

  const playMetronomeClick = useCallback((accent?: boolean) => {
    const synths = synthsRef.current
    if (!synths) return

    const note = accent ? 'C5' : 'G4'
    synths.metronome.triggerAttackRelease(note, '32n', Tone.now())
  }, [])

  useEffect(() => {
    return () => {
      const synths = synthsRef.current
      if (synths) {
        synths.kick.dispose()
        synths.snare.dispose()
        synths.hihat.dispose()
        synths.tom1.dispose()
        synths.tom2.dispose()
        synths.metronome.dispose()
        synthsRef.current = null
      }
    }
  }, [])

  return { playDrum, playMetronomeClick, startAudioContext, isAudioReady }
}

import { useRef, useState, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import type { DjembeHand, DjembeStroke, DrumPad, StrumDirection } from '@/types'
import { getChord } from '@/data/chords'

interface Synths {
  kick: Tone.MembraneSynth
  snare: Tone.NoiseSynth
  hihat: Tone.MetalSynth
  tom1: Tone.MembraneSynth
  tom2: Tone.MembraneSynth
  metronome: Tone.Synth
  handpan: Tone.PolySynth
  reverb: Tone.Reverb
  strumming: Tone.Sampler
  djembeBass: Tone.MembraneSynth
  djembeTone: Tone.MembraneSynth
  // Slap gets one chain per hand rather than a shared, mutated filter: the
  // weak hand's duller attack is a different cutoff, and re-tuning a shared
  // filter mid-phrase would race with the previous note still ringing.
  djembeSlapStrong: Tone.NoiseSynth
  djembeSlapStrongFilter: Tone.Filter
  djembeSlapWeak: Tone.NoiseSynth
  djembeSlapWeakFilter: Tone.Filter
}

/**
 * Strong/weak asymmetry. A player's weak hand strikes with less force and
 * slightly less definition, and the strong hand leads the phrase — so the two
 * hands must not sound identical. Same approach as playStrum's up/down
 * differentiation (velocity 1.0 vs 0.6).
 */
const DJEMBE_VELOCITY: Record<DjembeHand, number> = { strong: 1, weak: 0.75 }

/** Weak-hand strikes land ~15 cents flat from the softer contact. */
const DJEMBE_WEAK_DETUNE = 0.991

const DJEMBE_STROKE_PITCH: Record<'bass' | 'tone', string> = {
  bass: 'C1',
  tone: 'G2',
}

// Live audio-scheduling stats for the debug overlay. Updated on every tap-driven
// sound so the overlay can show real per-tap numbers, not just theoretical ones.
export interface AudioDebugStats {
  tapCount: number
  lastTapPerfMs: number
  lastScheduleAheadMs: number
}

export interface UseAudioReturn {
  playDrum: (pad: DrumPad) => void
  playHandpan: (note: string) => void
  playStrum: (chord: string, direction: StrumDirection) => void
  playDjembe: (stroke: DjembeStroke, hand: DjembeHand) => void
  playMetronomeClick: (accent?: boolean) => void
  startAudioContext: () => Promise<void>
  isAudioReady: boolean
  audioDebugRef: React.RefObject<AudioDebugStats>
}

export function useAudio(): UseAudioReturn {
  const [isAudioReady, setIsAudioReady] = useState(false)
  const synthsRef = useRef<Synths | null>(null)
  const audioDebugRef = useRef<AudioDebugStats>({
    tapCount: 0,
    lastTapPerfMs: 0,
    lastScheduleAheadMs: 0,
  })

  // Record how far ahead of the audio clock a sound was scheduled (the audible
  // scheduling lag, driven by Tone's lookAhead). `scheduledTime` is a Tone.now() value.
  const recordTapDebug = useCallback((scheduledTime: number) => {
    const stats = audioDebugRef.current
    stats.tapCount += 1
    stats.lastTapPerfMs = performance.now()
    stats.lastScheduleAheadMs = (scheduledTime - Tone.getContext().currentTime) * 1000
  }, [])

  const createSynths = useCallback(async (): Promise<Synths> => {
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

    const reverb = new Tone.Reverb({ decay: 3, wet: 0.35 })
    reverb.toDestination()

    const handpan = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2.01,
      modulationIndex: 12,
      envelope: { attack: 0.08, decay: 1.5, sustain: 0.4, release: 2.5 },
      modulation: { type: 'sine' },
    }).connect(reverb)
    handpan.volume.value = -6

    const strumming = new Tone.Sampler({
      urls: {
        E2: 'E2.mp3',
        A2: 'A2.mp3',
        B2: 'B2.mp3',
        C3: 'C3.mp3',
        D3: 'D3.mp3',
        E3: 'E3.mp3',
        G3: 'G3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        D4: 'D4.mp3',
        E4: 'E4.mp3',
        G4: 'G4.mp3',
      },
      baseUrl: `${import.meta.env.BASE_URL}samples/guitar-acoustic/`,
      release: 0.5,
    }).toDestination()

    // Djembe: bass = full palm in the centre (low, resonant), tone = fingers
    // on the skin near the rim (mid, shorter), slap = fingertips at the rim
    // (sharp filtered noise). Reuses the drum-synth approach, no new samples.
    const djembeBass = new Tone.MembraneSynth({
      pitchDecay: 0.06,
      octaves: 5,
      envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.4 },
    }).toDestination()

    const djembeTone = new Tone.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 3,
      envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.15 },
    }).toDestination()

    const djembeSlapStrongFilter = new Tone.Filter(2200, 'highpass').toDestination()
    const djembeSlapStrong = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.09, sustain: 0, release: 0.05 },
    }).connect(djembeSlapStrongFilter)

    // Weak hand: lower cutoff = duller attack, shorter decay = less carry.
    const djembeSlapWeakFilter = new Tone.Filter(1500, 'highpass').toDestination()
    const djembeSlapWeak = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.04 },
    }).connect(djembeSlapWeakFilter)

    await Tone.loaded()

    return {
      kick,
      snare,
      hihat,
      tom1,
      tom2,
      metronome,
      handpan,
      reverb,
      strumming,
      djembeBass,
      djembeTone,
      djembeSlapStrong,
      djembeSlapStrongFilter,
      djembeSlapWeak,
      djembeSlapWeakFilter,
    }
  }, [])

  const startAudioContext = useCallback(async () => {
    if (synthsRef.current) return
    await Tone.start()
    synthsRef.current = await createSynths()
    setIsAudioReady(true)
  }, [createSynths])

  const playDrum = useCallback((pad: DrumPad) => {
    const synths = synthsRef.current
    if (!synths) return

    const now = Tone.now()
    recordTapDebug(now)
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
  }, [recordTapDebug])

  const playHandpan = useCallback((note: string) => {
    const synths = synthsRef.current
    if (!synths) return

    const now = Tone.now()
    recordTapDebug(now)
    synths.handpan.triggerAttackRelease(note, '0.8', now)
  }, [recordTapDebug])

  const playStrum = useCallback((chord: string, direction: StrumDirection) => {
    const synths = synthsRef.current
    if (!synths) return

    const voicing = getChord(chord)
    if (!voicing) return

    const isUp = direction === 'up'
    // Up-strum skips the lowest 1-2 bass strings (physical realism), but always leaves ≥3 notes.
    const bassesToSkip = isUp ? Math.min(2, Math.max(0, voicing.notes.length - 3)) : 0
    const sourceNotes = voicing.notes.slice(bassesToSkip)
    const notes = isUp ? [...sourceNotes].reverse() : sourceNotes

    const stagger = isUp ? 0.01 : 0.025
    const velocity = isUp ? 0.6 : 1

    const now = Tone.now()
    recordTapDebug(now)
    notes.forEach((note, i) => {
      synths.strumming.triggerAttackRelease(note, '2n', now + i * stagger, velocity)
    })
  }, [recordTapDebug])

  const playDjembe = useCallback((stroke: DjembeStroke, hand: DjembeHand) => {
    const synths = synthsRef.current
    if (!synths) return

    const now = Tone.now()
    recordTapDebug(now)
    const velocity = DJEMBE_VELOCITY[hand]

    if (stroke === 'slap') {
      const slap = hand === 'strong' ? synths.djembeSlapStrong : synths.djembeSlapWeak
      slap.triggerAttackRelease('16n', now, velocity)
      return
    }

    const synth = stroke === 'bass' ? synths.djembeBass : synths.djembeTone
    const hz = Tone.Frequency(DJEMBE_STROKE_PITCH[stroke]).toFrequency()
    const pitch = hand === 'weak' ? hz * DJEMBE_WEAK_DETUNE : hz
    synth.triggerAttackRelease(pitch, stroke === 'bass' ? '8n' : '16n', now, velocity)
  }, [recordTapDebug])

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
        synths.handpan.dispose()
        synths.reverb.dispose()
        synths.strumming.dispose()
        synths.djembeBass.dispose()
        synths.djembeTone.dispose()
        synths.djembeSlapStrong.dispose()
        synths.djembeSlapStrongFilter.dispose()
        synths.djembeSlapWeak.dispose()
        synths.djembeSlapWeakFilter.dispose()
        synthsRef.current = null
      }
    }
  }, [])

  return { playDrum, playHandpan, playStrum, playDjembe, playMetronomeClick, startAudioContext, isAudioReady, audioDebugRef }
}

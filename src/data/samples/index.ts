import type { DrumPad } from '@/types'

export const drumSamples: Record<DrumPad, string> = {
  kick: '/samples/drums/kick.wav',
  snare: '/samples/drums/snare.wav',
  hihat: '/samples/drums/hihat.wav',
  tom1: '/samples/drums/tom1.wav',
  tom2: '/samples/drums/tom2.wav',
}

export const handpanSamples: Record<string, string> = {
  C4: '/samples/handpan/C4.wav',
  D4: '/samples/handpan/D4.wav',
  E4: '/samples/handpan/E4.wav',
  F4: '/samples/handpan/F4.wav',
  G4: '/samples/handpan/G4.wav',
  A4: '/samples/handpan/A4.wav',
  B4: '/samples/handpan/B4.wav',
}

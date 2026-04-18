import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

function createMockSynth() {
  return {
    triggerAttackRelease: vi.fn(),
    toDestination: vi.fn().mockReturnThis(),
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    volume: { value: 0 },
  }
}

// Track created instances
let createdSynths: Record<string, ReturnType<typeof createMockSynth>[]>

function MockMembraneSynth(this: ReturnType<typeof createMockSynth>) {
  const synth = createMockSynth()
  Object.assign(this, synth)
  createdSynths.membrane.push(this)
  return this
}
MockMembraneSynth.prototype.toDestination = function () { return this }

function MockNoiseSynth(this: ReturnType<typeof createMockSynth>) {
  const synth = createMockSynth()
  Object.assign(this, synth)
  createdSynths.noise.push(this)
  return this
}
MockNoiseSynth.prototype.toDestination = function () { return this }

function MockMetalSynth(this: ReturnType<typeof createMockSynth>) {
  const synth = createMockSynth()
  Object.assign(this, synth)
  createdSynths.metal.push(this)
  return this
}
MockMetalSynth.prototype.toDestination = function () { return this }

function MockSynth(this: ReturnType<typeof createMockSynth>) {
  const synth = createMockSynth()
  Object.assign(this, synth)
  createdSynths.synth.push(this)
  return this
}
MockSynth.prototype.toDestination = function () { return this }

function MockReverb(this: ReturnType<typeof createMockSynth>) {
  const synth = createMockSynth()
  Object.assign(this, synth)
  createdSynths.reverb.push(this)
  return this
}
MockReverb.prototype.toDestination = function () { return this }

function MockPolySynth(this: ReturnType<typeof createMockSynth>) {
  const synth = createMockSynth()
  Object.assign(this, synth)
  createdSynths.polySynth.push(this)
  return this
}
MockPolySynth.prototype.connect = function () { return this }

// Mock FMSynth — used as argument to PolySynth, not constructed directly
function MockFMSynth() {}

function MockPluckSynth(this: ReturnType<typeof createMockSynth> & { triggerAttack: ReturnType<typeof vi.fn>; chain: ReturnType<typeof vi.fn> }) {
  const synth = createMockSynth()
  Object.assign(this, synth, { triggerAttack: vi.fn(), chain: vi.fn().mockReturnThis() })
  createdSynths.pluck.push(this)
  return this
}
MockPluckSynth.prototype.connect = function () { return this }

function MockEQ3(this: ReturnType<typeof createMockSynth> & { chain: ReturnType<typeof vi.fn> }) {
  const synth = createMockSynth()
  Object.assign(this, synth, { chain: vi.fn().mockReturnThis() })
  return this
}
MockEQ3.prototype.connect = function () { return this }

function MockChorus(this: ReturnType<typeof createMockSynth> & { start: ReturnType<typeof vi.fn> }) {
  const synth = createMockSynth()
  Object.assign(this, synth, { start: vi.fn().mockReturnThis() })
  return this
}
MockChorus.prototype.connect = function () { return this }

function MockCompressor(this: ReturnType<typeof createMockSynth>) {
  const synth = createMockSynth()
  Object.assign(this, synth)
  return this
}
MockCompressor.prototype.connect = function () { return this }

vi.mock('tone', () => ({
  start: vi.fn().mockResolvedValue(undefined),
  now: vi.fn().mockReturnValue(0),
  MembraneSynth: MockMembraneSynth,
  NoiseSynth: MockNoiseSynth,
  MetalSynth: MockMetalSynth,
  Synth: MockSynth,
  Reverb: MockReverb,
  PolySynth: MockPolySynth,
  FMSynth: MockFMSynth,
  PluckSynth: MockPluckSynth,
  EQ3: MockEQ3,
  Chorus: MockChorus,
  Compressor: MockCompressor,
}))

import { useAudio } from '../useAudio'
import * as Tone from 'tone'

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createdSynths = { membrane: [], noise: [], metal: [], synth: [], reverb: [], polySynth: [], pluck: [] }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with isAudioReady = false', () => {
    const { result } = renderHook(() => useAudio())
    expect(result.current.isAudioReady).toBe(false)
  })

  it('startAudioContext calls Tone.start() and sets isAudioReady', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      await result.current.startAudioContext()
    })

    expect(Tone.start).toHaveBeenCalledTimes(1)
    expect(result.current.isAudioReady).toBe(true)
  })

  it('startAudioContext is idempotent', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      await result.current.startAudioContext()
    })
    await act(async () => {
      await result.current.startAudioContext()
    })

    expect(Tone.start).toHaveBeenCalledTimes(1)
  })

  it('playDrum is no-op before startAudioContext', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playDrum('kick')
    })

    expect(createdSynths.membrane).toHaveLength(0)
  })

  it('playDrum("kick") triggers MembraneSynth after startAudioContext', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      await result.current.startAudioContext()
    })

    act(() => {
      result.current.playDrum('kick')
    })

    // First MembraneSynth instance is kick
    const kickInstance = createdSynths.membrane[0]
    expect(kickInstance.triggerAttackRelease).toHaveBeenCalledWith('C1', '8n', 0)
  })

  it('playDrum("snare") triggers NoiseSynth', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      await result.current.startAudioContext()
    })

    act(() => {
      result.current.playDrum('snare')
    })

    const snareInstance = createdSynths.noise[0]
    expect(snareInstance.triggerAttackRelease).toHaveBeenCalledWith('8n', 0)
  })

  it('playDrum("hihat") triggers MetalSynth', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      await result.current.startAudioContext()
    })

    act(() => {
      result.current.playDrum('hihat')
    })

    const hihatInstance = createdSynths.metal[0]
    expect(hihatInstance.triggerAttackRelease).toHaveBeenCalledWith('C4', '32n', 0)
  })

  it('playMetronomeClick uses different notes for accent', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      await result.current.startAudioContext()
    })

    const metronomeInstance = createdSynths.synth[0]

    act(() => {
      result.current.playMetronomeClick()
    })
    expect(metronomeInstance.triggerAttackRelease).toHaveBeenCalledWith('G4', '32n', 0)

    act(() => {
      result.current.playMetronomeClick(true)
    })
    expect(metronomeInstance.triggerAttackRelease).toHaveBeenCalledWith('C5', '32n', 0)
  })

  it('playMetronomeClick is no-op before startAudioContext', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playMetronomeClick()
    })

    expect(createdSynths.synth).toHaveLength(0)
  })

  it('playHandpan is no-op before startAudioContext', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playHandpan('D3')
    })

    expect(createdSynths.polySynth).toHaveLength(0)
  })

  it('playHandpan triggers PolySynth after startAudioContext', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      await result.current.startAudioContext()
    })

    act(() => {
      result.current.playHandpan('D3')
    })

    const handpanInstance = createdSynths.polySynth[0]
    expect(handpanInstance.triggerAttackRelease).toHaveBeenCalledWith('D3', '0.8', 0)
  })

  it('disposes synths on unmount', async () => {
    const { result, unmount } = renderHook(() => useAudio())

    await act(async () => {
      await result.current.startAudioContext()
    })

    const kickInstance = createdSynths.membrane[0]
    const snareInstance = createdSynths.noise[0]
    const hihatInstance = createdSynths.metal[0]
    const metronomeInstance = createdSynths.synth[0]
    const handpanInstance = createdSynths.polySynth[0]
    const reverbInstance = createdSynths.reverb[0]

    unmount()

    expect(kickInstance.dispose).toHaveBeenCalled()
    expect(snareInstance.dispose).toHaveBeenCalled()
    expect(hihatInstance.dispose).toHaveBeenCalled()
    expect(metronomeInstance.dispose).toHaveBeenCalled()
    expect(handpanInstance.dispose).toHaveBeenCalled()
    expect(reverbInstance.dispose).toHaveBeenCalled()
  })
})

# RhythmEx — Product Specification

## Overview
A browser-based rhythm practice app for young musicians (ages 5+). Users tap along to displayed beat patterns using virtual instruments and receive real-time timing feedback with star ratings.

## Target Users
Young practicing musicians, ages 5 and up. The UI must be simple, colorful, and touch-friendly.

## Tech Stack
- **Framework:** React 19 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4
- **Audio:** Tone.js
- **Deployment:** Static site (GitHub Pages or Netlify)
- **State persistence:** localStorage (no backend)

## MVP Features

### 1. Beat Display
- Visual grid/timeline showing the current rhythm pattern
- Clearly marks downbeats, subdivisions, and rests
- Animated playhead that scrolls/moves in time with the tempo
- Adjustable tempo (BPM slider, range ~40–200)

### 2. Tap Input
- Users tap along via keyboard (spacebar / specific keys) or touchscreen
- Each tap is timestamped and compared against the expected beat
- Works on desktop (keyboard) and mobile (touch)

### 3. Timing Feedback
- Real-time visual feedback on each tap: early, on-time, late
- Color-coded hits (e.g., green = on-time, yellow = slightly off, red = miss)
- Post-exercise summary with overall accuracy percentage

### 4. Star Ratings
- Each exercise attempt is rated 1–3 stars based on timing accuracy
- Thresholds (tunable): ★ = >50% on-time, ★★ = >75%, ★★★ = >90%
- Stars displayed prominently after each attempt
- Best score saved per exercise in localStorage

### 5. Virtual Instruments
- **Drums** — Kick, snare, hi-hat, toms (mapped to keyboard keys or on-screen pads)
- **Handpan** — Pitched notes in a circular layout (inspired by yishama.com virtual pantam)
- Instrument selection screen; user picks before starting an exercise
- High-quality samples loaded via Tone.js Sampler

### 6. Exercise Library
- Pre-built rhythm exercises organized by difficulty:
  - Beginner: quarter notes, half notes, whole notes
  - Intermediate: eighth notes, dotted rhythms, ties
  - Advanced: sixteenth notes, syncopation, odd time signatures
- Each exercise has: name, time signature, tempo, beat pattern data
- Exercises defined as JSON data (easy to add more later)

### 7. Responsive / Mobile-First UI
- Touch-friendly buttons and pads (min 44px tap targets)
- Works in portrait and landscape on phones/tablets
- Clean, colorful, kid-friendly design
- No login required — fully client-side

## Future Features (Post-MVP, in rough priority order)
1. **Guitar Hero mode** — Scrolling note highway for sight-reading practice
2. **Polyrhythm practice** — Two simultaneous rhythms, tap both hands
3. **Guitar/Ukulele strumming** — Strum pattern exercises with chord display
4. **Play known melodies** — Show lyrics + beat patterns for familiar songs
5. **YouTube integration** — Play YouTube videos, practice along
6. **Ear training** — Identify key, detect tempo from audio
7. **Auto beat detection** — Analyze YouTube audio for rhythm
8. **Music theory lessons** — Integrated theory reference

## Data Model (Exercise)
```json
{
  "id": "quarter-note-basics",
  "name": "Quarter Note Basics",
  "difficulty": "beginner",
  "timeSignature": [4, 4],
  "bpm": 80,
  "measures": 4,
  "beats": [
    { "time": "0:0:0", "duration": "4n", "note": "C4" },
    { "time": "0:1:0", "duration": "4n", "note": "C4" }
  ]
}
```

## Key UX Flows
1. **Home** → Pick instrument → Pick exercise → Practice → See results (stars)
2. **Practice screen**: Shows beat grid + playhead + instrument pads, tap to play
3. **Results screen**: Stars, accuracy %, option to retry or pick new exercise

## Implementation Status

### Phase 1 — Scaffolding & App Shell (Complete)
- Vite + React 19 + TypeScript project initialized
- Tailwind CSS v4 configured with `@tailwindcss/vite` plugin
- Vitest configured with jsdom environment
- `@/` path alias for clean imports
- All TypeScript types defined (`src/types/index.ts`)
- Exercise data: 7 exercises across 3 difficulty levels
- Utility functions with full test coverage: `rhythm.ts`, `scoring.ts`, `storage.ts`
- Shared UI components: `Button`, `Layout`, `Navigation`, `StarDisplay`
- 5 screens with state machine navigation in `App.tsx`
- Practice and Results screens are placeholder stubs

### Phase 2 — Beat Display & Practice UI (Complete)
- `BeatTimeline` component with color-coded beat markers and measure dividers
- Animated playhead via `requestAnimationFrame` in `useExercise` hook
- Exercise lifecycle: idle → countdown (3-2-1) → playing → done
- `CountdownOverlay` with full-screen 3-2-1-Go! display
- BPM +/- controls (adjustable in idle phase, range 40–200)
- 54 tests passing (42 existing + 12 new)

### Phase 3 — Tap Input & Timing Feedback (Complete)
- `useTiming` hook: tap-to-beat matching, stray tap filtering (>240ms ignored), finalize fills misses
- `TapZone` component: keyboard (Space), touch, and click input with 300ms judgment flash
- `BeatTimeline` enhanced with `beatJudgments` prop — markers turn green/yellow/red as tapped
- `PracticeScreen` wired with real scoring: `finalize()` → `calculateAccuracy()` → `calculateStars()`
- 74 tests passing (54 existing + 20 new)

### Phase 4 — Results & Scoring with Per-Instrument Persistence (Complete)
- `SavedScoreEntry` type with `attempts`, `totalAccuracy`, `instrument` fields for future summary stats
- Compound storage key `"exerciseId::instrument"` — scores independent per instrument
- `saveResult()` tracks attempt count and cumulative accuracy per instrument
- `getBestScore()` requires both `exerciseId` and `instrument`
- `getAllScores()` utility for future summary screens
- Full `ResultsScreen`: star display, accuracy %, tap breakdown bar (on-time/early/late/miss), "New Best!" badge, personal best comparison
- `ExerciseSelectScreen` shows per-instrument best scores
- 89 tests passing (74 existing + 15 new)

### Phase 5a — Audio Engine & Drums (Not Started)
- **Audio engine (`useAudio` hook):** Tone.js synths as default sound source (MembraneSynth for kick, NoiseSynth for snare, MetalSynth for hihat, etc.). Architecture supports swapping in real `.wav` samples later without changing the hook API.
- **Exercise data update:** Change `Beat.note` from generic note names (`"C4"`) to explicit drum pad names (`"kick"`, `"snare"`, `"hihat"`, `"tom1"`, `"tom2"`) across all 7 exercises.
- **Drum pad UI (`DrumPad` component):** Instrument-specific tap zone replacing the generic `TapZone` when instrument is drums. 4–5 on-screen pads (kick, snare, hihat, tom1, tom2), each plays its synth sound on tap. Keyboard shortcuts mapped to each pad.
- **Beat timeline color-coding:** Beats on the timeline are color-coded by drum type (e.g. kick = blue, snare = orange) so the player can see which drum to hit next.
- **Strict / Free mode toggle:** User-toggled on the practice screen settings popover.
  - **Free mode:** Any drum pad counts as a valid tap for timing scoring. Visual color-coding still shown as a learning aid.
  - **Strict mode:** Player must tap the correct drum pad. Wrong pad = miss.
- **Metronome:** Toggleable click track (default on). Ticks during the 3-2-1 countdown to help the player feel the tempo before the exercise starts.
- **Tap sound toggle:** Option to mute instrument sounds on tap (metronome and scoring still function).
- **Settings popover:** Gear icon button on the practice screen opens a small popover with toggles for: metronome on/off, tap sounds on/off, strict/free mode.
- **Scoring integration:** `useTiming` updated so in strict mode, each tap carries pad identity and `judgeTap` checks pad correctness in addition to timing.

### Phase 5b — Handpan & Circular Pad UI (Not Started)
- **Handpan synth:** Tone.js FM/AM synth voices tuned to handpan scale (7 notes, C4–B4). Swappable with real samples later.
- **Circular pad layout (`HandpanPad` component):** Instrument-specific tap zone replacing `TapZone` when instrument is handpan. 7–9 note pads arranged in a circle (center ding + surrounding tone fields), inspired by yishama.com virtual pantam. Each pad produces a distinct pitched tone.
- **Handpan exercises:** New exercises (or existing ones adapted) with note-specific beats for handpan.
- **Strict / Free mode (same toggle as drums):**
  - **Free mode:** Any pad counts as a valid tap. Different pads just produce different tones.
  - **Strict mode:** Player must tap the correct note pad as specified by the beat. Wrong pad = miss.
- **Beat timeline note indicators:** Timeline beats labeled or color-coded by target note for strict mode.

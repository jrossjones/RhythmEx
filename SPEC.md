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

### Phase 4 — Results & Scoring (Not Started)
- Wire real scoring into results screen
- localStorage persistence of best scores
- Star rating display with accuracy breakdown

### Phase 5 — Virtual Instruments & Audio (Not Started)
- Tone.js integration with sample loading
- Drum pad UI with keyboard mapping
- Handpan circular layout UI
- Audio sample playback on tap

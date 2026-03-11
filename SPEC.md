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
- **Drums** — Kick, snare, hi-hat, tom1, tom2 with Tone.js synth sounds (MembraneSynth, NoiseSynth, MetalSynth). On-screen pads with keyboard shortcuts (f/d/j/k/l). Adaptive grid layout based on exercise difficulty.
- **Handpan** — Pitched notes in a circular layout (inspired by yishama.com virtual pantam) — *not yet implemented*
- Instrument selection screen; user picks before starting an exercise
- Settings popover on practice screen: metronome toggle, tap sound toggle, strict/free mode

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
    { "time": "0:0:0", "duration": "4n", "note": "kick" },
    { "time": "0:1:0", "duration": "4n", "note": "snare" }
  ]
}
```
Note: `beat.note` uses drum pad names (`kick`, `snare`, `hihat`, `tom1`, `tom2`) for drum exercises.

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

### Phase 5a — Audio Engine & Drums (Complete)
- **Audio engine (`useAudio` hook):** Tone.js synths — MembraneSynth (kick/toms), NoiseSynth (snare), MetalSynth (hihat), triangle Synth (metronome). Lazy creation on `startAudioContext()` user gesture. Synths disposed on unmount.
- **Exercise data update:** `Beat.note` changed from `"C4"` to drum pad names (`"kick"`, `"snare"`, `"hihat"`, `"tom1"`, `"tom2"`). Beginner uses kick+snare, intermediate adds hihat, advanced adds toms.
- **Drum pad UI (`DrumPad` component):** Replaces `TapZone` when instrument is drums. Adaptive grid layout (2/3/5 pads). Keyboard shortcuts: f=kick, d=snare, j=hihat, k=tom1, l=tom2, Space=next expected pad. Color-coded pads with judgment flash feedback.
- **Beat timeline color-coding:** Drum beats color-coded by pad type (kick=red, snare=orange, hihat=cyan, tom1=purple, tom2=pink). Falls back to duration-based colors for non-drum instruments.
- **Strict / Free mode toggle:** Free mode (default) accepts any pad for timing-only scoring. Strict mode requires correct pad — wrong pad = miss with `expectedPad` tracked.
- **Metronome:** Toggleable click track (default on). Clicks on countdown ticks (3-2-1-Go) and during playing via RAF loop tracking beat crossings. Accent (C5) on downbeats, normal (G4) on other beats.
- **Tap sound toggle:** Mutes instrument sounds on tap while metronome and scoring still function.
- **Settings popover:** Gear icon button opens popover with 3 toggle switches: metronome on/off, tap sounds on/off, strict/free mode. Toggles disabled during active exercise.
- **Scoring integration:** `useTiming` accepts optional `pad` argument and `strictMode` option. Wrong pad in strict mode overrides judgment to miss. `TapResult` extended with `pad` and `expectedPad` fields.
- 129 tests passing (89 existing + 40 new)

### Phase 5b — Handpan & Circular Pad UI (Not Started)
- **Handpan synth:** Tone.js FM/AM synth voices tuned to handpan scale (7 notes, C4–B4). Swappable with real samples later.
- **Circular pad layout (`HandpanPad` component):** Instrument-specific tap zone replacing `TapZone` when instrument is handpan. 7–9 note pads arranged in a circle (center ding + surrounding tone fields), inspired by yishama.com virtual pantam. Each pad produces a distinct pitched tone.
- **Handpan exercises:** New exercises (or existing ones adapted) with note-specific beats for handpan.
- **Strict / Free mode (same toggle as drums):**
  - **Free mode:** Any pad counts as a valid tap. Different pads just produce different tones.
  - **Strict mode:** Player must tap the correct note pad as specified by the beat. Wrong pad = miss.
- **Beat timeline note indicators:** Timeline beats labeled or color-coded by target note for strict mode.

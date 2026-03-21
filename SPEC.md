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
- **Drums** — Kick, snare, hi-hat, tom1, tom2 with Tone.js synth sounds (MembraneSynth, NoiseSynth, MetalSynth). On-screen pads with keyboard shortcuts (f/d/j/k/l). Adaptive grid layout based on exercise difficulty. Multi-lane timeline.
- **Handpan** — Pitched FM synth notes in a circular pad layout (center ding + surrounding tone fields). 3 scale presets (D Kurd, C Amara, F Pygmy). Keyboard shortcuts (1–9 keys). Note-colored timeline markers. 9 exercises across 3 difficulty levels.
- **Strumming** — Guitar/ukulele strum patterns with chord display. Swipe zone (mobile) + arrow keys (desktop) for up/down strum direction — *not yet implemented*
- **Kalimba** — Thumb piano with pitched tines in a fan/arc layout. Tone.js plucked synth sound. Scale presets (C major, G major, etc.). Keyboard shortcuts for tines. Single-column timeline with note-colored markers (similar to handpan). — *not yet implemented*
- Instrument selection screen; user picks before starting an exercise
- Settings popover on practice screen: metronome toggle, tap sound toggle, strict/free mode, speed trainer, loop mode

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
1. **Strumming instrument** — Swipe/key-based strum input with chord progressions
2. **Free Play mode** — Open-ended instrument play without exercises or scoring
3. **Microphone input** — Real instrument detection (onset for drums, pitch for handpan, root note for guitar)
4. **Guitar Hero mode** — Scrolling note highway for sight-reading practice
5. **Polyrhythm practice** — Two simultaneous rhythms, tap both hands
6. **YouTube integration** — Play YouTube videos, practice along with embedded audio
7. **Custom exercises** — User-created exercises via a builder UI, saved to localStorage
8. **Ear training** — Identify key, detect tempo from audio
9. **Music theory lessons** — Integrated theory reference

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

Notes on `beat.note` by instrument:
- **Drums:** Pad names — `kick`, `snare`, `hihat`, `tom1`, `tom2`
- **Handpan:** Note names — `C4`, `D4`, `E4`, etc.
- **Kalimba:** Note names — `C4`, `E4`, `G4`, etc. (same convention as handpan)
- **Strumming:** Strum direction — `down`, `up`. Also includes `beat.chord` (e.g. `"G"`, `"Am"`) for chord progression exercises.

Strumming exercises may additionally include top-level `key` and `chords` fields.

## Key UX Flows
1. **Home** → Pick instrument → Pick exercise → Practice → See results (stars)
2. **Practice screen**: Shows beat grid + playhead + instrument pads, tap to play
3. **Results screen**: Stars, accuracy %, option to retry or pick new exercise
4. **Loop mode**: Practice → brief results flash → auto-restart (skip results screen)
5. **Speed trainer loop**: Practice → accuracy ≥95% → BPM +N → auto-restart
6. **Free Play**: Pick instrument → Free Play → open-ended play with optional metronome

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
- Exercise lifecycle: idle → countdown (4-3-2-1) → playing → done
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
- **Metronome:** Toggleable click track (default on). Clicks on countdown ticks (4-3-2-1) and during playing via RAF loop tracking beat crossings. Accent (C5) on downbeats, normal (G4) on other beats.
- **Tap sound toggle:** Mutes instrument sounds on tap while metronome and scoring still function.
- **Settings popover:** Gear icon button opens popover with 3 toggle switches: metronome on/off, tap sounds on/off, strict/free mode. Toggles disabled during active exercise.
- **Scoring integration:** `useTiming` accepts optional `pad` argument and `strictMode` option. Wrong pad in strict mode overrides judgment to miss. `TapResult` extended with `pad` and `expectedPad` fields.
- 129 tests passing (89 existing + 40 new)

### Phase 5a.1 — Multi-Lane Timeline, Scrolling, Speed Trainer (Complete)
- **Multi-lane beat timeline:** `BeatTimeline` refactored into orchestrator + `DrumLaneTimeline` (5 stacked lanes: hihat/tom1/tom2/snare/kick, 28px each) + `SingleRowTimeline` (backward compat for handpan). Shared constants in `timelineConstants.ts`. Fixed lane labels (HH/T1/T2/SN/KK) outside scroll area. Drum beat markers color-coded and placed in correct lanes.
- **Scrolling viewport:** GPU-accelerated `translateX` scrolling. `ResizeObserver` measures container width. Playhead pinned at ~30% from left. Short exercises use percentage positioning (no scroll). 60px per beat density.
- **Drum pad idle colors:** Disabled pads show muted versions of their color (e.g. `bg-red-200` for kick) instead of gray, so players associate pad and lane colors before starting.
- **Longer exercises:** "Extended Groove" (intermediate, 8 measures, 90 BPM, 32 beats) and "Endurance Run" (advanced, 16 measures, 85 BPM, 64 beats, all 5 pads).
- **Speed Trainer mode:** `speedTrainerOn` added to `PracticeSettings`. Toggle in `SettingsPopover`. On completion with ≥95% accuracy → next run at +5 BPM (capped at 200). Below 95% → same BPM. Manual BPM change resets speed trainer. "Speed Trainer" badge on practice screen. "Next: {bpm} BPM" hint on results screen. State held in `App.tsx`, reset on exercise select.
- **Tempo-aligned count-in:** Countdown ticks (4-3-2-1) use `msPerBeat(bpm)` intervals instead of fixed 1-second intervals, so the count-in matches the metronome tempo.
- **`useExercise` initialBpm:** Accepts optional `initialBpm` parameter for speed trainer BPM persistence across retries.
- 145 tests passing (129 existing + 16 new)

### Phase 5a.2 — Tap Placement Markers, Loop Mode, Speed Trainer Polish (Complete)
- **`TapMarker` type:** New interface `{ ms, pad?, judgment, expectedPad?, expectedMs? }` for recording tap positions on the timeline.
- **`PracticeSettings` extended:** Three new fields — `loopMode: boolean` (default false), `seamlessLoop: boolean` (default false), `speedTrainerStep: number` (default 5).
- **Tap marker collection (`useTiming`):** `tapMarkersRef` accumulates a `TapMarker` on each matched tap with exact ms, pad, judgment, expectedPad, and expectedMs. Stray taps (>240ms) produce no marker. Clears on `reset()`. Returns both `tapMarkers` (value, for render) and `tapMarkersRef`.
- **Tap marker rendering on timeline:** `BeatTimeline` accepts `tapMarkers` prop, converts each marker's ms to pixel/percent position, passes processed markers to child timelines. `DrumLaneTimeline` renders each as a 2px vertical tick line (full lane height) with opacity 0.7, color-coded by judgment (green/yellow/red), plus a 6px filled dot at lane center. Strict mode wrong-pad entries additionally render a hollow outline dot at the expected beat position in the expected pad's lane, border-colored by expected pad. `SingleRowTimeline` renders tick lines spanning full row height. Constants `TAP_MARKER_COLORS` and `DRUM_PAD_BORDER_COLORS` added to `timelineConstants.ts`.
- **`useExercise` restart method:** `restart(options?: { seamless?, newBpm? })` calls `cleanup()`, optionally sets new BPM, then either starts playing immediately (seamless) or runs a 4-3-2-1 countdown with timeline lead-in at the effective BPM. `tick` function refactored to use `durationMsRef` (updated via `useEffect`) to avoid stale closure on BPM changes during restart. All ref assignments moved to `useEffect` for lint compliance.
- **`ResultsOverlay` component:** Lightweight full-screen overlay (`fixed inset-0 z-50`) showing `StarDisplay`, accuracy %, optional "Next: {bpm} BPM" hint. Auto-dismisses after 2 seconds via `setTimeout(onDismiss, 2000)` with cleanup on unmount.
- **`SettingsPopover` updates:** Loop Mode toggle (5th toggle after Speed Trainer). When loop mode on: indented Seamless sub-toggle. When speed trainer on: row of +2 / +5 / +10 preset buttons below toggle, selected one highlighted in emerald. Step buttons are disabled during playing.
- **`PracticeScreen` orchestration:** Default settings include `loopMode`, `seamlessLoop`, `speedTrainerStep`. `handleDone` uses `speedTrainerStep` (not hardcoded 5) for BPM progression. Loop mode: saves result directly via `saveResult()`, stores `lastLoopResult`, shows `ResultsOverlay` (or seamless instant restart). Overlay dismissal triggers `reset()` + `restart({ newBpm })`. Stop during loop mode: if `lastLoopResult` exists, navigates to full results via `onShowResults` (no double-save). "Loop" badge displayed alongside Speed Trainer badge.
- **`App.tsx` update:** New `showResults(result)` function navigates to results screen without calling `saveResult`. Passed as `onShowResults` prop to `PracticeScreen`.
- 172 tests passing (145 existing + 27 new)

### Phase 5b — Handpan Instrument (Complete)
- **Handpan synth:** Tone.js `PolySynth(FMSynth)` with reverb (decay 3s, wet 0.35). Harmonicity 2.01, modulation index 12, warm envelope (attack 0.08s, decay 1.5s, sustain 0.4, release 2.5s). 800ms note duration. `playHandpan(note)` function exposed by `useAudio` hook.
- **Scale presets:** 3 handpan scales in `src/data/handpan/scales.ts`: D Kurd (9 notes), C Amara (8 notes), F Pygmy (9 notes). Default: D Kurd. Exercises reference scale via `exercise.scale` field.
- **Circular pad layout (`HandpanPad` component):** Center ding pad (64×64px) + surrounding tone field pads (52×52px) in circular arrangement. Supports up to 9 pads. Touch, click, and keyboard input (number keys 1–9, Space = next expected note). Color-coded by pitch class. Muted colors when disabled.
- **Handpan exercises:** 9 exercises (3 per difficulty), all D Kurd scale. Beginner: ding pulse, two-note melody, ascending scale. Intermediate: flowing eighths, dotted rhythms, 8-measure cascade. Advanced: sixteenth cascades, syncopation, 16-measure endurance flow.
- **Strict / Free mode:** Same toggle as drums. Free mode: any pad counts for timing-only. Strict mode: must tap correct note pad — wrong note = miss.
- **Beat timeline:** `SingleRowTimeline` with note-colored markers. Each pitch class gets a distinct color via `HANDPAN_NOTE_COLORS` map (12 chromatic colors).
- **Exercise data model:** `Exercise.instrument` field (`'drums' | 'handpan'`) added. `Exercise.scale` optional field for handpan scale preset ID. `exercisesByDifficulty()` accepts optional instrument filter. 18 total exercises (9 drums + 9 handpan).
- **Exercise selection filtering:** `ExerciseSelectScreen` filters exercises by selected instrument. Only shows exercises matching the current instrument.
- 215 tests passing (172 existing + 43 new)

### Pre-Phase 6 — Timeline Overhaul & Practice Improvements (Complete)
- **Vertical timeline:** Replaced horizontal scrolling timeline with a Guitar Hero-style vertical note highway. `VerticalTimeline` orchestrator delegates to `VerticalDrumTimeline` (N equal-width columns, one per active pad) or `VerticalSingleTimeline` (single column with angular horizontal offsets for handpan). Future beats appear at the top and drop down toward a hit line at 70% from top. Inverted Y coordinate system with top/bottom padding keeps the playhead pinned at the hit line for the full exercise. GPU-accelerated `translateY` scrolling, 80px per beat vertical density. Handpan ding note renders as a full-width horizontal line bar. Old horizontal components (`BeatTimeline`, `DrumLaneTimeline`, `SingleRowTimeline`) kept for rollback.
- **Shape-differentiated markers (`BeatMarker` component):** Reusable marker with six CSS-only shapes: kick=circle, snare=diamond (rotated 45deg), hihat=triangle (clip-path), tom1=square, tom2=rounded-rect. Handpan uses register-based shapes (low=circle, mid=diamond, high=triangle). Ding=line (full-width bar). 16px default size. Satisfies WCAG 1.4.1 (color + shape + label redundant encoding).
- **Text labels inside markers:** K/S/H/T1/T2 for drums, pitch class name (D, A, Bb, etc.) for handpan. White 8px bold text, centered. Diamond labels counter-rotated for readability.
- **Hollow/filled marker states:** Upcoming beats are solid filled. Judged beats transition to hollow outlines with `border-green-400` (on-time), `border-yellow-400` (early/late), `border-red-400` (miss) via `JUDGMENT_BORDER_COLORS`. Smooth `transition-colors duration-200`.
- **Listen/Demo mode:** "Listen" button in idle phase starts exercise with auto-fired beat sounds via RAF loop (`playDrum`/`playHandpan` at beat times). Countdown still plays. Pads visible but disabled. "Listening..." badge shown. On completion, resets to idle — no scoring, no results screen.
- **Tap debounce:** 40ms per-pad debounce in `useTiming` using `performance.now()` and `lastTapTimePerPadRef` map. Different pads are independent. Cleared on `reset()`. At 200 BPM, 16th notes are 75ms apart — safely above the 40ms threshold.
- **Handpan idle pad indicators:** Already implemented in Phase 5b. `HandpanPad` uses `HANDPAN_PAD_MUTED_COLORS` when disabled.
- 258 tests passing (215 existing + 43 new)

### Pre-Phase 6b — Timeline Lead-in, Outro Scroll, Learn Mode (Complete)
- **Timeline lead-in:** Replaced full-screen `CountdownOverlay` with an animated timeline lead-in. RAF starts during countdown with negative elapsed time (`startTimeRef = performance.now() + leadInMs`). `elapsedMs` starts at `-leadInMs` and reaches 0 when playing begins. `rawProgress` (unclamped, can be negative) passed to `VerticalTimeline` — empty runway scrolls, then beats approach the hit line. Small non-blocking countdown badge (4-3-2-1) overlaid in timeline corner. `CountdownOverlay.tsx` deleted.
- **Outro scroll:** After `elapsed >= durationMs`, `setPhase('done')` fires (stops taps), but RAF continues for one extra measure (`outroDurationMs`). `onDone` callback fires at `durationMs + outroDurationMs` after beats scroll past the hit line. Fixes seamless loop phase override — `setPhase('done')` before `onDone` means seamless restart's `setPhase('playing')` wins the React batch.
- **Idle timeline position:** In idle, timeline pre-positions at lead-in start (`idleProgress = -(LEAD_IN_BEATS * msPerBeat(bpm)) / durationMs`). No visual jump when Start is pressed — RAF starts from the same position.
- **Pads enabled during countdown:** Pads are visually active during countdown (both exercise and learn mode). Taps are silently ignored by `useTiming` since `phase !== 'playing'`.
- **Learn mode:** New "Learn" button alongside "Start" and "Listen". `useLearnMode` hook manages step-through state independently of `useExercise`. Phases: `idle → countdown → active → done`. Countdown uses same 4-beat lead-in with RAF animation (negative progress scrolling to beat 0), metronome clicks, and countdown badge. During active phase, correct taps trigger smooth ease-out animation to the next beat position (tween duration = `msPerBeat(bpm)`). Wrong pad flashes red for 400ms. "Learning" badge shown. Auto-resets to idle after 600ms on completion. No scoring, no results screen.
- **`useExercise.ts` changes:** Added `phaseDoneFiredRef`, `onDoneFiredRef`, `outroDurationMsRef` refs. Exported `LEAD_IN_BEATS = 4`. `rawProgress` export (unclamped). `progress` stays clamped `[0, 1]`.
- **New file: `src/hooks/useLearnMode.ts`** — Learn mode hook with countdown + step-through logic.
- **New file: `src/hooks/__tests__/useLearnMode.test.ts`** — 12 tests covering learn mode lifecycle.
- 274 tests passing (258 existing + 16 new)

### Phase 6 — Strumming Instrument (Not Started)

#### Overview
A new instrument type (`strumming`) for practicing guitar/ukulele strum patterns. Supports both pattern-only exercises (single chord, focus on rhythm) and chord progression exercises (chord changes at specific beats). Follows the same architecture as drums and handpan: dedicated pad component, audio engine extension, vertical timeline integration, 9 exercises across 3 difficulty levels, and full demo/learn/strict mode support.

#### Type system changes (`src/types/index.ts`)
- **`InstrumentType`:** Extend to `'drums' | 'handpan' | 'strumming'`.
- **`StrumDirection`:** New exported type alias `'down' | 'up'`.
- **`Beat` interface:** Add optional `chord?: string` field (e.g. `"G"`, `"Am"`). Used by strumming exercises.
- **`Exercise` interface:** Add optional `key?: string` (e.g. `"G"`) and `chords?: string[]` (e.g. `["G", "C", "D", "Em"]`). Used by strumming exercises.

#### Strum input (`src/components/instruments/StrumZone.tsx`)
- **Props:** `onTap(direction: StrumDirection)`, `lastFeedback: TimingJudgment | null`, `lastFeedbackPad: string | null`, `disabled: boolean`, `currentChord?: string`, `nextExpectedDirection?: StrumDirection | null`.
- **Mobile:** Two large stacked tap buttons — top button for downstrum (↓ label), bottom button for upstrum (↑ label). Minimum 64px height each. `onTouchStart` for low-latency input (same pattern as `DrumPad`/`HandpanPad`). Swipe detection deferred to a future enhancement.
- **Desktop keyboard:** ArrowDown = downstrum, ArrowUp = upstrum, Space = next expected direction (falls back to `'down'`). Same `useRef` pattern for `onTap`/`disabled`/`nextExpectedDirection`. Same `useEffect` keydown listener with `e.repeat` guard.
- **Color-coding:** Down = `bg-blue-400` (active) / `bg-blue-200` (muted/disabled). Up = `bg-amber-400` (active) / `bg-amber-200` (muted/disabled). Judgment feedback: same flash system as drums/handpan (green=on-time, yellow=early/late, red=miss), auto-clears after 300ms.
- **Chord display:** When `currentChord` is provided, show the chord name prominently above the strum buttons (large bold text, e.g. "G" or "Am"). Updates when chord changes.

#### Chord data (`src/data/chords.ts`)
- **`ChordVoicing` type:**
  ```ts
  export interface ChordVoicing {
    name: string         // e.g. "G", "Am", "C"
    notes: string[]      // e.g. ["G2", "B2", "D3", "G3", "B3", "G4"]
  }
  ```
- **Initial chord set (open position guitar voicings):**
  - `G` — `["G2", "B2", "D3", "G3", "B3", "G4"]`
  - `C` — `["C3", "E3", "G3", "C4", "E4"]`
  - `D` — `["D3", "A3", "D4", "F#4"]`
  - `Em` — `["E2", "B2", "E3", "G3", "B3", "E4"]`
  - `Am` — `["A2", "E3", "A3", "C4", "E4"]`
  - `A` — `["A2", "E3", "A3", "C#4", "E4"]`
  - `E` — `["E2", "B2", "E3", "G#3", "B3", "E4"]`
  - `D7` — `["D3", "A3", "C4", "F#4"]`
- **Exports:** `chordVoicings: ChordVoicing[]`, `getChord(name: string): ChordVoicing | undefined`.

#### Audio engine extension (`src/hooks/useAudio.ts`)
- **Synth:** Tone.js `PolySynth` wrapping `PluckSynth` for polyphonic strum sound. Connected to a short reverb (`decay: 1.5, wet: 0.2`). Created lazily alongside existing synths in `createSynths()`. Disposed on unmount.
- **`playStrum(chord: string, direction: StrumDirection)`:** Looks up `ChordVoicing` via `getChord()`. Triggers notes in sequence with ~20ms stagger. Downstrum: low-to-high (array order). Upstrum: high-to-low (reversed). Each note triggered with `triggerAttackRelease(note, 0.8, time)` where `time = Tone.now() + i * 0.02`.

#### Exercise data model
```json
{
  "id": "basic-down-strum",
  "name": "Basic Down Strum",
  "difficulty": "beginner",
  "instrument": "strumming",
  "timeSignature": [4, 4],
  "bpm": 80,
  "measures": 4,
  "key": "G",
  "chords": ["G"],
  "beats": [
    { "time": "0:0:0", "duration": "4n", "note": "down", "chord": "G" },
    { "time": "0:1:0", "duration": "4n", "note": "down", "chord": "G" }
  ]
}
```
- `beat.note`: `"down"` or `"up"` for strum direction.
- `beat.chord`: which chord is active at that beat (required for all strumming beats).
- Top-level `key`: exercise key. `chords`: array of all unique chords used.

#### Exercise files (9 exercises, 3 per difficulty)
- **`src/data/exercises/strumming-beginner.ts`** (`strummingBeginnerExercises`):
  1. **"Basic Down Strum"** — 4 measures, 80 BPM, G only, all quarter-note downstrums (16 beats).
  2. **"Down-Up Intro"** — 4 measures, 75 BPM, C only, alternating down-up quarter notes (16 beats).
  3. **"Easy Strum Pattern"** — 4 measures, 70 BPM, G only, "D-D-U-U-D-U" pattern per measure using mixed quarter/eighth notes (24 beats).

- **`src/data/exercises/strumming-intermediate.ts`** (`strummingIntermediateExercises`):
  1. **"Two-Chord Switch"** — 4 measures, 85 BPM, G→C (change every 2 measures), steady down-up eighth-note pattern.
  2. **"Four-Chord Song"** — 4 measures, 80 BPM, G-D-Em-C (one per measure), D-D-U-U-D-U per measure.
  3. **"Strum Marathon"** — 8 measures, 85 BPM, G-C-D-Em repeating, steady eighth-note down-up.

- **`src/data/exercises/strumming-advanced.ts`** (`strummingAdvancedExercises`):
  1. **"Syncopated Strum"** — 4 measures, 90 BPM, G-Am-C-D, syncopated pattern with offbeat upstrums.
  2. **"Quick Changes"** — 4 measures, 100 BPM, chord changes every 2 beats, mixed strum pattern.
  3. **"Endurance Strum"** — 16 measures, 90 BPM, cycling G-C-D-Em-Am-E, D-D-U-U-D-U with variations.

- **`src/data/exercises/index.ts`:** Import and aggregate strumming exercises. Total: 27 (9 drums + 9 handpan + 9 strumming).

#### Utility functions (`src/utils/rhythm.ts`)
- **`exerciseChords(exercise: Exercise): string[]`** — Deduplicated array of `beat.chord` values. Same pattern as `exerciseDrumPads()`.

#### Timeline constants (`src/components/practice/timelineConstants.ts`)
- **`STRUM_DIRECTION_COLORS`:** `{ down: 'bg-blue-400', up: 'bg-amber-400' }`.
- **`STRUM_DIRECTION_MUTED_COLORS`:** `{ down: 'bg-blue-200', up: 'bg-amber-200' }`.
- **`STRUM_DIRECTION_LABELS`:** `{ down: '↓', up: '↑' }`.
- **`STRUM_COLUMN_WIDTH`:** `120` px.
- Strumming uses `triangle` marker shape with rotation: down = 180deg (points down), up = 0deg (points up).

#### BeatMarker extension (`src/components/practice/BeatMarker.tsx`)
- Add optional `rotation?: number` prop. Applied as CSS `transform: rotate(Xdeg)` on the marker container. Labels counter-rotate to stay upright. Default: `undefined` (no rotation).

#### VerticalStrumTimeline (`src/components/practice/VerticalStrumTimeline.tsx`)
- New component. Single centered column (120px wide). Markers centered, no angular offsets.
- **Chord change annotations:** When `beat.chord` differs from the previous beat's chord (or is the first beat), render a chord name label to the left of the column at that Y position. Small pill badge styling.
- **Props:** Same interface pattern as other vertical timelines: `markers`, `measureLines`, `scrollOffset`, `hitLineY`, `renderedHeight`, `tapMarkers`, `containerHeight`, plus `chordChanges: { beatIndex: number; chord: string; yPosition: number }[]`.

#### VerticalTimeline orchestrator (`src/components/practice/VerticalTimeline.tsx`)
- Add `isStrumming = instrument === 'strumming'` check.
- Build strumming markers using `STRUM_DIRECTION_COLORS`, `triangle` shape with rotation, `STRUM_DIRECTION_LABELS`.
- Compute `chordChanges` array from exercise beats.
- Route to `VerticalStrumTimeline` when strumming.

#### PracticeScreen integration (`src/components/screens/PracticeScreen.tsx`)
- **`handleStrumTap(direction)`:** Same pattern as `handleDrumTap`/`handleHandpanTap`. Calls `recordLearnTap(direction)` in learn mode, `recordTap(direction)` in normal mode. Plays `playStrum(currentChord, direction)` when tap sounds enabled.
- **Current chord:** Derived from next unjudged beat's `chord` field. Passed to `StrumZone` and `playStrum`.
- **Next expected direction:** Derived from next unjudged beat's `note` field. Passed to `StrumZone`.
- **Conditional render:** `instrument === 'strumming' ? <StrumZone ... /> : ...`
- **Demo mode:** Add strum branch to RAF auto-fire loop, calling `playStrum(beat.chord, beat.note)` at beat times.

#### Learn mode
- Fully compatible with `useLearnMode` hook. No hook changes needed.
- `recordLearnTap(direction)` compares direction against `exercise.beats[idx].note` — same string comparison pattern as handpan notes.

#### Strict / Free mode
- **Free mode (default):** Any strum direction accepted; timing-only scoring.
- **Strict mode:** Must match direction. Existing `useTiming` logic already compares `pad !== expectedNote` generically — no changes needed.

#### Speed trainer, loop mode, settings
- All existing settings work automatically. No changes to `SettingsPopover` or `PracticeSettings`.

#### Score storage
- Compound key `"exerciseId::strumming"` — works automatically via existing storage functions.

#### InstrumentSelectScreen (`src/components/screens/InstrumentSelectScreen.tsx`)
- Add strumming card: `{ type: 'strumming', label: 'Strumming', emoji: '🎸', color: 'from-blue-400 to-indigo-500' }`.
- Grid: 3 cards. Keep `sm:grid-cols-2` (two top, one centered below). Revisit layout when kalimba is added.

#### New files
| File | Purpose |
|---|---|
| `src/components/instruments/StrumZone.tsx` | Strum input (down/up buttons, keyboard, chord display) |
| `src/data/chords.ts` | Chord voicing data + lookup |
| `src/data/exercises/strumming-beginner.ts` | 3 beginner exercises |
| `src/data/exercises/strumming-intermediate.ts` | 3 intermediate exercises |
| `src/data/exercises/strumming-advanced.ts` | 3 advanced exercises |
| `src/components/practice/VerticalStrumTimeline.tsx` | Vertical timeline with chord annotations |
| `src/components/instruments/__tests__/StrumZone.test.tsx` | StrumZone tests |
| `src/data/chords/__tests__/chords.test.ts` | Chord data tests |
| `src/components/practice/__tests__/VerticalStrumTimeline.test.tsx` | Strum timeline tests |

#### Modified files
| File | Changes |
|---|---|
| `src/types/index.ts` | Add `'strumming'` to `InstrumentType`, `StrumDirection` type, `chord?` to `Beat`, `key?`/`chords?` to `Exercise` |
| `src/hooks/useAudio.ts` | Add `PolySynth(PluckSynth)` + reverb, `playStrum()`, disposal |
| `src/components/screens/PracticeScreen.tsx` | StrumZone branch, `handleStrumTap`, chord derivation, demo mode strum branch |
| `src/components/screens/InstrumentSelectScreen.tsx` | Add strumming card |
| `src/components/practice/VerticalTimeline.tsx` | Strumming marker logic, route to VerticalStrumTimeline |
| `src/components/practice/timelineConstants.ts` | Strum color/label/shape constants |
| `src/components/practice/BeatMarker.tsx` | Add `rotation` prop |
| `src/data/exercises/index.ts` | Aggregate strumming exercises (total: 27) |
| `src/utils/rhythm.ts` | Add `exerciseChords()` |

#### Test expectations
- StrumZone: button rendering, tap callbacks, keyboard shortcuts (ArrowDown/Up/Space), repeat guard, disabled state, feedback flash, chord display.
- Chord data: voicing count, lookup, unknown chord returns undefined.
- VerticalStrumTimeline: marker rendering, chord labels, hit line, scroll offset.
- Updated: exercise index (27 total), useAudio (playStrum), rhythm utils (exerciseChords).

### Phase 7 — Free Play Mode (Not Started)

#### Overview
A dedicated screen for open-ended instrument play without exercises, timelines, or scoring. Accessible from the exercise select screen as a "Free Play" option.

#### Navigation
- **Entry point:** "Free Play" button on the `ExerciseSelectScreen`, displayed prominently above/below the exercise list.
- **Screen:** New `FreePlayScreen.tsx` in `src/components/screens/`.
- **App state:** New screen type `'free-play'` added to the `Screen` union. `AppState` carries `selectedInstrument` to the free play screen.

#### Features
- **Instrument pads:** The full instrument UI (`DrumPad`, `HandpanPad`, or `StrumZone`) rendered without a timeline or scoring system.
- **Optional metronome:** Metronome toggle + BPM controls available. Player can set a tempo and play along to clicks without any exercise structure.
- **No scoring:** No timing judgments, no stars, no results. Pure play.
- **Drum customization:** Pad count selector (2, 3, or 5 pads). 2 pads = kick + snare, 3 = kick + snare + hihat, 5 = all. Reuses the existing adaptive grid layout from `DrumPad`. Persisted in localStorage. Default: 5 (all pads).
- **Handpan customization:** Scale/key selector (choose from presets: D Kurd, C Amara, F Pygmy, etc.) and note count selector (e.g., play with 5, 7, or all 9 notes). Fewer notes simplifies the pad layout for younger players or beginners exploring the instrument. Selected scale and note count persist in localStorage. Default: D Kurd, all notes.
- **YouTube integration (future):** This screen is the natural home for embedded YouTube video playback. A future enhancement would add a URL input field and an embedded YouTube player, allowing the player to play along with any video. The instrument pads + optional metronome would overlay or sit below the video.

### Phase 8 — Microphone Input (Not Started)

#### Overview
Replace screen tapping with real instrument audio detection via the browser's `getUserMedia` API and Web Audio API analysis. Each instrument type has a different detection strategy.

#### Drums — Onset detection
- **Approach:** Web Audio API `AnalyserNode` monitoring amplitude. When the signal exceeds a configurable threshold and the previous frame was below it, register a tap event.
- **Debounce:** Minimum 50ms between detected onsets to avoid double-triggers from reverb/sustain.
- **Output:** Each detected onset fires the same `recordTap()` callback used by the virtual pads. In free mode, it maps to a generic tap. In strict mode, onset detection alone cannot identify which drum was hit — all onsets map to the "next expected pad" (same as the Space key behavior).
- **Sensitivity control:** A sensitivity slider in settings (maps to the amplitude threshold). Default tuned for close-mic'd practice pad hits.
- **Fallback:** Virtual pads remain visible and functional alongside mic input. The player can mix mic + tapping.

#### Handpan — Pitch detection
- **Approach:** Autocorrelation-based pitch detection on the Web Audio API `AnalyserNode` time-domain data. Detect the fundamental frequency of each struck note and map it to the nearest handpan pad note.
- **Note mapping:** The detected frequency is compared against the handpan's configured scale (e.g. D3, A3, Bb3, C4, D4, E4, F4, A4). Closest match within a ±50 cent tolerance is accepted.
- **Onset + pitch:** First detect an onset (amplitude spike), then within a short window (~30ms) analyze pitch. This avoids continuous pitch tracking and reduces CPU usage.
- **Strict mode:** With pitch detection, strict mode becomes meaningful with a real handpan — the app can verify the player hit the correct note.
- **Fallback:** Virtual pads still work alongside mic input.

#### Guitar — Root note detection (start simple, upgrade later)
- **Phase 1 — Root note detection:** After detecting a strum onset, use autocorrelation or FFT to identify the fundamental frequency of the chord. Map to the nearest note name (e.g. "E", "A", "G"). Compare against the exercise's expected chord root. This verifies the player is playing roughly the right chord but cannot distinguish major from minor or detect extensions.
- **Phase 2 (future) — ML chord classification:** Train or use a pre-trained small model (TensorFlow.js or ONNX runtime) on guitar chord spectrograms. Input: short FFT window after strum onset. Output: chord label (Am, C, G, D, Em, etc.). More accurate than root-only but adds a model dependency (~1–5MB). This is a future enhancement once root detection proves insufficient.
- **Strum direction:** Not detected from audio (extremely unreliable). Direction still comes from swipe/key input even when mic is active. If the player uses mic only, strum direction scoring is disabled (timing-only).

#### Shared infrastructure
- **`useMicrophone` hook:** Manages `getUserMedia` permission, `AudioContext` + `AnalyserNode` setup, and per-frame analysis in a `requestAnimationFrame` loop. Exposes `startMic()`, `stopMic()`, `isListening`, and an `onOnset` callback.
- **Permission UX:** A "Use Microphone" button appears in settings when available. First click triggers browser permission prompt. State persisted in settings so the mic auto-connects on subsequent sessions.
- **`useOnsetDetector` hook:** Wraps amplitude threshold logic. Configurable threshold and debounce.
- **`usePitchDetector` hook:** Wraps autocorrelation pitch detection. Returns detected frequency and nearest note name.
- **Settings:** New `micEnabled` boolean in `PracticeSettings`. When on, mic input runs alongside virtual pads. A sensitivity slider (0–100) maps to the onset threshold.

### Phase 9 — Kalimba Instrument (Not Started)

#### Overview
A new instrument type (`kalimba`) for practicing thumb piano patterns. The kalimba is a popular beginner-friendly melodic percussion instrument with a distinctive plucked tone.

#### Kalimba input
- **Mobile/Desktop:** On-screen tine layout — a fan/arc arrangement of tines (like a real kalimba, alternating left/right from center). Tap or click to play.
- **Keyboard:** Number keys and letter keys mapped to tines (e.g., 1–9 for 9-tine kalimba, or extended mapping for 17 tines).
- **Component:** `KalimbaPad.tsx` in `src/components/instruments/`.

#### Kalimba synth
- **Audio:** Tone.js `PluckSynth` or tuned `FMSynth` configured for the bright, bell-like kalimba timbre. Short attack, medium sustain, gentle decay.
- **Scale presets:** Common kalimba tunings — C major (17 notes), G major, pentatonic subsets. Stored in `src/data/kalimba/scales.ts`.
- **Note layout:** Tines arranged low-to-high alternating left-right from center (matching real kalimba ergonomics). Center tine is the root note.

#### Exercise data model
- `beat.note` uses note names (e.g., `"C4"`, `"E4"`, `"G4"`) — same convention as handpan.
- `exercise.instrument = 'kalimba'`, `exercise.scale` references a kalimba scale preset.
- Exercises organized by difficulty: beginner (simple melodies, few tines), intermediate (wider range, eighth notes), advanced (fast runs, full range).

#### Beat timeline
- Single-column layout (like handpan) with note-colored markers.
- Marker colors use the same `HANDPAN_NOTE_COLORS` chromatic color map.
- Marker shapes based on octave register (low=circle, mid=diamond, high=triangle).

#### Strict / Free mode
- **Free mode:** Any tine tap counts for timing-only scoring.
- **Strict mode:** Must tap the correct tine — wrong note = miss.

### Future Phases (Not Yet Planned in Detail)

#### Guitar Hero mode enhancements
The vertical timeline (Pre-Phase 6) already implements the core Guitar Hero-style note highway. Future enhancements: approach animations (osu!-style shrinking rings on next beat), colorblind mode toggle, column-to-pad visual alignment refinements, and sight-reading exercises with note patterns the player hasn't seen before.

#### Polyrhythm practice
Two simultaneous rhythm patterns, one per hand. Split the screen into left/right tap zones. Each zone has its own beat pattern and timeline. Scoring evaluates both hands independently. Useful for advanced drummers and percussionists.

#### YouTube integration
Embed a YouTube video player on the Free Play screen. Player enters a URL, video plays, and they play along using the instrument pads. Optional: sync metronome to video BPM (manual input or auto-detection). Auto beat detection via Web Audio API analysis of the video's audio stream (complex — requires `captureStream()` or `AudioContext.createMediaElementSource()`).

#### Custom exercises
User-created exercises via a builder UI. The `Exercise` JSON data model already supports this. Builder would provide: measure count selector, BPM picker, beat grid editor (click to place/remove beats), instrument/pad selector per beat. Saved to localStorage. Shareable via JSON export/import or URL encoding.

#### Ear training
Identify musical elements by ear: key detection, interval recognition, tempo identification. Could use Tone.js to generate audio prompts and the scoring system to evaluate responses.

#### Music theory lessons
Integrated reference material: note values, time signatures, rhythm notation. Could be a static content section or interactive mini-lessons.

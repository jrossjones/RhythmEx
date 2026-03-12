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

### Phase 5a.1 — Multi-Lane Timeline, Scrolling, Speed Trainer (Complete)
- **Multi-lane beat timeline:** `BeatTimeline` refactored into orchestrator + `DrumLaneTimeline` (5 stacked lanes: hihat/tom1/tom2/snare/kick, 28px each) + `SingleRowTimeline` (backward compat for handpan). Shared constants in `timelineConstants.ts`. Fixed lane labels (HH/T1/T2/SN/KK) outside scroll area. Drum beat markers color-coded and placed in correct lanes.
- **Scrolling viewport:** GPU-accelerated `translateX` scrolling. `ResizeObserver` measures container width. Playhead pinned at ~30% from left. Short exercises use percentage positioning (no scroll). 60px per beat density.
- **Drum pad idle colors:** Disabled pads show muted versions of their color (e.g. `bg-red-200` for kick) instead of gray, so players associate pad and lane colors before starting.
- **Longer exercises:** "Extended Groove" (intermediate, 8 measures, 90 BPM, 32 beats) and "Endurance Run" (advanced, 16 measures, 85 BPM, 64 beats, all 5 pads).
- **Speed Trainer mode:** `speedTrainerOn` added to `PracticeSettings`. Toggle in `SettingsPopover`. On completion with ≥95% accuracy → next run at +5 BPM (capped at 200). Below 95% → same BPM. Manual BPM change resets speed trainer. "Speed Trainer" badge on practice screen. "Next: {bpm} BPM" hint on results screen. State held in `App.tsx`, reset on exercise select.
- **Tempo-aligned count-in:** Countdown ticks (3-2-1-Go) now use `msPerBeat(bpm)` intervals instead of fixed 1-second intervals, so the count-in matches the metronome tempo.
- **`useExercise` initialBpm:** Accepts optional `initialBpm` parameter for speed trainer BPM persistence across retries.
- 145 tests passing (129 existing + 16 new)

### Phase 5a.2 — Tap Placement Markers, Loop Mode, Speed Trainer Polish (Complete)
- **`TapMarker` type:** New interface `{ ms, pad?, judgment, expectedPad?, expectedMs? }` for recording tap positions on the timeline.
- **`PracticeSettings` extended:** Three new fields — `loopMode: boolean` (default false), `seamlessLoop: boolean` (default false), `speedTrainerStep: number` (default 5).
- **Tap marker collection (`useTiming`):** `tapMarkersRef` accumulates a `TapMarker` on each matched tap with exact ms, pad, judgment, expectedPad, and expectedMs. Stray taps (>240ms) produce no marker. Clears on `reset()`. Returns both `tapMarkers` (value, for render) and `tapMarkersRef`.
- **Tap marker rendering on timeline:** `BeatTimeline` accepts `tapMarkers` prop, converts each marker's ms to pixel/percent position, passes processed markers to child timelines. `DrumLaneTimeline` renders each as a 2px vertical tick line (full lane height) with opacity 0.7, color-coded by judgment (green/yellow/red), plus a 6px filled dot at lane center. Strict mode wrong-pad entries additionally render a hollow outline dot at the expected beat position in the expected pad's lane, border-colored by expected pad. `SingleRowTimeline` renders tick lines spanning full row height. Constants `TAP_MARKER_COLORS` and `DRUM_PAD_BORDER_COLORS` added to `timelineConstants.ts`.
- **`useExercise` restart method:** `restart(options?: { seamless?, newBpm? })` calls `cleanup()`, optionally sets new BPM, then either starts playing immediately (seamless) or runs a 3-2-1 countdown at the effective BPM. `tick` function refactored to use `durationMsRef` (updated via `useEffect`) to avoid stale closure on BPM changes during restart. All ref assignments moved to `useEffect` for lint compliance.
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

### Phase 6 — Strumming Instrument (Not Started)

#### Overview
A new instrument type (`strumming`) for practicing guitar/ukulele strum patterns. Supports both pattern-only exercises (single chord, focus on rhythm) and chord progression exercises (chord changes at specific beats).

#### Strum input
- **Mobile:** A tall vertical swipe zone. Swipe down = downstrum, swipe up = upstrum. Fallback tap buttons (↓ and ↑) visible below the swipe zone for younger players or accessibility.
- **Desktop:** Down arrow key = downstrum, Up arrow key = upstrum.
- **Auto-detect:** The component detects whether the user is swiping or tapping and adapts. Both interaction styles always available simultaneously.
- **Component:** `StrumZone.tsx` in `src/components/instruments/`.

#### Strum synth
- **Audio:** Tone.js `PluckSynth` or `PolySynth` configured to strum chord voicings. Downstrum plays notes low-to-high in rapid succession (~20ms per string). Upstrum plays high-to-low.
- **Chord voicings:** A chord library mapping chord names (e.g. `"G"`, `"Am"`, `"C"`) to arrays of frequencies/notes. Stored in `src/data/chords.ts`.
- **Key selection:** Exercises specify a key. The chord library provides voicings relative to the key.

#### Exercise data model extension
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
- `beat.note` is `"down"` or `"up"` for strum direction.
- `beat.chord` specifies which chord is active at that beat.
- Single-chord exercises omit `beat.chord` (uses the first entry in `chords`).
- Chord progression exercises include `beat.chord` to indicate chord changes.

#### Exercise types
- **Pattern-only (beginner):** Single chord, practice strum patterns. E.g. "Down-Down-Up-Up-Down-Up" on G.
- **Chord progressions (intermediate+):** Chord changes at measure boundaries. E.g. "G - D - Em - C" with a consistent strum pattern.
- **Mixed patterns (advanced):** Chord changes mid-measure, varied strum patterns per chord.

#### Beat timeline for strumming
- Single-row layout (like handpan).
- Markers show strum direction: ↓ for downstrum, ↑ for upstrum.
- Chord name displayed above the timeline at chord change positions.
- Color-coded: downstrum = one color, upstrum = another.

#### Strict / Free mode
- **Free mode:** Any strum direction counts. Timing-only scoring.
- **Strict mode:** Must match strum direction (down/up). Wrong direction = miss.

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

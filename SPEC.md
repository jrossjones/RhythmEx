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
- **Handpan** — Pitched notes in a circular layout (inspired by yishama.com virtual pantam) — *not yet implemented*
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
1. **Tap placement markers** — Show exactly where each tap landed on the timeline
2. **Loop mode & speed trainer auto-restart** — Infinite looping with configurable BPM stepping
3. **Handpan instrument** — Circular pad layout with pitched FM synth voices
4. **Strumming instrument** — Swipe/key-based strum input with chord progressions
5. **Free Play mode** — Open-ended instrument play without exercises or scoring
6. **Microphone input** — Real instrument detection (onset for drums, pitch for handpan, root note for guitar)
7. **Guitar Hero mode** — Scrolling note highway for sight-reading practice
8. **Polyrhythm practice** — Two simultaneous rhythms, tap both hands
9. **YouTube integration** — Play YouTube videos, practice along with embedded audio
10. **Custom exercises** — User-created exercises via a builder UI, saved to localStorage
11. **Ear training** — Identify key, detect tempo from audio
12. **Music theory lessons** — Integrated theory reference

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

### Phase 5a.2 — Tap Placement Markers, Loop Mode, Speed Trainer Polish (Not Started)

#### Tap placement markers on timeline
After each tap, show exactly where the player hit relative to the expected beat. This provides intuitive visual feedback for how early/late each tap was, beyond just the color change.

- **Tick mark at tap position:** A thin vertical line (2px) placed at the exact horizontal position corresponding to the tap timestamp. Color-coded: green for on-time, yellow for early/late, red for miss.
- **Beat marker color change (existing):** The beat dot still changes color as before.
- **Pad indicator on tick:** For drums, the tick mark includes a small colored dot matching the tapped pad, so the player can see if they hit the right pad.
- **Correct pad shown on miss (strict mode):** When a wrong pad is tapped in strict mode, show the expected pad color as a hollow/outline dot at the beat position, and the actual tapped pad as a filled dot at the tap position.
- **Persistence:** Tick marks remain visible for the duration of the exercise (not cleared after 300ms like the flash feedback). Stored as an array of `{ ms: number, pad?: string, judgment: TimingJudgment }` in a ref.
- **Implementation:** `BeatTimeline` accepts a new `tapMarkers` prop. `SingleRowTimeline` and `DrumLaneTimeline` render tick marks in the appropriate lane/row. `useTiming` exposes a `tapPositions` ref alongside the existing `beatJudgments`.

#### Loop mode
Exercises can loop infinitely, avoiding the results screen between runs. Combined with the speed trainer for continuous tempo progression.

- **Toggle:** New `loopMode` boolean in `PracticeSettings`, toggled via `SettingsPopover`. Default off.
- **Behavior when loop mode is on:**
  - When the exercise ends (`phase → done`), instead of calling `onFinish` and navigating to results, the `PracticeScreen` handles the transition internally.
  - **Brief flash (default):** A compact results overlay appears within the practice screen for ~2 seconds showing accuracy % and stars. Then the exercise auto-restarts with a count-in.
  - **Seamless option:** A sub-toggle `seamlessLoop` (default off). When on, the exercise restarts immediately with zero gap and no count-in — the playhead wraps back to the start as if the exercise is one continuous loop.
  - If speed trainer is also on, BPM adjusts between loops per the speed trainer rules.
  - If speed trainer is off, BPM stays the same.
  - Scores are still saved to localStorage on each loop completion (so personal bests update even in loop mode).
  - **Stop:** The player presses Stop or Back to exit loop mode. On stop, the most recent run's results are shown on the results screen as normal.
- **Implementation:** New `ResultsOverlay` component (lightweight, inline in practice screen — not the full `ResultsScreen`). `useExercise` gains a `restart()` method that resets elapsed time and re-enters countdown (or immediately starts if seamless). `PracticeScreen` orchestrates the loop: `handleDone` → show overlay → timeout → `restart()`.

#### Speed trainer BPM increment presets
Replace the hardcoded +5 BPM increment with selectable presets.

- **UI:** When speed trainer is on, show a small row of preset buttons in the settings popover: **+2** / **+5** / **+10**. Default: +5. Selected preset is highlighted.
- **Type:** Add `speedTrainerStep: number` to `PracticeSettings` (default 5).
- **Logic:** On completion with ≥95% accuracy, increment by `speedTrainerStep` instead of hardcoded 5. Cap at 200 BPM.

### Phase 5b — Handpan & Circular Pad UI (Not Started)
- **Handpan synth:** Tone.js FM/AM synth voices tuned to handpan scale (7–9 notes). Center "ding" (lowest) + surrounding tone fields in ascending pitch. Swappable with real samples later.
- **Circular pad layout (`HandpanPad` component):** Instrument-specific tap zone replacing `TapZone` when instrument is handpan. Pads arranged in a circle: center ding + 6–8 surrounding tone fields. Each pad produces a distinct pitched tone. Touch, click, and keyboard input (number keys 1–9). Color-coded by note.
- **Handpan exercises:** New exercises with note-specific beats (e.g. `beat.note = "D4"`). Beginner: simple patterns on 2–3 notes. Intermediate: scale runs. Advanced: complex melodic patterns.
- **Strict / Free mode (same toggle as drums):**
  - **Free mode:** Any pad counts as a valid tap. Different pads just produce different tones.
  - **Strict mode:** Player must tap the correct note pad as specified by the beat. Wrong pad = miss.
- **Beat timeline:** `SingleRowTimeline` used (not multi-lane). Markers color-coded by target note. Each note gets a distinct color from the handpan color palette.
- **Exercise data:** `beat.note` uses note names (e.g. `"C4"`, `"D4"`) for handpan, distinct from drum pad names.

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

#### Guitar Hero mode
Scrolling note highway for sight-reading practice. Notes scroll vertically (or horizontally) toward a hit line. Player must tap/strum at the right moment. Visual style inspired by Guitar Hero / Rock Band. Could reuse the existing exercise data model with a different renderer.

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

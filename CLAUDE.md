# CLAUDE.md — RhythmEx

## Spec Change Protocol
When `SPEC.md` is updated, prompt the user to review and update the following files:
- **`MANUAL_TESTS.md`** — Add/revise manual test cases covering the new or changed features.
- **`CLAUDE.md`** — Update architecture decisions, project structure, and conventions to reflect the changes.

## Project Overview
RhythmEx is a browser-based rhythm practice app for young musicians. See `SPEC.md` for full product specification.

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 for styling
- Tone.js for audio playback and synthesis
- localStorage for state persistence (no backend)
- Static deployment (GitHub Pages / Netlify)

## Project Structure
```
src/
  App.tsx               # Root component — state machine navigation across screens
  main.tsx              # Entry point — renders App into DOM
  index.css             # Tailwind CSS import
  types/
    index.ts            # All shared TypeScript types and interfaces
  components/
    screens/            # Full-page screen components
      HomeScreen.tsx
      InstrumentSelectScreen.tsx
      ExerciseSelectScreen.tsx
      PracticeScreen.tsx        # Exercise lifecycle, BPM controls, beat timeline, tap input
      ResultsScreen.tsx         # Full results: stars, accuracy, tap breakdown, personal best
    ui/                 # Shared reusable UI components
      Button.tsx        # Variant/size props, 44px+ touch targets
      Layout.tsx        # Page wrapper with gradient bg, max-width
      Navigation.tsx    # Back button + screen title
      StarDisplay.tsx   # 1-3 filled/unfilled stars
    instruments/        # Virtual instrument UIs
      DrumPad.tsx       # Grid of color-coded drum pads with keyboard shortcuts (f/d/j/k/l)
    practice/           # Practice UI components
      BeatTimeline.tsx  # Container/orchestrator: scrolling, lane labels, delegates to DrumLane or SingleRow
      DrumLaneTimeline.tsx  # 5-lane stacked drum timeline (hihat/tom1/tom2/snare/kick)
      SingleRowTimeline.tsx # Single-row timeline for non-drum instruments (handpan, future)
      timelineConstants.ts  # Shared color maps, lane order/labels, scroll constants (PX_PER_BEAT etc.)
      CountdownOverlay.tsx # Full-screen 3-2-1-Go! countdown overlay (ticks at tempo)
      TapZone.tsx       # Large tap target with keyboard/touch/click input, judgment flash feedback
      SettingsPopover.tsx # Gear icon popover: metronome, tap sounds, strict mode, speed trainer, loop mode toggles
  hooks/
    useExercise.ts      # Exercise lifecycle (idle/countdown/playing/done), playhead, BPM
    useAudio.ts         # Tone.js synth engine: drum sounds (kick/snare/hihat/toms) + metronome click
    useTiming.ts        # Tap detection, beat matching, result accumulation, finalize/reset
  data/
    exercises/          # Exercise definitions by difficulty
      beginner.ts       # 3 exercises: quarter notes, half notes, whole notes
      intermediate.ts   # 3 exercises: eighth notes, dotted rhythms, extended groove (8 measures)
      advanced.ts       # 3 exercises: sixteenth notes, syncopation, endurance run (16 measures)
      index.ts          # Aggregator: allExercises, exercisesByDifficulty(), exerciseById()
    samples/
      index.ts          # Audio sample path manifests (placeholder paths)
  utils/
    rhythm.ts           # transportTimeToMs, msPerBeat, exerciseDurationMs, beatTimesMs, exerciseDrumPads
    scoring.ts          # TIMING_WINDOWS, judgeTap, calculateAccuracy, calculateStars
    storage.ts          # localStorage CRUD: compound key per instrument, attempt tracking, getAllScores
    __tests__/          # Vitest unit tests
      rhythm.test.ts
      scoring.test.ts
      storage.test.ts
  hooks/
    __tests__/
      useExercise.test.ts
      useTiming.test.ts
      useAudio.test.ts
  components/
    screens/
      __tests__/
        ResultsScreen.test.tsx
    instruments/
      __tests__/
        DrumPad.test.tsx
    practice/
      __tests__/
        BeatTimeline.test.tsx
        DrumLaneTimeline.test.tsx
        TapZone.test.tsx
        SettingsPopover.test.tsx
  test/
    setup.ts            # Vitest setup — @testing-library/jest-dom + ResizeObserver mock
```

## Commands
- `npm run dev` — Start dev server (Vite)
- `npm run build` — Production build
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint
- `npm run test` — Run tests (Vitest)

## Coding Conventions
- Functional components only, no class components
- Use named exports (not default exports)
- Custom hooks for all Tone.js and timing logic — keep components focused on rendering
- Audio context must be started from a user gesture (browser policy) — never autoplay
- All timing-critical code uses `performance.now()` or Tone.js Transport, not `Date.now()`
- Exercise data is plain JSON — no logic in data files
- Components should be small and composable; split at ~100 lines
- Use `refs` (not state) for values that change on every frame (playhead position, tap timestamps)
- Tailwind for all styling; no inline styles or CSS files
- Mobile-first responsive design: start with mobile layout, add desktop breakpoints

## Testing
- Vitest for unit tests
- Test timing/scoring logic thoroughly (utils/ and hooks/)
- Components: test user interactions, not implementation details
- No need to test Tone.js internals — mock the audio layer

## Architecture Decisions
- **Navigation:** Simple state machine in `App.tsx` using `AppState` — no router library. Screen is a union type, callbacks handle transitions.
- **Path alias:** `@/` maps to `src/` (configured in both `tsconfig.app.json` and `vite.config.ts`)
- **Timing windows:** On-time ≤50ms, acceptable ≤120ms, beyond = miss (defined in `utils/scoring.ts`)
- **Star thresholds:** ≥90% → 3 stars, ≥75% → 2 stars, else → 1 star
- **Transport time format:** Tone.js `"measure:beat:sixteenth"` — parsed by `utils/rhythm.ts`
- **Exercise lifecycle:** `idle → countdown (3-2-1) → playing → done` managed by `useExercise` hook. Uses `requestAnimationFrame` for smooth playhead animation and `performance.now()` for timing. BPM adjustable only in idle phase. Accepts optional `initialBpm` parameter for speed trainer persistence.
- **Tap matching:** `useTiming` hook matches each tap to the nearest unmatched beat via `judgeTap()`. Stray taps beyond 240ms from any beat are silently ignored (kid-friendly). `finalize()` fills unmatched beats as misses. Uses refs for tap data (performance), state only for UI feedback. Feedback auto-clears after 300ms via internal timeout.
- **Tap input:** `TapZone` supports Space key (`keydown` with `event.repeat` guard), `onTouchStart` (lower latency), and `onClick` (desktop fallback). Flashes green/yellow/red for 300ms per judgment. Used for handpan (no audio yet).
- **Drum pads:** `DrumPad` component replaces `TapZone` when instrument is drums. Grid layout adapts to active pad count (2/3/5). Keyboard shortcuts: `f`=kick, `d`=snare, `j`=hihat, `k`=tom1, `l`=tom2. Space maps to next expected pad. Each pad color-coded (kick=red, snare=orange, hihat=cyan, tom1=purple, tom2=pink).
- **Audio engine:** `useAudio` hook creates Tone.js synths lazily on first `startAudioContext()` call (user gesture). MembraneSynth for kick/toms, NoiseSynth for snare, MetalSynth for hihat, triangle Synth for metronome. All synths stored in ref, disposed on unmount. `playDrum`/`playMetronomeClick` are no-ops before audio context is ready.
- **Metronome:** Clicks during countdown (on each 3-2-1-Go tick) and during playing (RAF loop tracks beat crossings from `elapsedMsRef`). Accent on downbeats (C5) vs normal beats (G4). Toggleable via settings.
- **Tempo-aligned count-in:** Countdown ticks use `msPerBeat(bpm)` intervals (not fixed 1s), so the 3-2-1-Go aligns with the exercise tempo and metronome clicks.
- **Practice settings:** `PracticeSettings` type with `metronomeOn`, `tapSoundOn`, `strictMode`, `speedTrainerOn`. Managed as state in `PracticeScreen`, controlled via `SettingsPopover` gear icon. Settings only changeable in idle phase.
- **Strict mode:** When enabled, `useTiming.recordTap(pad)` compares the tapped pad against `exercise.beats[nearestIndex].note`. Wrong pad overrides judgment to `miss` with `expectedPad` set. Free mode (default) accepts any pad for timing-only scoring.
- **Exercise drum assignments:** Exercises use drum pad names as `beat.note` — beginner uses kick+snare, intermediate adds hihat, advanced adds tom1+tom2. `exerciseDrumPads()` utility extracts the deduplicated pad set from any exercise.
- **Score storage:** Compound key `"exerciseId::instrument"` in localStorage — scores are fully independent per instrument. Each entry tracks `bestStars`, `bestAccuracy`, `attempts`, and `totalAccuracy` (enables future average calculation). `getAllScores()` returns the full dict for summary screens.
- **Results screen:** Compares current attempt against stored personal best on render. "New Best!" badge shown only when `attempts > 1` and accuracy meets or beats `bestAccuracy` (not shown on first ever attempt). Shows "Next: {bpm} BPM" hint when speed trainer is active.
- **Multi-lane drum timeline:** `BeatTimeline` orchestrates `DrumLaneTimeline` (5 lanes, 28px each) or `SingleRowTimeline` (handpan/future). Shared constants in `timelineConstants.ts`. Fixed lane labels outside scroll area. `ResizeObserver` measures container width.
- **Timeline scrolling:** GPU-accelerated `translateX` on inner content. Playhead pinned at ~30% from left. 60px per beat density. Short exercises use percentage positioning (no scroll). Threshold: rendered width > container width.
- **Speed trainer:** `speedTrainerBpm` state in `App.tsx`. On completion: ≥95% accuracy → +5 BPM (cap 200), <95% → same BPM, speed trainer off → null. Manual BPM change resets. "Speed Trainer" badge on practice screen. Reset on exercise select.
- **Drum pad idle colors:** Disabled pads use muted pad-colored backgrounds (`DRUM_PAD_MUTED_COLORS` from `timelineConstants.ts`) instead of gray, for visual association with timeline lane colors.

## Upcoming Phases (see SPEC.md for full detail)
- **Phase 5a.2 — Tap Placement Markers, Loop Mode, Speed Trainer Polish:** Tick marks on timeline at exact tap position (visual early/late feedback). Loop mode toggle for infinite repeats with brief results flash or seamless looping. Speed trainer BPM step presets (+2/+5/+10). `loopMode`, `seamlessLoop`, `speedTrainerStep` added to `PracticeSettings`. New `ResultsOverlay` component. `useExercise` gains `restart()`.
- **Phase 5b — Handpan:** Circular pad layout (`HandpanPad`), FM/AM synth voices (7–9 notes), note-specific exercises, `SingleRowTimeline` with note-colored markers.
- **Phase 6 — Strumming:** New instrument type. `StrumZone` component (vertical swipe + tap buttons + arrow keys). PluckSynth chord voicings (`src/data/chords.ts`). Exercises support single-chord patterns and chord progressions (`beat.note` = `down`/`up`, `beat.chord` = chord name).
- **Phase 7 — Free Play:** Dedicated `FreePlayScreen` — instrument pads + optional metronome, no timeline/scoring. Entry from exercise select. Future home for YouTube video playback.
- **Phase 8 — Microphone Input:** `useMicrophone` + `useOnsetDetector` + `usePitchDetector` hooks. Drums: onset detection (amplitude threshold). Handpan: autocorrelation pitch detection. Guitar: root note detection (phase 1), ML chord classification (phase 2 future). Mic runs alongside virtual pads.

## Important Notes
- Target audience is young children (5+): keep UI simple, colorful, and forgiving
- All audio must be triggered by user interaction (no autoplay)
- Performance matters: rhythm apps need <10ms input latency where possible
- Exercises are data-driven — adding new exercises should only require adding JSON
- `beat.note` convention varies by instrument: drum pad names for drums, note names (C4, D4) for handpan, strum direction (down/up) for strumming
- Three planned instrument types: `drums` (implemented), `handpan` (planned), `strumming` (planned)

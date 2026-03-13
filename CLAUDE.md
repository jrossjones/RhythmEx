# CLAUDE.md — RhythmEx

## Spec Change Protocol
When `SPEC.md` is updated or a phase is completed, prompt the user to review and update the following files:
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
      HandpanPad.tsx    # Circular pad layout: center ding + surrounding tone fields, keyboard 1-9
    practice/           # Practice UI components
      BeatMarker.tsx    # Shape-differentiated marker: circle/diamond/triangle/square/rounded-rect/line, labels, hollow/filled
      VerticalTimeline.tsx       # Orchestrator for vertical note highway (replaces horizontal BeatTimeline in PracticeScreen)
      VerticalDrumTimeline.tsx   # N equal-width columns for drum pads, markers scroll downward
      VerticalSingleTimeline.tsx # Single column with horizontal offsets for handpan notes
      BeatTimeline.tsx  # (Legacy) Horizontal timeline orchestrator — kept for rollback
      DrumLaneTimeline.tsx  # (Legacy) 5-lane stacked drum timeline
      SingleRowTimeline.tsx # (Legacy) Single-row timeline for non-drum instruments
      timelineConstants.ts  # Shared color maps, shapes, lane order/labels, scroll constants, vertical constants
      TapZone.tsx       # Large tap target with keyboard/touch/click input, judgment flash feedback
      SettingsPopover.tsx # Gear icon popover: metronome, tap sounds, strict mode, speed trainer, loop mode toggles
  hooks/
    useExercise.ts      # Exercise lifecycle (idle/countdown/playing/done), playhead, BPM, lead-in, outro scroll
    useAudio.ts         # Tone.js synth engine: drum sounds + handpan FM synth + metronome click
    useTiming.ts        # Tap detection, beat matching, result accumulation, finalize/reset
    useLearnMode.ts     # Learn mode: countdown + step-through beats with smooth scroll animation
  data/
    exercises/          # Exercise definitions by difficulty
      beginner.ts       # 3 drum exercises: quarter notes, half notes, whole notes
      intermediate.ts   # 3 drum exercises: eighth notes, dotted rhythms, extended groove (8 measures)
      advanced.ts       # 3 drum exercises: sixteenth notes, syncopation, endurance run (16 measures)
      handpan-beginner.ts    # 3 handpan exercises: ding pulse, two-note melody, ascending scale
      handpan-intermediate.ts # 3 handpan exercises: kurd flow, ding & ring, cascade (8 measures)
      handpan-advanced.ts    # 3 handpan exercises: handpan rain, syncopated groove, endurance flow (16 measures)
      index.ts          # Aggregator: allExercises (18), exercisesByDifficulty(diff, instrument?), exerciseById()
    handpan/
      scales.ts         # HandpanScale type, 3 presets (D Kurd, C Amara, F Pygmy), getScale()
    samples/
      index.ts          # Audio sample path manifests (placeholder paths)
  utils/
    rhythm.ts           # transportTimeToMs, msPerBeat, exerciseDurationMs, beatTimesMs, exerciseDrumPads, pitchClass
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
      useLearnMode.test.ts
  components/
    screens/
      __tests__/
        ResultsScreen.test.tsx
    instruments/
      __tests__/
        DrumPad.test.tsx
        HandpanPad.test.tsx
    practice/
      __tests__/
        BeatMarker.test.tsx
        BeatTimeline.test.tsx
        DrumLaneTimeline.test.tsx
        VerticalTimeline.test.tsx
        VerticalDrumTimeline.test.tsx
        TapZone.test.tsx
        SettingsPopover.test.tsx
  data/
    exercises/
      __tests__/
        index.test.ts       # Exercise aggregator: 18 exercises, instrument filtering
    handpan/
      __tests__/
        scales.test.ts      # Scale presets, lookup, defaults
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
- **Exercise lifecycle:** `idle → countdown (4-3-2-1) → playing → done` managed by `useExercise` hook. Uses `requestAnimationFrame` for smooth playhead animation and `performance.now()` for timing. BPM adjustable only in idle phase. Accepts optional `initialBpm` parameter for speed trainer persistence.
- **Timeline lead-in:** RAF starts during countdown with negative elapsed time (`startTimeRef = now + leadInMs`). `elapsedMs` starts negative and reaches 0 when playing begins. `rawProgress` (unclamped) passed to VerticalTimeline for smooth scroll-in animation. Clamped `progress` stays in `[0, 1]` for non-timeline uses. No full-screen overlay — small countdown badge overlaid on timeline corner. `LEAD_IN_BEATS = 4` exported from `useExercise.ts`.
- **Outro scroll:** After `elapsed >= durationMs`, `setPhase('done')` fires via `phaseDoneFiredRef` (stops taps). `onDone` callback fires at `durationMs + outroDurationMs` via `onDoneFiredRef`. RAF continues for one extra measure so beats animate past the hit line before results/navigation. `rawProgress` exceeds 1.0 during outro.
- **Tap matching:** `useTiming` hook matches each tap to the nearest unmatched beat via `judgeTap()`. Stray taps beyond 240ms from any beat are silently ignored (kid-friendly). `finalize()` fills unmatched beats as misses. Uses refs for tap data (performance), state only for UI feedback. Feedback auto-clears after 300ms via internal timeout. Per-pad debounce (40ms) prevents double-triggers — uses `performance.now()` and `lastTapTimePerPadRef` map, cleared on `reset()`.
- **Tap input:** `TapZone` supports Space key (`keydown` with `event.repeat` guard), `onTouchStart` (lower latency), and `onClick` (desktop fallback). Flashes green/yellow/red for 300ms per judgment.
- **Drum pads:** `DrumPad` component replaces `TapZone` when instrument is drums. Grid layout adapts to active pad count (2/3/5). Keyboard shortcuts: `f`=kick, `d`=snare, `j`=hihat, `k`=tom1, `l`=tom2. Space maps to next expected pad. Each pad color-coded (kick=red, snare=orange, hihat=cyan, tom1=purple, tom2=pink).
- **Audio engine:** `useAudio` hook creates Tone.js synths lazily on first `startAudioContext()` call (user gesture). Drums: MembraneSynth for kick/toms, NoiseSynth for snare, MetalSynth for hihat. Handpan: `PolySynth(FMSynth)` with reverb (decay 3s, wet 0.35), harmonicity 2.01, modulation index 12, 800ms note duration. Triangle Synth for metronome. All synths stored in ref, disposed on unmount. `playDrum`/`playHandpan`/`playMetronomeClick` are no-ops before audio context is ready.
- **Metronome:** Clicks during countdown (on each 4-3-2-1 tick) and during playing (RAF loop tracks beat crossings from `elapsedMsRef`). Accent on downbeats (C5) vs normal beats (G4). Toggleable via settings. Also clicks during learn mode countdown.
- **Tempo-aligned count-in:** 4-beat lead-in using `msPerBeat(bpm)` intervals. Countdown values: 4→3→2→1→0 (Go). Metronome clicks on each tick. Timeline scrolls during lead-in (empty runway, then beats approach hit line).
- **Practice settings:** `PracticeSettings` type with `metronomeOn`, `tapSoundOn`, `strictMode`, `speedTrainerOn`. Managed as state in `PracticeScreen`, controlled via `SettingsPopover` gear icon. Settings only changeable in idle phase.
- **Strict mode:** When enabled, `useTiming.recordTap(pad)` compares the tapped pad against `exercise.beats[nearestIndex].note`. Wrong pad overrides judgment to `miss` with `expectedPad` set. Free mode (default) accepts any pad for timing-only scoring.
- **Exercise drum assignments:** Exercises use drum pad names as `beat.note` — beginner uses kick+snare, intermediate adds hihat, advanced adds tom1+tom2. `exerciseDrumPads()` utility extracts the deduplicated pad set from any exercise.
- **Score storage:** Compound key `"exerciseId::instrument"` in localStorage — scores are fully independent per instrument. Each entry tracks `bestStars`, `bestAccuracy`, `attempts`, and `totalAccuracy` (enables future average calculation). `getAllScores()` returns the full dict for summary screens.
- **Results screen:** Compares current attempt against stored personal best on render. "New Best!" badge shown only when `attempts > 1` and accuracy meets or beats `bestAccuracy` (not shown on first ever attempt). Shows "Next: {bpm} BPM" hint when speed trainer is active.
- **Vertical timeline:** `VerticalTimeline` orchestrates `VerticalDrumTimeline` or `VerticalSingleTimeline`. Guitar Hero-style drop-down: future beats appear at the top and fall toward a hit line at 70% from top. Inverted Y coordinate system with top/bottom padding so the playhead stays pinned at the hit line for the full exercise (`yPosition = topPadding + (1 - frac) * exercisePixels`). GPU-accelerated `translateY`. 80px per beat vertical density. Drum columns (64px each) match active pads. Handpan column (160px) with angular offsets based on pad position. Ding note renders as full-width horizontal bar (`line` shape).
- **Legacy horizontal timeline:** `BeatTimeline`, `DrumLaneTimeline`, `SingleRowTimeline` kept for rollback. Not used in `PracticeScreen`.
- **BeatMarker component:** Reusable shape-differentiated marker. Six shapes: `circle` (kick/low register), `diamond` (snare/mid register), `triangle` (hihat/high register), `square` (tom1), `rounded-rect` (tom2), `line` (handpan ding). Text labels inside (K/S/H/T1/T2 for drums, pitch class for handpan). 16px default size. `isHollow` prop swaps fill for colored border (judgment-based via `JUDGMENT_BORDER_COLORS`). `isNext` adds pulse, `isJudged` adds ring. CSS-only shapes (clip-path for triangle, rotate for diamond).
- **Hollow/filled marker states:** Upcoming beats are solid filled. After judgment, markers transition to hollow outlines with `border-green-400` (on-time), `border-yellow-400` (early/late), `border-red-400` (miss). Smooth `transition-colors duration-200`.
- **Listen/Demo mode:** "Listen" button in idle phase starts exercise lifecycle in demo mode. Auto-fire RAF loop plays `playDrum`/`playHandpan` at beat times during playing phase. Pads visible but disabled. "Listening..." badge shown. On completion, resets to idle — no scoring, no results screen. `isDemoModeRef` checked in `handleDone`.
- **Learn mode:** "Learn" button in idle phase. `useLearnMode` hook manages step-through state independently of `useExercise`. Phases: `idle → countdown → active → done`. Countdown uses same 4-beat lead-in as exercise (RAF-animated, metronome clicks, countdown badge). During active phase, correct taps trigger smooth ease-out animation to next beat position (tween duration = `msPerBeat(bpm)`, scaling with tempo). Wrong pad flashes red (400ms timeout). "Learning" badge shown. Auto-resets to idle after 600ms when all beats completed. Settings popover disabled during learn mode.
- **Pad enabled during countdown:** Pads are visually enabled during countdown/lead-in (both exercise and learn mode). Taps are silently ignored by `useTiming` since `phase !== 'playing'`, but pads look ready.
- **Outro scroll timing:** `setPhase('done')` fires at `durationMs` (stops taps via `phaseDoneFiredRef`). `onDone` callback fires later at `durationMs + outroDurationMs` (after beats scroll past). Fixes seamless loop phase override — `setPhase('done')` before `onDone` means any phase change inside `handleDone` (e.g., seamless restart → `'playing'`) wins the React batch.
- **Idle timeline position:** In idle, timeline shows lead-in start position (`idleProgress = -(LEAD_IN_BEATS * msPerBeat(bpm)) / durationMs`). No visual jump when Start is pressed — RAF starts from the same position and scrolls smoothly.
- **Speed trainer:** `speedTrainerBpm` state in `App.tsx`. On completion: ≥95% accuracy → +5 BPM (cap 200), <95% → same BPM, speed trainer off → null. Manual BPM change resets. "Speed Trainer" badge on practice screen. Reset on exercise select.
- **Drum pad idle colors:** Disabled pads use muted pad-colored backgrounds (`DRUM_PAD_MUTED_COLORS` from `timelineConstants.ts`) instead of gray, for visual association with timeline lane colors.
- **Handpan scales:** `HandpanScale` type in `src/data/handpan/scales.ts` with 3 presets: D Kurd (9 notes), C Amara (8 notes), F Pygmy (9 notes). Default: `d-kurd`. `getScale(id)` lookup. Exercises reference scale via `exercise.scale` field.
- **Handpan pad layout:** `HandpanPad` component with circular arrangement — center ding (64×64px) + surrounding tone fields (52×52px). Color-coded by pitch class via `HANDPAN_PAD_COLORS`. Keyboard: 1–9 for notes, Space for next expected note. Muted idle colors via `HANDPAN_PAD_MUTED_COLORS`.
- **Handpan note colors:** `HANDPAN_NOTE_COLORS` in `timelineConstants.ts` maps 12 chromatic pitch classes to Tailwind colors (C=red, D=orange, E=amber, F=green, G=teal, A=blue, Bb=violet, etc.). `pitchClass()` helper extracts pitch class from note string (e.g. `"D3"` → `"D"`, `"Bb4"` → `"Bb"`). Used for both timeline markers and pad colors.
- **Exercise instrument filtering:** `Exercise.instrument` field (`'drums' | 'handpan'`) added to type. `exercisesByDifficulty()` accepts optional instrument filter. `ExerciseSelectScreen` filters by selected instrument. 18 total exercises (9 drums + 9 handpan).

## Upcoming Phases (see SPEC.md for full detail)
- **Future improvements:** Column-to-pyramid alignment (match drum column widths to pad centers). Approach animation (osu!-style shrinking ring). Colorblind mode toggle.
- **Phase 6 — Strumming:** New instrument type. `StrumZone` component (vertical swipe + tap buttons + arrow keys). PluckSynth chord voicings (`src/data/chords.ts`). Exercises support single-chord patterns and chord progressions (`beat.note` = `down`/`up`, `beat.chord` = chord name).
- **Phase 7 — Free Play:** Dedicated `FreePlayScreen` — instrument pads + optional metronome, no timeline/scoring. Entry from exercise select. Drum customization: pad count selector (2/3/5). Handpan customization: scale/key selector + note count selector (5/7/9 notes). Both persisted in localStorage. Future home for YouTube video playback.
- **Phase 8 — Microphone Input:** `useMicrophone` + `useOnsetDetector` + `usePitchDetector` hooks. Drums: onset detection (amplitude threshold). Handpan: autocorrelation pitch detection. Guitar: root note detection (phase 1), ML chord classification (phase 2 future). Mic runs alongside virtual pads.
- **Phase 9 — Kalimba:** New instrument type. `KalimbaPad` component (fan/arc tine layout, alternating left/right from center). PluckSynth or tuned FMSynth for bright bell-like timbre. Scale presets (C major, G major, pentatonic). Single-column timeline with note-colored markers. `beat.note` uses note names (same as handpan).

## Important Notes
- Target audience is young children (5+): keep UI simple, colorful, and forgiving
- All audio must be triggered by user interaction (no autoplay)
- Performance matters: rhythm apps need <10ms input latency where possible
- Exercises are data-driven — adding new exercises should only require adding JSON
- `beat.note` convention varies by instrument: drum pad names for drums, note names (C4, D4) for handpan/kalimba, strum direction (down/up) for strumming
- Four planned instrument types: `drums` (implemented), `handpan` (implemented), `strumming` (planned), `kalimba` (planned)

# CLAUDE.md — RhythmEx

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
      PracticeScreen.tsx        # Exercise lifecycle, BPM controls, beat timeline
      ResultsScreen.tsx         # Placeholder — real scoring in Phase 4
    ui/                 # Shared reusable UI components
      Button.tsx        # Variant/size props, 44px+ touch targets
      Layout.tsx        # Page wrapper with gradient bg, max-width
      Navigation.tsx    # Back button + screen title
      StarDisplay.tsx   # 1-3 filled/unfilled stars
    instruments/        # (Phase 5) HandPan, DrumPad — virtual instrument UIs
    practice/           # Practice UI components
      BeatTimeline.tsx  # Horizontal beat timeline with playhead and color-coded markers
      CountdownOverlay.tsx # Full-screen 3-2-1-Go! countdown overlay
  hooks/
    useExercise.ts      # Exercise lifecycle (idle/countdown/playing/done), playhead, BPM
    useAudio.ts         # (Phase 5) Tone.js integration, sample loading, playback
    useTiming.ts        # (Phase 3) Tap detection, accuracy scoring, star calculation
  data/
    exercises/          # Exercise definitions by difficulty
      beginner.ts       # 3 exercises: quarter notes, half notes, whole notes
      intermediate.ts   # 2 exercises: eighth notes, dotted rhythms
      advanced.ts       # 2 exercises: sixteenth notes, syncopation
      index.ts          # Aggregator: allExercises, exercisesByDifficulty(), exerciseById()
    samples/
      index.ts          # Audio sample path manifests (placeholder paths)
  utils/
    rhythm.ts           # transportTimeToMs, msPerBeat, exerciseDurationMs, beatTimesMs
    scoring.ts          # TIMING_WINDOWS, judgeTap, calculateAccuracy, calculateStars
    storage.ts          # localStorage CRUD: loadScores, saveResult, getBestScore
    __tests__/          # Vitest unit tests
      rhythm.test.ts
      scoring.test.ts
      storage.test.ts
  test/
    setup.ts            # Vitest setup — @testing-library/jest-dom
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
- **Exercise lifecycle:** `idle → countdown (3-2-1) → playing → done` managed by `useExercise` hook. Uses `requestAnimationFrame` for smooth playhead animation and `performance.now()` for timing. BPM adjustable only in idle phase.

## Important Notes
- Target audience is young children (5+): keep UI simple, colorful, and forgiving
- All audio must be triggered by user interaction (no autoplay)
- Performance matters: rhythm apps need <10ms input latency where possible
- Exercises are data-driven — adding new exercises should only require adding JSON

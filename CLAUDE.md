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
  components/
    instruments/    # HandPan, DrumPad — virtual instrument UIs
    practice/       # BeatGrid, TimingFeedback, StarRating — practice session UI
    ui/             # Layout, Navigation, Button — shared UI components
  hooks/
    useAudio.ts     # Tone.js integration, sample loading, playback
    useTiming.ts    # Tap detection, accuracy scoring, star calculation
    useExercise.ts  # Exercise state, playhead position, BPM control
  data/
    exercises/      # JSON exercise definitions by difficulty
    samples/        # Audio sample manifests per instrument
  utils/
    rhythm.ts       # Beat pattern helpers, time conversion
    scoring.ts      # Accuracy calculation, star thresholds
  types/
    index.ts        # Shared TypeScript types and interfaces
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

## Important Notes
- Target audience is young children (5+): keep UI simple, colorful, and forgiving
- All audio must be triggered by user interaction (no autoplay)
- Performance matters: rhythm apps need <10ms input latency where possible
- Exercises are data-driven — adding new exercises should only require adding JSON

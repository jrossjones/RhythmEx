# Importing rhythms from MusicXML

Notes from turning `FleetwoodMac_R.musicxml` ("Never Going Back Again") into the
two `polyrhythm-never-going-back` exercises (drums + handpan). This works well as
a repeatable way to add real songs as exercises.

## Pipeline

1. **Get MusicXML, not `.tg`.** TuxGuitar's native `.tg` is an undocumented binary
   — readable as bytes but not safe to decode rhythm from. Export
   **File → Export → MusicXML** instead. MIDI is a fallback; MusicXML is best
   because it keeps explicit durations, voices, ties, and tempo.
2. **Parse with a script, don't eyeball it.** A few measures of chords is enough to
   mis-transcribe by hand. Use `xml.etree.ElementTree` (Python via
   `C:/Users/jross/anaconda3/python.exe`) to extract onsets deterministically, then
   emit the `beats: [...]` array as text to paste in.
3. **Map to the app's data model** (`Beat`: `time`, `duration`, `note`). Time is
   `"measure:beat:sixteenth"` — see `utils/rhythm.ts` (4 beats/measure, 4
   sixteenths/beat, so an eighth = `sixteenth` step of 2).

## MusicXML facts that matter

- **`<divisions>`** (per quarter note) is the tick unit. Here `divisions=960`, so
  eighth=480, quarter=960. Convert ticks → beats with `onset/divisions`.
- **`<chord/>`** on a note means "same onset as the previous note." A non-chord note
  *advances* time by its `<duration>`; a chord note does not. Group them: each
  non-chord note starts a new event, chord notes attach to it.
- **Two staves are often duplicates.** This file had staff 1 = notation, staff 2 =
  the identical part as TAB, separated by a `<backup>`. Read **one staff only** or
  you double every note. (Rule of thumb: stop reading a measure at the first
  `<backup>`.)
- **Ties are the important gotcha.** A `<tie type="start"/>` … `<tie type="stop"/>`
  pair is **one strike held**, not two. For a struck instrument (drum/handpan) a
  tie-*stop* note is a **sustain, not a new onset** — skip it when generating beats.
  Missing this adds phantom hits and flattens exactly the syncopation you want.
  Detection: a note whose `<tie>`/`<tied>` type is `stop` is not an attack.
  (First pass here ignored ties and the two "voices" looked like they moved
  together; honoring ties revealed the real polyrhythm.)

## Two-voice / polyrhythm handling

- The single guitar part was split into two rhythmic voices by **register**:
  octave ≤2 (thumb pedal) = **bass**, octave ≥3 (fingers) = **melody**. That's the
  only split that yields two distinct rhythms; splitting "lowest note of each chord"
  just reproduces the combined rhythm.
- Two voices → two beats at the **same `time`**. The app renders them as side-by-side
  markers (drum columns / handpan horizontal offsets) and both are tappable.
- **Scoring caveat:** `useTiming` matches a tap to the nearest *unmatched* beat by
  time only, so it can't reliably attribute a tap to one of two simultaneous beats.
  Keep polyrhythm exercises **timing-only** (strict mode off).

## Instrument mapping choices (per exercise)

- **Drums:** rhythm only — one pad per voice (bass → kick, melody → hi-hat).
- **Handpan:** bass → center ding; melody → real pitches if they fit a scale.
  Pick the scale by which one covers the melody notes: here **C Amara**
  (C/G/A/B/C/D/E/G) held every melody note with zero substitution; D Kurd would
  have forced B→Bb. Take the **top attacked note** of each melody event as the line.
- **Durations** were set to each note's full tied length (`8n`/`4n`/`4n.`/`2n`) so
  held notes read as sustains on the timeline. Duration is mostly cosmetic — scoring
  uses onset times only.

## Housekeeping when adding exercises

- Exercise counts are asserted in `src/data/exercises/__tests__/index.test.ts`
  (total + per-instrument + per-difficulty) — update them.
- Avoid names that collide with UI query text. "…Never Going **Back**" matched a
  test's `getByText(/back/i)` for the nav Back button; the fix was tightening the
  query to `getByRole('button', { name: /^← Back$/ })`.

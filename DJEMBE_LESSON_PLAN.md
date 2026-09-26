# Djembe Lesson Plan — 20 Exercises, Beginner → Intermediate

Plan document for review. Engine prerequisites (§2.1) and the cross-instrument touch fixes are **built**; the instrument, pads and exercise data are still to come.

## 1. Decisions locked in

| Question | Decision |
| --- | --- |
| Deliverable | This plan doc now; exercise data + instrument build later |
| Instrument model | New `'djembe'` instrument type (not a re-skin of `'drums'`) |
| Hand tracking | **Scored** — six distinct inputs (bass/tone/slap × strong/weak) |
| Hand convention | **`strong` / `weak`**, not `R` / `L` — vindicated by the traditional oral notation, §3.1 |
| Content | Traditional West African repertoire, including 12/8 material |
| Audio | Reuse the existing drum-synth approach (no new samples), with **strong/weak asymmetry** (§2.2) |
| Hand strictness | Enforced **only under strict mode**; free mode judges timing only |
| Pad layout | **Reach Fan** primary (§12.4), with the Hand Columns grid **selectable** (§12.3) |

## 2. Engine prerequisites

These must land before **any** 12/8 exercise (Ex 11–15, 18) can be authored. Everything in 4/4 (Ex 1–10, 16, 17, 19, 20) works with the engine as it stands.

### 2.1 Triplet subdivision — ✅ BUILT

**Implemented as described below.** `Feel = 'straight' | 'triplet'` is in `src/types/index.ts`; `Exercise.feel` is optional and defaults to straight. `transportTimeToMs(time, bpm, subdivisions = 4)` takes the divisor, `subdivisionsPerBeat(feel)` maps feel → 4 or 3, and `beatTimesMs` threads the exercise's feel through — it remains the only app-code caller. 7 new tests cover the triplet grid, the default, exact bar wrapping (`0:3:2` → next is `1:0:0` at 4 beats), and that straight-feel exercises are untouched. 434 tests pass.

One limitation left in place and now documented in the function: the measure offset still hardcodes 4 beats per measure, so a genuine `[3, 4]` exercise would mistime. No current exercise is anything but 4/4, and fixing it means threading beats-per-measure through as well — out of scope here, flagged rather than silently carried.

`transportTimeToMs` (`src/utils/rhythm.ts:7`) parses `"measure:beat:sixteenth"` and hardcodes `totalBeats = measures * 4 + beats + sixteenths / 4`. The `/ 4` makes triplets inexpressible — an 8th-note triplet lands at 1/3 of a beat, which has no exact sixteenth representation.

Djembe 12/8 is conventionally counted as **4 pulses × 3 subdivisions**, not 12 independent beats. That makes the fix small:

- Add `feel?: 'straight' | 'triplet'` to `Exercise` (default `'straight'`).
- `transportTimeToMs` takes the subdivision count: `straight` → 4 per beat, `triplet` → 3 per beat.
- `beatTimesMs` (`rhythm.ts:34`) passes it through — it is the **only** caller of `transportTimeToMs` in app code, so the blast radius is one function plus its tests.
- `timeSignature` stays `[4, 4]`, so `exerciseDurationMs`, `useMetronome`'s downbeat accent, measure-divider rendering, and the `measures * 4` term all keep working untouched.

A 12/8 bar is then `0:0:0 0:0:1 0:0:2 0:1:0 … 0:3:2`.

> Trade-off worth naming: this models "4/4 with a triplet feel", not true compound meter. It covers the whole djembe repertoire below and costs almost nothing. A general meter engine is a much larger change with no additional payoff here.

### 2.2 Six-input djembe instrument

- `InstrumentType` gains `'djembe'`; `DjembePad` component; `exerciseDjembeStrokes()` alongside `exerciseDrumPads()`.
- `beat.note` convention: `"bass-strong" | "bass-weak" | "tone-strong" | "tone-weak" | "slap-strong" | "slap-weak"`. Consistent with the existing per-instrument convention (drum pad names / note names / strum directions), and hand-agnostic — so left-handed mirroring is a render-time concern only, never a scoring one (§3.1).
- **Pad layout:** 2 columns (Left hand | Right hand) × 3 rows (bass / tone / slap). Keyboard: `s d f` = L bass/tone/slap, `j k l` = R bass/tone/slap, `Space` = next expected.
- **Timeline:** six columns is wide for a phone. Recommend grouping as 3 stroke columns with an L/R glyph inside each marker, rather than 6 columns — decide during the build.
- **Audio:** `MembraneSynth` low-tuned for bass, `MembraneSynth` mid-tuned for tone, `NoiseSynth` + highpass for slap.

  **The sound reflects strong/weak.** A player's weak hand genuinely strikes with less force and slightly less definition, and in djembe practice the strong hand leads the phrase — so the two hands should not sound identical:

  | Axis | Strong hand | Weak hand |
  | --- | --- | --- |
  | Velocity | 1.0 | ~0.75 (≈ −2.5 dB) |
  | Attack brightness | full | slightly rolled off (lower highpass / filter cutoff on slap) |
  | Pitch | nominal | a few cents down, from the softer strike |

  There's direct precedent in the codebase: `playStrum` already differentiates up- from down-strums on velocity (1.0 vs 0.6), stagger and bass-note skipping. `playDjembe(stroke, hand)` follows the same shape — one synth per stroke, hand modulating velocity and timbre rather than selecting a different voice. This makes free mode audibly *teach* the sticking even though it doesn't score it.
- **Scoring:** strict mode compares the full `"stroke-hand"` string. Free mode ignores it entirely — a 5-year-old should not be penalized for hand choice.

### 2.3 Concern to flag

Six scored inputs with hand differentiation is a real jump in difficulty for the stated 5+ audience. Free mode being the default handles this, but Ex 1–4 exist specifically so hand alternation is trained before any repertoire arrives. If early testing shows it's too much, the fallback is 3 pads with R/L as an advisory label only.

## 3. Notation used below

Symbols: `B` bass (center, flat palm) · `T` tone (edge, flat fingers) · `S` slap (edge, snapped fingertips) · `-` rest.
Sticking on the line beneath: `R` / `L`.

- **4/4 patterns** on a 16-cell sixteenth grid: `1 e & a  2 e & a  3 e & a  4 e & a`
- **12/8 patterns** on a 12-cell triplet grid: `1 . .  2 . .  3 . .  4 . .`

Each entry gives one bar; repeat for the stated measure count.

### 3.1 `R`/`L` in the grids means strong/weak

The grids keep `R`/`L` on the sticking line because it reads more clearly than repeating "strong"/"weak" sixteen times per bar. **They denote the strong and weak hand, not literally right and left** — `R` = strong, `L` = weak, which coincide for a right-handed player. The data stores `-strong` / `-weak`, and handedness resolves to a physical side once, at render time.

Verification turned this from the merely inclusive choice into the traditionally correct one. Two independent conventions in djembe pedagogy encode exactly this distinction:

**Written notation** uses letter case for the hand — uppercase strong, lowercase weak: `B`/`b` bass, `T`/`t` tone, `S`/`s` slap.

**Oral notation** encodes it in the syllable itself. This is the [Gun Dun Go Do Pa Ta](http://sewakassa.blogspot.com/2009/05/gun-dun-go-do-pa-ta.html) system, the standard vocalisation used to teach these rhythms by ear:

| Stroke | Strong hand | Weak hand |
| --- | --- | --- |
| Bass | **Gun** | **Dun** |
| Tone | **Go** | **Do** |
| Slap | **Pa** | **Ta** |

The language of the tradition has no term for "the right-hand tone" — it has *Go* and *Do*. Storing `R`/`L` would have been the mistranslation.

### 3.2 A feature this unlocks — chantable patterns

Because the syllables *are* the notation, a djembe pattern is a sentence a child can sing before playing it. Ex 6 (Kuku) becomes "Gun — Go Do — Pa — Go Do". [Teaching sources](https://www.x8drums.com/blog/djembe-rhythm-gun-dun-notation/) note that vocalising lets learners memorise complex patterns considerably faster than reading them, and oral transmission is how this music is actually taught.

Concretely: label pads and timeline markers with the syllable instead of `B`/`T`/`S` and the app teaches authentic vocabulary at zero UI cost — the marker holds one short word either way. Best as a display toggle (`Syllables` / `Letters`) rather than a hard swap, since `B`/`T`/`S` is easier for an adult skim-reading the timeline.

## 4. Progression model

Difficulty advances along five independent axes, one or two at a time:

1. **Stroke count** — one stroke type → two → all three within a bar
2. **Subdivision** — quarters → eighths → sixteenths / triplets
3. **Sticking** — strict alternation → strong-hand-lead → mixed
4. **Downbeat dependence** — on-beat → offbeat → syncopated
5. **Length** — 4 measures → 8 → 16

Difficulty field: Ex 1–12 `beginner`, Ex 13–20 `intermediate`.

---

## 5. Stage A — Hands & Strokes (Ex 1–4)

Pure technique. No repertoire yet — the point is that each stroke has a distinct sound and that both hands can produce it. 4 measures each.

### Ex 1 — Bass Walk · 4/4 · 70 BPM · beginner
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
B  -  -  -  B  -  -  -  B  -  -  -  B  -  -  -
R           L           R           L
```
Full palm in the drum's center. Teaches: the bass stroke, strict alternation.

### Ex 2 — Tone Walk · 4/4 · 70 BPM · beginner
Same grid, `T` throughout, `R L R L`. Flat fingers on the edge, hand rebounds off. Teaches: edge contact point, rebound.

### Ex 3 — Slap Walk · 4/4 · 65 BPM · beginner
Same grid, `S` throughout, `R L R L`. Slower because the slap is the hardest stroke to produce cleanly. Teaches: relaxed, snapping fingertips.

### Ex 4 — Three Voices · 4/4 · 70 BPM · beginner
Stroke changes every two beats; hands alternate continuously, so each stroke gets played by both hands.
```
M1: B B T T   M2: S S B B   M3: T T S S   M4: B B T T
    R L R L       R L R L       R L R L       R L R L
```
Teaches: switching stroke type without breaking the hand pattern. Last pure-technique exercise.

---

## 6. Stage B — First accompaniments, 4/4 (Ex 5–10)

Real accompaniment parts. Strong-hand-lead sticking (`R` starts each pair) appears here — this is normal djembe practice, not an error.

### Ex 5 — Tone Pairs · 4/4 · 80 BPM · beginner · 4 measures
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
T  T  -  -  -  -  -  -  T  T  -  -  -  -  -  -
R  L                    R  L
```
Bridge drill: introduces the eighth-note pair, the building block of nearly every part below.

### Ex 6 — Kuku, 1st accompaniment · 4/4 · 85 BPM · beginner · 4 measures
*Guinea (Manian) — usually the first rhythm taught.*
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
B  -  -  -  T  -  T  -  S  -  -  -  T  -  T  -
R           R     L     R           R     L
```
Teaches: all three strokes in one bar; strong-hand-lead pairs.

### Ex 7 — Kassa, 1st accompaniment · 4/4 · 85 BPM · beginner · 4 measures
*Malinke harvest rhythm.*
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
B  -  -  -  B  -  -  -  T  -  T  -  S  -  -  -
R           L           R     L     R
```
Teaches: two consecutive basses on alternating hands, then a stroke change.

### Ex 8 — Djole, 1st accompaniment · 4/4 · 90 BPM · beginner · 4 measures
*Temne, Sierra Leone.*
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
B  -  -  -  -  -  T  T  S  -  -  -  -  -  T  T
R                 R  L  R                 R  L
```
Teaches: first **sixteenth-note** pair, landing on `& a` rather than on the beat.

### Ex 9 — Kuku, 2nd accompaniment · 4/4 · 85 BPM · beginner · 4 measures
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
-  -  T  -  -  -  T  -  -  -  S  -  -  -  S  -
      R           L           R           L
```
Every note is an offbeat. Practice with the metronome **on** — the whole lesson is holding a part that never coincides with the pulse. Pairs with Ex 6 (see Ex 20).

### Ex 10 — Yankadi accompaniment · 4/4 · 70 BPM · beginner · 4 measures
*Susu — a slow social dance; traditionally paired with the faster Makru.*
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
B  -  -  T  -  -  S  -  B  -  -  T  -  -  S  -
R        L        R     R        L        R
```
Teaches: the `a` (fourth sixteenth) — the least intuitive slot in the bar. Slow tempo makes it learnable.

---

## 7. Stage C — Triplet feel / 12-8 (Ex 11–15)

**Blocked on §2.1.** Everything here is `feel: 'triplet'`, `timeSignature: [4, 4]`. BPM refers to the four main pulses.

### Ex 11 — Triplet Hand Walk · 12/8 · 60 BPM · beginner · 4 measures
```
1  .  .  2  .  .  3  .  .  4  .  .
T  T  T  T  T  T  T  T  T  T  T  T
R  L  R  L  R  L  R  L  R  L  R  L
```
Teaches: the triplet grid, and that strict alternation over a 3-grouping means each pulse starts on the opposite hand. This is the core sensation of 12/8 drumming.

### Ex 12 — Pulse & Bass · 12/8 · 65 BPM · beginner · 4 measures
```
1  .  .  2  .  .  3  .  .  4  .  .
B  T  T  B  T  T  B  T  T  B  T  T
R  L  R  R  L  R  R  L  R  R  L  R
```
Bass always with the strong hand, marking the pulse. Teaches: hearing the 4 pulses inside 12 subdivisions.

### Ex 13 — Tiriba, 1st accompaniment · 12/8 · 70 BPM · intermediate · 4 measures
*Guinea (Baga / Landuma).*
```
1  .  .  2  .  .  3  .  .  4  .  .
B  -  -  T  T  -  S  -  -  T  T  -
R        R  L     R        R  L
```
Teaches: the first real 12/8 repertoire part; pairs land on subdivisions 1–2 of a pulse.

### Ex 14 — Sunguru Bani, 1st accompaniment · 12/8 · 70 BPM · intermediate · 4 measures
*Malinke.*
```
1  .  .  2  .  .  3  .  .  4  .  .
-  -  T  T  -  -  S  -  T  T  -  -
      R  L        R     R  L
```
Teaches: entering on the **third** subdivision — 12/8's equivalent of Ex 9's offbeat challenge. Notes straddle the pulse line.

### Ex 15 — Kakilambe, 1st accompaniment · 12/8 · 60 BPM · intermediate · 4 measures
*Guinea (Baga).*
```
1  .  .  2  .  .  3  .  .  4  .  .
B  -  -  B  -  -  T  T  S  -  -  -
R        L        R  L  R
```
Slow and ceremonial. Teaches: sustaining a sparse part at low tempo — patience, and consistent stroke quality with time to think between notes.

---

## 8. Stage D — Intermediate (Ex 16–20)

Sixteenth density, syncopation, longer forms, and finally a multi-section piece.

### Ex 16 — Soli (fast), accompaniment · 4/4 · 100 BPM · intermediate · 4 measures
*Malinke. Soli exists in both a slow 12/8 and a fast 4/4 version; this is the fast one.*
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
T  T  S  -  T  T  S  -  T  T  S  -  B  -  -  -
R  L  R     R  L  R     R  L  R     R
```
Teaches: sustained sixteenth density (12 notes/bar) and a three-note repeating cell that resets on beat 4.

### Ex 17 — Mendiani accompaniment · 4/4 · 95 BPM · intermediate · 8 measures
*Malinke — a young girls' dance rhythm.*
```
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
B  -  T  T  S  -  T  T  -  S  T  T  S  -  T  T
R     R  L  R     R  L     R  R  L  R     R  L
```
Teaches: syncopation — the slap on beat 3 displaces to the `e`. Doubles the exercise length to 8 measures (endurance).

### Ex 18 — Dunumba accompaniment · 12/8 · 75 BPM · intermediate · 8 measures
*Malinke — "dance of the strong men". Heavy bass, wide dynamics.*
```
1  .  .  2  .  .  3  .  .  4  .  .
B  -  T  -  T  -  S  -  T  T  -  -
R     L     R     R     R  L
```
Teaches: 12/8 with notes on subdivisions 1 and 3 of alternating pulses; dynamic contrast between the heavy bass and light tones. Longest 12/8 exercise.

### Ex 19 — Kuku call / heat-up · 4/4 · 95 BPM · intermediate · 8 measures
A two-bar phrase repeated four times. This is a **signal** part, not an accompaniment — the phrase that tells dancers and drummers a change is coming.
```
Bar 1:
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
T  T  S  -  T  T  S  -  T  T  S  -  T  T  S  -
R  L  R     R  L  R     R  L  R     R  L  R

Bar 2:
1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
B  -  -  -  B  -  -  -  B  -  -  -  -  -  -  -
R           L           R
```
Teaches: two-bar phrasing — the first exercise where the pattern doesn't reset every bar. Driving density resolving into space.

### Ex 20 — Kuku Full Cycle · 4/4 · 95 BPM · intermediate · 16 measures
Capstone. Four four-bar sections, no repeats within the exercise:

| Measures | Content |
| --- | --- |
| 1–4 | Ex 6 — Kuku accompaniment 1 |
| 5–8 | Ex 9 — Kuku accompaniment 2 (offbeat) |
| 9–12 | Ex 19 — call phrase (two-bar phrase ×2) |
| 13–16 | Ex 6 — return to accompaniment 1 |

Teaches: form. Switching parts mid-piece without dropping the pulse — the actual skill a djembe player needs in an ensemble, and the natural graduation point to advanced material.

---

## 9. Pattern provenance — verification results

I searched for published versions of each repertoire pattern (Ex 6–10, 13–20). Here is what was and wasn't findable, honestly reported.

### 9.1 What verification confirmed

- **The strong/weak hand convention** — confirmed twice over (§3.1). Both the written case convention and the Gun/Dun/Go/Do/Pa/Ta oral system encode strong vs. weak hand, not right vs. left.
- **Stroke definitions and phonetics** — bass = palm in the centre, tone = fingers near the edge, slap = sharp fingertip attack at the rim, per [djembefola](https://djembefola.com/learn/articles/djembe/sounds). "Pa–Pa–Gun–Go" = Slap–Slap–Bass–Tone, which independently corroborates the radial stroke positions in §12.2.
- **A documented Kuku version** — see 9.2, and it differs from mine.
- **That "no time signature" is itself traditional** — the [Djembe Font notation system](http://www.djembe.net/djembe-e.shtml) deliberately omits time and tempo signatures, since these rhythms aren't bound to Western metric conventions. Reassuring for §2.1's decision to model 12/8 as a triplet *feel* over `[4, 4]` rather than as true compound meter: the tradition doesn't insist on the distinction either.

### 9.2 Kuku — a published version differs from mine

[Upbeat Studio](https://upbeat.studio/blog/grooving-along-mastering-essential-djembe-patterns/) gives Kuku as a continuous sixteenth stream, one four-stroke cell repeated on every beat:

```
1  e  &  a   (×4, identical on every beat)
S  S  B  T
R  L  R  L
```

My Ex 6 is much sparser (`B - - - T - T - S - - - T - T -`, six strokes per bar). Both are plausibly "Kuku" — the published version is 16 strokes per bar, which is authentic in feel but far too dense for exercise 6 of 20. **I'm keeping the sparse version as a deliberate beginner reduction and labelling it as such**, with the dense version noted as the target it builds toward. That's a pedagogical choice now made explicitly rather than by accident.

Note also that this source applies mechanical `R L R L` sticking while using "Pa" twice for both hands, which conflicts with Pa/Ta being a strong/weak pair — so its sticking is best treated as indicative, not authoritative.

### 9.3 What I could not verify — regions documented instead

For Djole, Kassa, Yankadi, Tiriba, Sunguru Bani, Kakilambe, Soli, Mendiani and Dunumba, no usable published grid was reachable online. The authoritative sources are books — Dworsky & Sansby's *[How to Play Djembe: West African Rhythms for Beginners](https://dancinghands.com/products/download-of-how-to-play-djembe-book-cd-and-dvd)* and Mamady Keïta's repertoire collections — none of which expose patterns publicly.

Per your instruction, the region and cultural context is documented for each instead. This is genuinely useful independent of the notation, because it's what a region selector would key off (§11):

| Exercise | Rhythm | People / region | Country | Context |
| --- | --- | --- | --- | --- |
| 6 | Kuku | Manian / forest region | Guinea | Originally a women's dance on returning from fishing |
| 7 | Kassa | Malinke, Upper Guinea | Guinea | Harvest and field-work rhythm; *kassa* = granary |
| 8 | Djole | Temne | Sierra Leone | Mask dance, also played along coastal Guinea |
| 10 | Yankadi | Susu, coastal region | Guinea | Slow social / courtship dance, paired with the faster Makru |
| 13 | Tiriba | Baga / Landuma, Boké | Guinea | Coastal ceremonial rhythm |
| 14 | Sunguru Bani | Malinke, Upper Guinea | Guinea | *Sunguru* = young woman |
| 15 | Kakilambe | Baga, coastal region | Guinea | Ceremony for a forest spirit |
| 16 | Soli | Malinke, Upper Guinea | Guinea | Initiation rhythm; exists in slow 12/8 and fast 4/4 versions |
| 17 | Mendiani | Malinke, Kouroussa area | Guinea | Virtuoso young girls' dance |
| 18 | Dunumba | Malinke, Upper Guinea | Guinea | ["Dance of the Strong Men"](https://en.wikipedia.org/wiki/Yamadu_Bani_Dunbia) — a whole family of related rhythms |

Two things worth noticing in that table. Nine of the ten are **Guinea**, and most are **Malinke** — this repertoire is what it is because the modern djembe teaching tradition came west largely through Guinean national ensembles. And the exercises are already ordered so that the 12/8 block (13–15) is coastal Baga/Landuma material while the 4/4 blocks are inland Malinke — a real regional grouping I'd stumbled into by sequencing on difficulty alone.

### 9.4 Recommendation

The **structure, progression, meters and tempos** are mine to stand behind. The **specific note placements** for the nine unverified rhythms remain common teaching versions written from memory, and djembe repertoire varies genuinely by region, teacher and lineage — there is often no single correct version.

Before authoring the data files, check those nine against a source you trust — ideally a teacher. The repo has the right pipeline: export MusicXML and run `references/musicxml_to_beats.py` to generate the `beats: [...]` arrays (see `references/MUSICXML_IMPORT.md`), avoiding hand-transcription errors.

The technique drills (Ex 1–5, 11, 12) need no verification — they are drills, not repertoire.

## 10. Implementation order

1. ~~`transportTimeToMs` triplet support + tests (§2.1)~~ — ✅ **DONE**, 7 new tests
2. ~~Cross-instrument touch fixes (gotchas 4, 5)~~ — ✅ **DONE**
3. ~~Per-pad judgment flash (gotcha 1)~~ — ✅ **DONE**, 3 new tests
4. ~~`'djembe'` instrument type; `DjembePadFan` + `DjembePadGrid` behind a `padLayout` setting; synths with strong/weak asymmetry (§2.2)~~ — ✅ **DONE**
5. ~~Timeline: lane-per-stroke, colour-per-hand, adaptive lane count (§12.5)~~ — ✅ **DONE**
6. ~~Strict-mode `"stroke-hand"` comparison in `useTiming`~~ — ✅ **DONE, no code needed.** Free mode already judges timing only, and strict mode already compares `pad !== expectedNote` on the whole note string, which for djembe *is* `"stroke-hand"`. So strict mode enforces stroke **and** hand and free mode ignores both, exactly as decided — no djembe branch was added.
7. The 7 verification-free technique drills (Ex 1–5, 11, 12) — ✅ **DONE** in `data/exercises/djembe-beginner.ts`. The 13 traditional rhythms (Ex 6–10, 13–20) remain **gated on §9.4 pattern verification**.
8. Per the `CLAUDE.md` spec-change protocol: `CLAUDE.md` — ✅ **DONE**. `MANUAL_TESTS.md` — **still to do** (six-input pads, both layouts, left-handed mirroring, triplet timeline, strict-mode hand enforcement, safe-area/touch behaviour).

### What was built

| Area | Files |
| --- | --- |
| Types | `DjembeStroke`, `DjembeHand`, `DjembeNote`, `PadLayout`; `'djembe'` in `InstrumentType`; `padLayout` + `leftHanded` in `PracticeSettings` |
| Constants | `DJEMBE_*` in `timelineConstants.ts` — lane/radial order, hand colours + SVG fills, shapes, syllables, `parseDjembeNote`, `djembeNote`, `djembeHandSide` |
| Pads | `DjembePad` (wrapper), `DjembePadFan` (SVG sectors), `DjembePadGrid` |
| Timeline | `VerticalDjembeTimeline`; djembe branch + per-instrument constants in `VerticalTimeline` |
| Audio | `playDjembe(stroke, hand)` in `useAudio` — 2 membrane synths + 2 filtered noise chains |
| Wiring | `PracticeScreen` (handler, active strokes, render branch), `useDemoMode`, `SettingsPopover`, `InstrumentSelectScreen` |
| Data | `djembe-beginner.ts` (7 drills), `djembeCells.ts` (generator cells) |
| Tests | +28 — `DjembePad.test.tsx` (17), `VerticalDjembeTimeline.test.tsx` (7), plus djembe audio and stroke-extraction cases. **468 total, all passing** |

Fan geometry was verified numerically: every extreme point lands inside the 348 × 225 viewBox, with band thicknesses 74 / 64 / 62 px and per-hand arc lengths 65 / 114 / 161 px — matching §12.4's table.

## 11. Open items

- ~~**Timeline width**~~ — resolved in §12.5: lane per stroke, hand by colour.
- **Sticker predicates** — should djembe get its own achievement(s)? `utils/achievements.ts` currently has 13.
- **Dunun / accompanying parts** — every rhythm here also has bass-drum (dunun/sangban/kenkeni) parts. Out of scope, but they're what make these rhythms recognizable; worth considering as backing audio during playback later.
- **Advanced tier** — deliberately empty. Solo phrases and échauffements belong there once Ex 1–20 test well.
- **Region-based exercise selection** (future) — filter or browse exercises by where the rhythm comes from. §9.3's table is already the data for it: add `region` and `people` fields to `Exercise` and the selector falls out. It would give the app a genuine cultural-geography dimension, and the existing exercise-select sections could group by region instead of (or alongside) difficulty.

  **One scoping caveat, since you mentioned Tanzania:** the djembe is a *West* African instrument — Guinea, Mali, Burkina Faso, Ivory Coast, Senegal, Sierra Leone — and every rhythm in §9.3 is from Guinea or Sierra Leone. Tanzania is East African, and its percussion traditions (*ngoma* drumming, with a different drum family and repertoire) aren't djembe music. So a region selector spanning Tanzania isn't a filter over djembe exercises — it's a *new instrument*, closer in scope to the planned kalimba phase than to a djembe feature. Two coherent versions of the idea:

  1. **West African regions** — a filter over djembe repertoire: Upper Guinea Malinke, coastal Baga/Landuma, Susu, Temne/Sierra Leone. Works with the data as designed, ships with the exercise files.
  2. **Pan-African instruments** — Tanzanian *ngoma*, and other traditions, each as its own instrument with its own pads, sounds and repertoire. A much larger arc, and the more exciting product; worth its own spec phase.

  Both are good. Only the first is a djembe change.

---

# 12. Pad layout — phone-first design

## 12.1 The space budget doesn't close as sketched

Two measured constants make the §2.2 sketch (6 pads, 6 timeline columns) unbuildable on a small phone:

| Constant | Value | Consequence |
| --- | --- | --- |
| `DRUM_COLUMN_WIDTH` | 64 px | 6 columns = **384 px** — wider than a 375 px iPhone SE / 12-mini viewport |
| `VERTICAL_TIMELINE_HEIGHT` | 300 px | Fixed; leaves too little for pads (below) |
| `PX_PER_BEAT_VERTICAL` | 80 px | 300 px = 3.75 beats on screen |
| `HIT_LINE_POSITION_VERTICAL` | 0.7 | Lookahead above the hit line = 210 px = **2.6 beats** |
| `MARKER_SIZE` | 16 px | Too small to carry a legible "L"/"R" glyph |

Vertical budget, iPhone SE portrait in Safari (375 × ~620 px usable):

```
  48  navigation / exercise title
  56  BPM stepper + settings gear
 300  timeline (VERTICAL_TIMELINE_HEIGHT)
  16  gaps
 ────
 200  left for pads
```

200 px is not enough for three rows of anything tappable — it works out to 66 px per row *including* gutters, below the 64 px `min-h` the existing `DrumPad` already uses.

### The fix improves the timeline rather than degrading it

Give djembe its own two constants:

```
PX_PER_BEAT_VERTICAL_DJEMBE      = 56   (was 80)
VERTICAL_TIMELINE_HEIGHT_DJEMBE  = 240  (was 300)
```

| | Drums today | Djembe proposed |
| --- | --- | --- |
| Timeline height | 300 px | 240 px |
| Beats on screen | 3.75 | 4.3 |
| **Lookahead above hit line** | 2.6 beats | **3.0 beats** |
| Height left for pads | 200 px | **260 px** |

Denser pixel packing buys 60 px of pad height *and* half a beat more reading time. That matters more here than for drums: the player must pre-plan two attributes — stroke **and** hand — not one.

**Working area for pads: 351 × 260 px.**

## 12.2 Where the strokes actually are on the drum

This governs everything below, so it's worth stating precisely. The player sits behind the drum; hands strike from the near side.

| Stroke | Position on the head | Distance from player |
| --- | --- | --- |
| **Bass** | Centre of the head, full palm | **Furthest** — hand extends over the head |
| **Tone** | Fingers flat on the skin, just inside the rim | Near — hand pulled back |
| **Slap** | Fingertips at the rim edge, cupped and snapped | **Nearest** — hand pulled back |

Two consequences, both of which changed this design:

1. **Radial order is bass (inner) → tone → slap (outer/nearest).** If the screen's bottom edge is the edge nearest the child, a faithful layout puts **slap at the bottom and bass at the top**. An earlier draft of this section had bass at the bottom on a "low pitch reads low on screen" argument — that's backwards for any drum-shaped layout, and wrong even for the grid if we want spatial learning to transfer to a real drum. There is no conflict with app convention: `DRUM_COLUMN_ORDER` is left-to-right, so the low-at-bottom convention only exists in the legacy stacked `DRUM_LANE_ORDER`.

2. **Tone and slap are played at almost the same spot.** They differ by hand shape — flat fingers versus cupped and snapped — not by location; slap is only marginally further out. So the real drum gives the child almost *no* positional help with the distinction they will find hardest. On screen, that argues for making the tone/slap boundary the **generous** one: the widest gutter and the most separation go there, not between bass and tone. Neither a plain grid nor a naive three-equal-rings fan would produce that conclusion.

## 12.3 Option A — Hand Columns (grid)

Left column = left hand, right column = right hand; rows are strokes, ordered per §12.2.

```
 375 px ────────────────────────────────────────────
┌───────────────────────────────────────────────────┐
│  ←    Kuku · 1st accompaniment            ⚙       │  48
├───────────────────────────────────────────────────┤
│  ♩ 85 BPM    − +            [ Start ] [ Listen ]  │  56
├───────────────────────────────────────────────────┤
│    BASS          TONE           SLAP              │  18
│  ┌──────────┬──────────────┬──────────────┐       │
│  │ L     R  │  L        R  │  L        R  │       │
│  │          │      ◆       │              │       │  ↓ notes fall
│  │    ●     │              │              │       │
│  │          │  ◆           │              │       │  240
│  │          │              │       ▲      │       │
│  ├━━━━━━━━━━┿━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━┤       │  ← HIT LINE
│  │    ○     │              │              │       │
│  └──────────┴──────────────┴──────────────┘       │
├───────────────────────────────────────────────────┤
│   ┌────────────────┐    ┌────────────────┐        │
│   │      BASS      │ ┊  │      BASS      │        │  86   ← drum centre
│   │        ᴸ       │ ┊  │       ᴿ        │        │
│   └────────────────┘ ┊  └────────────────┘        │
│   ┌────────────────┐ ┊  ┌────────────────┐        │
│   │      TONE      │ ┊  │      TONE      │        │  86
│   │        ᴸ       │ ┊  │       ᴿ        │        │
│   └────────────────┘ ┊  └────────────────┘        │
│  ═══════ wide gutter — hardest distinction ══════ │
│   ┌────────────────┐ ┊  ┌────────────────┐        │
│   │      SLAP      │ ┊  │      SLAP      │        │  86   ← rim, nearest
│   │        ᴸ       │ ┊  │       ᴿ        │        │
│   └────────────────┘ ┊  └────────────────┘        │
│         165 px      20 px       165 px            │
│  ░░░░░░ safe-area-inset-bottom (home swipe) ░░░░░ │
└───────────────────────────────────────────────────┘
```

**Targets: 165 × 86 px** — 3.5× the area of the current 64 × 64 drum-pad minimum, well past Apple's 44 pt and Material's 48 dp floors. The 20 px centre gutter is deliberately dead space (gotcha 3), and the tone/slap gutter gets extra room per §12.2.

## 12.4 Option B — Reach Fan (pie sectors)

The drumhead's near section, rendered as an annular fan: the centre of the drum sits above the pad area with its apex clipped, bands radiate outward toward the child, and a centre line splits left hand from right.

```
                      ╷ drum centre (clipped, above)
        ╲             ╷             ╱
          ╲   BASS ᴸ  ╷  BASS ᴿ   ╱          inner  — furthest reach
            ╲_________╷_________╱
              ╲       ╷       ╱
                ╲ T ᴸ ╷ T ᴿ ╱                mid    — fingers on skin
                  ╲___╷___╱
        ══════════ wide radial gutter ══════  ← hardest distinction
                ╲     ╷     ╱
              ╲  S ᴸ  ╷  S ᴿ  ╱              outer  — rim, nearest
            ╲_________╷_________╱
       ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
                  child's body
```

*(Schematic — bands are true arcs, not straight lines. ASCII can't draw them; the geometry is in the table.)*

### Fan geometry — narrow beats wide

Counter-intuitively, a **narrower** fan gives **thicker** bands. Width is capped at 351 px, and width = 2 · r_outer · sin(θ), so shrinking the half-angle θ permits a much larger radius, and band thickness = (r_outer − r_inner) / 3:

| Total fan angle | Outer radius | Band thickness | Verdict |
| --- | --- | --- | --- |
| 150° | 181 px | 40 px | ✗ below touch minimums |
| 120° | 203 px | 48 px | ✗ marginal |
| 90° | 248 px | 63 px | acceptable |
| **80°** | **270 px** | **~68 px** | ✓ recommended |

80° total = 40° per hand, which is a realistic wedge for one hand's sweep across the head.

**Chosen geometry** (inner radius 60 px, apex clipped):

| Band | Radii | Thickness | Arc length per hand | Target |
| --- | --- | --- | --- | --- |
| Bass (inner) | 60–134 | 74 px | 68 px | 74 × 68 |
| *gutter* | 134–138 | 4 px | — | dead |
| Tone (mid) | 138–202 | 64 px | 119 px | 64 × 119 |
| *wide gutter* | 202–206 | — | — | dead (§12.2) |
| Slap (outer) | 206–270 | 64 px | 166 px | 64 × 166 |

Footprint **347 × 224 px**, versus the grid's 351 × 258.

**What the fan wins:**
- Physically faithful — a child who learns this layout has learned where the strokes live on a real drum. That's the whole point of the app.
- **Slap gets the largest target** (64 × 166) because it's outermost, and slap is the hardest stroke to produce. Happy accident.
- Every target still exceeds the existing 64 × 64 drum pad, bass included (74 × 68).
- Reads unmistakably as *a drum*, which matters for a five-year-old.

**What it costs:**
- Radial thickness 64–74 px versus the grid's 86 px, in the dimension where a slip means the wrong stroke.
- Bass — a frequent, forceful downbeat stroke — gets the *smallest* target, because inner arcs are short. Partly compensated by giving bass the thickest band (74 px).
- Only 34 px shorter than the grid, so **no timeline windfall**; my first estimate of ~90 px assumed a small-radius fan, which the band-thickness maths rules out.
- Real implementation cost (gotchas 11–13).

### Variant B2 — twin wrist-pivot fans

The hand pivots at the wrist, which rests near the rim — not at the drum's centre. Pivoting each fan at its own bottom screen corner tracks the actual sweep more closely and is the ergonomic maximum. Rejected as the primary: two separate fans read as *two drums*, which destroys the single-drumhead metaphor that makes option B worth building at all. Keep in reserve for a landscape or tablet layout.

## 12.5 Timeline — lane = stroke, colour = hand

An earlier draft proposed 3 lanes with hand encoded by horizontal offset (30 % / 70 % within each lane). That was the weak part of the design and it's been replaced. **The problem was never the three lanes — it was encoding hand by sub-lane position**, a low-salience spatial cue asking a five-year-old to judge whether a 16 px dot sits slightly left or slightly right inside a 108 px lane, while it scrolls.

### What shipping apps actually do

[Melodics](https://support.melodics.com/en/articles/6782770-beginners-guide-to-drums), a commercial drum-teaching app solving this exact problem, uses:

- **One lane per kit component** — lane position encodes *which drum*
- **Colour for the hand** — blue = left, yellow = right
- **A left-handed mode** that flips the layout and all content

[Taiko no Tatsujin](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/TaikoNoTatsujin) — the drum rhythm game famous for being readable by children — encodes the *striking surface* (drum face vs. rim, our tone vs. slap) as red vs. blue notes on a **single** lane, and leaves sticking entirely to the player. Its designers treat two-colour coding plus simple rules as the reason children need no tutorial.

Meanwhile the rhythm-game community standardises on [4- and 5-lane highways](https://apps.apple.com/mx/app/drumstrike/id6754662391); six is outside the norm.

### The design: swap the two channels

| Attribute | Encoded by | Why |
| --- | --- | --- |
| **Stroke** (bass/tone/slap) | **Lane position** + marker shape | Unambiguous, and lanes already exist |
| **Hand** (left/right) | **Fill colour** — blue / yellow | Pre-attentive; readable at a glance while scrolling |

```
         BASS              TONE              SLAP
   ┌──────────────┬──────────────┬──────────────┐
   │              │    ╔════╗    │              │   ← yellow = RIGHT
   │              │    ║ T  ║    │              │
   │   ┌──────┐   │              │              │   ← blue = LEFT
   │   │  B   │   │              │              │
   │              │  ┌──────┐    │              │
   │              │  │  T   │    │              │
   │              │              │   ╔══════╗   │
   │              │              │   ║  S   ║   │
   ├━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━┤   ← HIT LINE
   │   ┌ ─ ─ ┐    │              │              │   judged → hollow
   └──────────────┴──────────────┴──────────────┘
      117 px         117 px          117 px
```

Because markers no longer reserve room for two horizontal positions, they **centre in the lane and grow from 16 px to ~44 px** — large enough to carry a legible `B`/`T`/`S` letter, which gives stroke a third redundant channel (position + shape + letter).

Marker shapes reuse the existing `BeatMarker` vocabulary unchanged: bass `circle` (low), tone `diamond` (mid), slap `triangle` (high) — precisely the existing kick/snare/hihat mapping.

**Blue / yellow, specifically.** Two hues rather than six, and blue-vs-yellow survives red-green colourblindness where the app's existing red/orange/cyan palette would not. Melodics arrived at the same pair. Hand is *never* encoded by position, and stroke is *never* encoded by hue — so pad colour and lane colour stay independent and neither channel is overloaded.

### Lane count adapts to the exercise

Lane count = the number of distinct strokes the exercise actually uses:

| Exercises | Strokes used | Lanes |
| --- | --- | --- |
| Ex 1, 2, 3, 11, 12 | one (or bass+tone) | **1–2** |
| Ex 4, 5 | building up | 1–3 |
| Ex 6–10, 13–20 | bass + tone + slap | 3 |

So a beginner on Ex 1 sees a **single** lane of alternating blue and yellow circles — very close to Taiko's proven-readable presentation — and never meets three lanes until Ex 6, by which point hand alternation is already trained. This mirrors an established pattern in the codebase: `DrumPad` already adapts its grid to 2/3/5 active pads via `exerciseDrumPads()`, so `exerciseDjembeStrokes()` would drive lane count the same way.

Three lanes at 117 px also fits a 375 px viewport with margin to spare, so `DRUM_COLUMN_WIDTH`'s 64 px no longer constrains anything here.

## 12.6 Recommendation

| | A — Grid | B — Reach Fan |
| --- | --- | --- |
| Smallest target | 165 × 86 | 74 × 68 (bass) |
| Radial/stroke thickness | 86 px | 64–74 px |
| Footprint | 351 × 258 | 347 × 224 |
| Physical fidelity | none | high |
| Timeline correspondence | positions echo columns | requires translation |
| Build cost | reuses `DrumPad` wholesale | SVG paths, new hit-testing |

**DECIDED: Reach Fan (B) is the primary layout; Hand Columns (A) is selectable.**

The fan is the better idea — it's what makes this a djembe app rather than a six-pad app, and a child who learns it has learned where the strokes live on a real drum. Shipping it as primary makes physical fidelity the default experience rather than an opt-in.

The grid stays as a selectable alternative, which is exactly the escape hatch the fan's one real weakness needs: if the 74 × 68 px bass target proves too small for young hands at Ex 16's tempo, the answer is a settings toggle rather than a rebuild. Practically:

- `padLayout: 'fan' | 'grid'` in `PracticeSettings`, persisted alongside the other settings, exposed in `SettingsPopover`. Default `'fan'`.
- `DjembePadFan` and `DjembePadGrid` behind one `DjembePad` wrapper that picks on the setting. Both take identical props and emit identical `"stroke-hand"` taps, so nothing downstream — timeline, scoring, strict mode — knows which is mounted.
- Build the fan first. The grid is a near-copy of `DrumPad` and can follow.

**Still worth doing:** test the 74 × 68 px bass target with an actual child at 5 notes/second. It won't change the layout decision now, but it decides whether the grid needs promoting to the default for the youngest users, and whether the fan's band radii need retuning (bass could take more of the 224 px at slap's expense).

## 12.7 Non-obvious gotchas

Verified against current code. 1–10 apply to both layouts; 11–13 are fan-specific.

**1. Only one pad could flash at a time — the other hand looked broken. ✅ FIXED.**
`useTiming` exposed `lastTapFeedback` plus a *single* `lastFeedbackPad`, so every tap stole the flash from the previous pad and at speed only one hand appeared to respond. Replaced with a `padFeedback: Map<string, TapFeedback>` where each pad lights and clears on its own timer, and the flash duration is now the named constant `FEEDBACK_DURATION_MS`. Fixed for **all** instruments — `DrumPad`, `HandpanPad` and `StrumZone` now take a single `padFeedback` prop instead of the `lastFeedback` + `lastFeedbackPad` pair. Learn mode's wrong-pad flash moved to the same map, which also removed three `performance.now()` calls from `PracticeScreen`'s render path. **Done — 427 tests pass, 3 new tests cover simultaneous and independently-expiring flashes.**

**2. The 300 ms flash outlives the next note.**
Ex 16 at 100 BPM is ~5 notes/second — a 200 ms interval — so a 300 ms flash overlaps the following note. Now that each pad clears on its own timer (gotcha 1) this no longer *misattributes* colour to the wrong pad, but a pad re-tapped inside 300 ms still can't visibly re-flash. The duration is now the exported constant `FEEDBACK_DURATION_MS` in `useTiming.ts`, so giving djembe ~120 ms is a one-line change. **Partly handled — constant extracted, value unchanged at 300 ms.**

**3. Per-pad debounce does not catch a roll across the hand boundary.**
The 40 ms debounce in `useTiming` is keyed per pad (`lastTapTimePerPadRef`). A finger rolling across the L | R divide fires *two different* pads, so neither is debounced — a phantom extra tap which, in strict mode, scores as a wrong-hand miss. This is specific to hand-split layouts, and it's why the centre gutter is 20 px of genuinely dead space rather than a hairline. Consider also a global inter-tap floor (~25 ms) across all six targets. **Not handled.**

**4. Double-tap zoom and pull-to-refresh would fire during play. ✅ FIXED.**
`touch-action`, `overscroll-behavior` and `user-scalable` appeared **nowhere** in the repo. Rapid alternating taps are exactly what Safari and Chrome read as double-tap-to-zoom, and a downward flick becomes pull-to-refresh — reloading mid-exercise. Added Tailwind's `touch-manipulation` to every tap target (`DrumPad`, `HandpanPad`, `StrumZone`, `TapZone`) and `overscroll-behavior: none` on `html, body` in `index.css`. **Deliberately did not** add `user-scalable=no` / `maximum-scale=1` to the viewport meta tag: that would kill pinch-zoom for low-vision users, and per-target `touch-action` suppresses the double-tap gesture without that cost. Fixes existing drums, handpan and strumming too.

**5. The bottom row sits in the iOS home-indicator swipe zone. ✅ FIXED.**
The bottom ~20 px belongs to the system gesture, and per §12.2 that's the **slap** row — the outermost, largest, most inviting target. Hard taps near the bottom edge would occasionally dismiss the app. `Layout` now uses `pb-[calc(1.5rem+env(safe-area-inset-bottom))]`, so every screen inherits the inset. `env(` had appeared nowhere in the repo. Fixes all existing instruments too.

**6. "R" in the data should mean *strong hand*, not *right hand*.**
The sticking throughout §5–§8 assumes a right-handed player. A left-handed child needs the layout mirrored — and if `beat.note` literally stores `"tone-R"`, the mirror must be applied in *two* places (rendering **and** strict-mode judging), which is exactly where the bug will live. Store `"tone-strong"` / `"tone-weak"` and resolve to a physical side once, at render time. This is a data-convention decision, so it must be made **before** the 20 exercise files are authored — cheap now, expensive later.

**7. Tone.js `lookAhead` is 100 ms — half the inter-note gap.**
At 5 notes/second a 100 ms scheduling delay is 50 % of the interval, which reads as unmistakable lag on a reactive instrument. `DebugOverlay` and `audioDebugRef` already exist to measure exactly this. Lower `lookAhead` for djembe and confirm with the overlay. **Tooling handled, value not.**

**8. Ghost clicks are already solved — don't "fix" them.**
`DrumPad` uses `onPointerDown` with `e.preventDefault()`, so there's no `onTouchStart` + `onClick` double-fire. Note `CLAUDE.md` still describes the old `onTouchStart`/`onClick` arrangement and lists the approach ring as a future improvement, though `ApproachRing` exists and `DrumPad` renders it — the doc has drifted from the code. Copy `DrumPad`'s pointer handling verbatim. **Handled.**

**9. Space bar can't express a hand — keep it anyway.**
Existing pads map `Space` to the next expected pad; for djembe that resolves both stroke and hand automatically. That sounds like cheating but is valuable: it's the accessibility path, and it gives a legitimate "rhythm only, hands off" mode consistent with free-mode scoring. Keep it, with `DrumPad`'s `e.repeat` guard.

**10. Six keys need a hand-shaped mapping, inconsistent with drums.**
`s d f` = left bass/tone/slap, `j k l` = right — left cluster under the left hand, stroke order matching the on-screen order. This is *inconsistent* with the drum mapping (`f` = kick, `d` = snare, `j` = hihat), which was assigned per pad rather than per hand. Fine — different instruments — but it will feel odd when switching, so label keys on the targets as `DrumPad` already does.

**11. Curved hit areas need SVG paths, not `clip-path`.** *(fan only)*
An annular sector requires `clip-path: path()`, whose browser support is materially newer than the `clip-path: polygon()` the project already uses for `BeatMarker`'s triangle. `<path>` elements inside an SVG with pointer handlers give exact hit areas with universal support, and are the only way to get *real* radial gutters — with `clip-path`, adjacent sectors' bounding boxes overlap and z-order silently decides who receives the tap, which would quietly reintroduce gotcha 3.

**12. Labels in a curved band.** *(fan only)*
Text must sit at each band's mid-angle and be counter-rotated to stay upright — the same trick `BeatMarker` already uses for strum rotation. Curved text via `textPath` is not worth it at 64 px band thickness.

**13. The fan breaks positional correspondence with the timeline.** *(fan only)*
The timeline is linear columns; fan targets are radial. The child must translate between the two, relying on colour and shape rather than position. `CLAUDE.md` already lists "column-to-pyramid alignment (match drum column widths to pad centers)" as a known future improvement for the *existing* drums, so this mismatch is a pre-existing project concern that the fan sharpens rather than introduces.

## 12.8 Which gotchas need your input

Reviewed against the question "would a different answer change what you'd want built?" Most are engineering calls with one obviously correct answer, and they don't need you.

### Both decisions now settled

| # | Item | Decision |
| --- | --- | --- |
| 6 | `R`/`L` vs `strong`/`weak` | **`strong`/`weak`** — and verification showed this is the traditionally correct choice, not just the inclusive one (§3.1). Both the written case convention and the Gun/Dun/Go/Do/Pa/Ta oral system encode strong vs. weak hand. The synth reflects it too (§2.2). |
| — | Layout A (grid) vs B (fan) | **Fan primary, grid selectable** via `padLayout` in `PracticeSettings` (§12.6). Gotchas 11–13 are now in scope. |

### I'll just handle these — 8 items

| # | Item | Call |
| --- | --- | --- |
| 2 | 300 ms flash outlives the next note | ✅ Constant extracted (`FEEDBACK_DURATION_MS`); set djembe to ~120 ms when the instrument lands. |
| 3 | Cross-pad roll double-trigger | Wide dead gutter plus a ~25 ms global inter-tap floor. Pure correctness. **Still to do.** |
| 4 | Double-tap zoom / pull-to-refresh | ✅ **DONE** — `touch-manipulation` on all targets, `overscroll-behavior: none`. |
| 5 | Home-indicator swipe zone | ✅ **DONE** — `env(safe-area-inset-bottom)` in `Layout`. |
| 7 | Tone.js `lookAhead` 100 ms | Lower it and verify with the existing `DebugOverlay`. Measurable, no judgment needed. |
| 9 | `Space` = next expected | Keep, matching every other instrument. |
| 10 | Six-key keyboard mapping | `s d f` / `j k l`. Arbitrary but conventional; trivially changed later. |
| 11–13 | Fan-specific (SVG hit areas, curved labels, timeline correspondence) | Implementation detail. Now in scope, since the fan is primary. |

Gotchas 1, 4 and 5 also fixed latent problems in the **existing** drums, handpan and strumming screens, which is why they were done first.

### Separately: a pre-existing lint error, not mine

`npm run lint` fails on `src/components/practice/TapZone.tsx:30` — `performance.now()` called during render, the same `react-hooks/purity` rule my change had to satisfy. `TapZone` is untouched by this work (confirmed via `git diff`), and it's the fallback branch that no current instrument reaches, since drums/handpan/strumming are all handled explicitly. Flagging rather than fixing, per the surgical-changes convention. Its 300 ms timestamp check is now redundant anyway, because `useTiming` clears feedback itself.

## 12.9 Decide before the build starts

| Decision | Status | Notes |
| --- | --- | --- |
| Layout | ✅ Fan primary, grid selectable | `padLayout` in `PracticeSettings` |
| `beat.note` hand convention | ✅ `strong` / `weak` | Traditionally corroborated (§3.1) |
| Synth strong/weak asymmetry | ✅ Decided | Velocity + brightness, per §2.2 |
| Triplet engine support | ✅ Built | `Feel` type, 7 tests |
| Stroke order | ✅ Slap outer/near, bass inner/far (§12.2) | Applies to both layouts |
| Djembe timeline constants | Open | 56 px/beat, 240 px tall — set during the build |
| Handedness setting | Open | Add to `PracticeSettings`; reaches storage + settings popover |
| Pattern verification | **Open — yours** | Nine rhythms unverified (§9.3); gates the exercise data files |

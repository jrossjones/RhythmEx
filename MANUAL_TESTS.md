# RhythmEx — Manual Test Plan

Comprehensive manual test checklist covering all implemented phases.
Run `npm run dev` and open the app in a browser to execute these tests.

---

## Phase 1 — Scaffolding & App Shell

### 1.1 Home Screen
- [ ] App loads without errors and displays the Home screen
- [ ] Home screen shows app title/branding
- [ ] "Start" button is visible and has a 44px+ touch target
- [ ] Background has a gradient (Layout component)

### 1.2 Navigation Flow
- [ ] Clicking "Start" navigates to the Instrument Select screen
- [ ] Instrument Select shows at least "Drums" and "Handpan" options
- [ ] Back button on Instrument Select returns to Home
- [ ] Selecting "Drums" navigates to Exercise Select screen
- [ ] Exercise Select shows exercises grouped by difficulty (beginner/intermediate/advanced)
- [ ] Back button on Exercise Select returns to Instrument Select
- [ ] Selecting an exercise navigates to Practice screen
- [ ] Back button on Practice screen returns to Exercise Select

### 1.3 Exercise Data
- [ ] Beginner section shows 3 exercises (Quarter Notes, Half Notes, Whole Notes)
- [ ] Intermediate section shows 3 exercises (Eighth Notes, Dotted Rhythms, Extended Groove)
- [ ] Advanced section shows 3 exercises (Sixteenth Notes, Syncopation, Endurance Run)

### 1.4 UI Components
- [ ] All buttons are large enough for touch (44px+ targets)
- [ ] Page content is centered with a max-width container
- [ ] Star display renders 3 star positions (filled/unfilled)

---

## Phase 2 — Beat Display & Practice UI

### 2.1 Beat Timeline
- [ ] Timeline displays correct number of beat markers for the selected exercise
- [ ] Beat markers are color-coded by duration (quarter=indigo, eighth=sky, etc.)
- [ ] Measure divider lines appear between measures

### 2.2 Playhead & Animation
- [ ] Playhead is visible as a vertical line on the timeline
- [ ] Playhead starts at the left edge
- [ ] During playing phase, playhead moves smoothly left-to-right
- [ ] Playhead reaches the end when the exercise finishes

### 2.3 Countdown & Timeline Lead-in
- [ ] Clicking "Start" does NOT show a full-screen overlay
- [ ] A small countdown badge (round, top-right of timeline) displays 4, 3, 2, 1
- [ ] Countdown ticks are spaced at the exercise tempo (not fixed 1s)
  - Verify: at 120 BPM, each tick is ~500ms; at 60 BPM, each tick is ~1000ms
- [ ] During countdown, the timeline scrolls smoothly (empty runway, then beats approach hit line)
- [ ] After countdown completes, playing phase begins seamlessly (no overlay dismissal)
- [ ] The beat positions do NOT jump when Start is pressed — timeline starts from the same idle position

### 2.4 BPM Controls
- [ ] BPM +/- buttons are visible and show current BPM
- [ ] Clicking "+" increases BPM by 5
- [ ] Clicking "-" decreases BPM by 5
- [ ] BPM cannot go below 40
- [ ] BPM cannot go above 200
- [ ] BPM buttons are disabled during countdown/playing phases
- [ ] BPM changes are reflected in countdown tick speed

### 2.5 Exercise Lifecycle
- [ ] "Start" button visible in idle phase
- [ ] "Stop" button visible during playing phase
- [ ] Clicking "Stop" returns to idle state and resets the playhead
- [ ] Exercise auto-completes when the playhead reaches the end

---

## Phase 3 — Tap Input & Timing Feedback

### 3.1 TapZone (Non-Drum Instruments)
- [ ] Select Handpan instrument, then select any exercise
- [ ] Large tap zone is visible below the timeline
- [ ] Tapping/clicking the tap zone registers input during playing phase
- [ ] Pressing Space key registers a tap
- [ ] Touch input (`onTouchStart`) registers a tap on mobile
- [ ] Tap zone does not respond in idle/countdown phases
- [ ] Holding Space does not repeat-fire (event.repeat guard)

### 3.2 Visual Tap Feedback
- [ ] On-time tap: tap zone flashes green briefly (~300ms)
- [ ] Early/late tap: tap zone flashes yellow briefly
- [ ] Miss tap (bad timing): tap zone flashes red briefly
- [ ] Flash clears automatically after ~300ms

### 3.3 Beat Judgment on Timeline
- [ ] After tapping a beat, its marker changes color to reflect judgment
- [ ] On-time beats turn green
- [ ] Early/late beats turn yellow
- [ ] Untapped beats remain their original color until exercise ends

### 3.4 Stray Tap Handling
- [ ] Tapping when no beat is within 240ms does nothing (no flash, no match)
- [ ] Each beat can only be matched once (double-tapping doesn't double-count)

### 3.5 Finalization
- [ ] When exercise completes, any beats not tapped are counted as misses
- [ ] Navigates to Results screen after exercise ends

---

## Phase 4 — Results & Scoring with Per-Instrument Persistence

### 4.1 Results Screen Display
- [ ] Shows star rating (1-3 filled stars out of 3)
- [ ] Shows accuracy percentage
- [ ] Shows tap breakdown: colored stacked bar (green/yellow/orange/red)
- [ ] Shows legend with counts: On Time, Early, Late, Miss
- [ ] Shows "Retry" and "New Exercise" buttons

### 4.2 Star Thresholds
- [ ] >=90% accuracy shows 3 stars
- [ ] >=75% and <90% accuracy shows 2 stars
- [ ] <75% accuracy shows 1 star

### 4.3 Score Persistence
- [ ] Complete an exercise, note the score
- [ ] Retry the exercise — score persists across retries
- [ ] Navigate to Exercise Select — exercise shows best star rating
- [ ] Refresh the page (F5) — scores are preserved from localStorage

### 4.4 Per-Instrument Isolation
- [ ] Complete an exercise on Drums, note the score
- [ ] Select Handpan, complete the same exercise — starts fresh (no existing score)
- [ ] Return to Drums — original Drums score is still there

### 4.5 Personal Best
- [ ] First attempt: no "New Best!" badge shown
- [ ] Second attempt with equal/better accuracy: "New Best!" badge appears
- [ ] Second attempt with worse accuracy: no badge, shows "Personal best: X%"

### 4.6 Navigation from Results
- [ ] "Retry" button returns to Practice screen with same exercise
- [ ] "New Exercise" button returns to Exercise Select screen

---

## Phase 5a — Audio Engine & Drums

### 5.1 Audio Context
- [ ] No audio plays before user interaction (browser autoplay policy)
- [ ] First tap of "Start" initializes audio context
- [ ] Audio works after first user interaction

### 5.2 Drum Pad Display
- [ ] When instrument is Drums, drum pads replace the tap zone
- [ ] Pads are color-coded: kick=red, snare=orange, hihat=cyan, tom1=purple, tom2=pink
- [ ] Beginner exercises show 2 pads (kick + snare)
- [ ] Intermediate exercises show 3 pads (kick + snare + hihat)
- [ ] Advanced exercises show 5 pads (all)
- [ ] Grid layout adapts to pad count (2/3/5 pads)

### 5.3 Drum Pad Input
- [ ] Clicking/tapping a drum pad plays its sound
- [ ] Keyboard shortcuts work:
  - `f` = kick
  - `d` = snare
  - `j` = hi-hat
  - `k` = tom1
  - `l` = tom2
  - Space = next expected pad
- [ ] Each pad flashes with judgment color on tap (green/yellow/red)
- [ ] Only the tapped pad flashes (not all pads)
- [ ] Pads are disabled during idle phase
- [ ] Pads are visually enabled during countdown (taps silently ignored)

### 5.4 Drum Sounds
- [ ] Kick produces a low "boom" (MembraneSynth)
- [ ] Snare produces a snappy noise burst (NoiseSynth)
- [ ] Hi-hat produces a metallic "tss" (MetalSynth)
- [ ] Tom1 produces a medium-pitched drum sound
- [ ] Tom2 produces a slightly different tom sound

### 5.5 Metronome
- [ ] Metronome clicks during countdown (on each 4-3-2-1 tick)
- [ ] Metronome clicks on each beat during exercise playback
- [ ] Downbeat click is accented (higher pitch C5) vs normal beats (G4)
- [ ] Count-in ticks align with exercise tempo
- [ ] Toggling metronome off in settings silences all clicks
- [ ] Metronome toggle only works in idle phase

### 5.6 Settings Popover
- [ ] Gear icon visible in top-right of practice screen
- [ ] Clicking gear opens settings popover
- [ ] Clicking outside the popover closes it
- [ ] All toggles are disabled during playing/countdown phases

### 5.7 Tap Sounds Toggle
- [ ] "Tap Sounds" on (default): drum pads play sound on tap
- [ ] "Tap Sounds" off: tapping registers timing but plays no sound

### 5.8 Strict Mode
- [ ] Default is Free mode (Strict Mode off)
- [ ] **Free mode:** Any pad tap counts — only timing is judged
  - Tap kick when snare is expected → judges timing only, no penalty
- [ ] **Strict mode:** Must tap the correct pad
  - Tap kick when snare is expected → miss judgment regardless of timing
  - Tap the correct pad → normal timing judgment applies
- [ ] Strict mode only changeable in idle phase

### 5.9 Drum Timeline Colors
- [ ] Beat markers on timeline use drum pad colors (red/orange/cyan/purple/pink)
- [ ] After tapping, markers change to judgment colors (green/yellow/red)

---

## Phase 5a.1 — Multi-Lane Timeline, Scrolling, Speed Trainer

### 5a.1.1 Multi-Lane Drum Timeline
- [ ] Drum exercises show 5 horizontal lanes (stacked vertically)
- [ ] Lane order from top to bottom: HH, T1, T2, SN, KK
- [ ] Lane labels visible on the left side: HH, T1, T2, SN, KK
- [ ] Beat markers are placed in the correct lane matching their pad type
  - Kick beats in KK lane, snare beats in SN lane, etc.
- [ ] Lane labels remain fixed while timeline content scrolls
- [ ] Non-drum instruments (Handpan) still use single-row timeline

### 5a.1.2 Timeline Scrolling
- [ ] Short exercises (1 measure): no scrolling, beats use percentage positioning
- [ ] Long exercises (Extended Groove / Endurance Run): timeline scrolls horizontally
- [ ] Playhead stays pinned at approximately 30% from the left edge during scrolling
- [ ] Scrolling is smooth (GPU-accelerated translateX)
- [ ] All beats are accessible as the timeline scrolls past

### 5a.1.3 Drum Pad Idle Colors
- [ ] Disabled drum pads show muted versions of their color (not gray)
  - Kick pad: muted red, Snare pad: muted orange, etc.
- [ ] Colors match the timeline lane colors for visual association

### 5a.1.4 Longer Exercises
- [ ] "Extended Groove" (intermediate): 8 measures, ~32 beats, scrolling timeline
- [ ] "Endurance Run" (advanced): 16 measures, ~64 beats, uses all 5 pads, scrolling timeline
- [ ] Both long exercises play to completion and score correctly

### 5a.1.5 Speed Trainer
- [ ] Enable "Speed Trainer" toggle in settings (idle phase only)
- [ ] "Speed Trainer" badge appears next to settings gear
- [ ] Complete exercise with >=95% accuracy:
  - Results screen shows "Next: {bpm+5} BPM"
  - Clicking "Retry" starts at the new higher BPM
- [ ] Complete exercise with <95% accuracy:
  - Results screen shows "Next: {same bpm} BPM"
  - BPM does not change on retry
- [ ] BPM caps at 200 (does not exceed)
- [ ] Manually changing BPM (+/- buttons) resets speed trainer
- [ ] Selecting a new exercise resets speed trainer
- [ ] Speed trainer toggle is disabled during playing

---

## Phase 5a.2 — Tap Placement Markers, Loop Mode, Speed Trainer Polish

### 5a.2.1 Tap Placement Markers
- [ ] Play a drum exercise and tap some beats
- [ ] Thin vertical tick marks appear on the timeline at exact tap positions
- [ ] Tick marks are color-coded by judgment:
  - Green = on-time
  - Yellow = early/late
  - Red = miss
- [ ] Tick marks appear in the correct lane for the tapped pad
- [ ] Small filled dot visible at the center of each tick mark
- [ ] Tick marks persist for the entire exercise (not cleared after 300ms)
- [ ] Tick marks are visually distinct from beat markers (thinner, more transparent)

### 5a.2.2 Strict Mode Tap Markers
- [ ] Enable strict mode, play a drum exercise
- [ ] Tap the wrong pad intentionally (e.g., kick when snare expected)
- [ ] Red tick mark appears in the tapped pad's lane
- [ ] Hollow outline dot appears at the expected beat position in the expected pad's lane
  - Outline dot border color matches the expected pad's color

### 5a.2.3 Non-Drum Tap Markers
- [ ] Select Handpan, play an exercise
- [ ] Tap markers appear as vertical lines spanning full row height
- [ ] Color-coded by judgment (green/yellow/red)

### 5a.2.4 Loop Mode
- [ ] Enable "Loop Mode" toggle in settings (visible as 5th toggle)
- [ ] "Loop" badge appears next to Speed Trainer badge on practice screen
- [ ] Start and complete an exercise:
  - A brief overlay appears showing stars and accuracy percentage
  - Overlay auto-dismisses after ~2 seconds
  - Exercise restarts with 4-3-2-1 countdown and timeline lead-in
- [ ] Complete another loop — scores are saved each loop (check localStorage)
- [ ] Tap markers clear between loops (fresh timeline each loop)

### 5a.2.5 Seamless Loop
- [ ] Enable Loop Mode, then enable "Seamless" sub-toggle (indented under Loop Mode)
- [ ] Complete an exercise:
  - No overlay appears
  - Exercise restarts immediately with no countdown
  - Playhead wraps back to start seamlessly

### 5a.2.6 Loop Mode + Stop
- [ ] Enable loop mode and complete at least one loop
- [ ] During the second loop, press "Stop"
- [ ] Full Results screen appears showing the last completed loop's data
- [ ] Results screen data matches the last loop (not the current incomplete one)
- [ ] Score is not double-saved (check localStorage attempt count)

### 5a.2.7 Speed Trainer + Loop Mode
- [ ] Enable both Speed Trainer and Loop Mode
- [ ] Complete an exercise with >=95% accuracy:
  - Loop overlay shows "Next: {bpm+step} BPM"
  - After overlay dismisses, exercise restarts at the new higher BPM
- [ ] Complete with <95% accuracy:
  - BPM stays the same for the next loop
- [ ] BPM increases persist across loops (e.g., 120 -> 125 -> 130)

### 5a.2.8 Speed Trainer Step Presets
- [ ] Enable Speed Trainer in settings
- [ ] Three step buttons appear below the toggle: +2, +5, +10
- [ ] Default selected step is +5 (highlighted in emerald/green)
- [ ] Click "+2" — it becomes highlighted, +5 is no longer highlighted
- [ ] Complete exercise with >=95%: BPM increases by 2 (not 5)
- [ ] Click "+10" and verify 10 BPM increment on >=95% completion
- [ ] Step buttons are disabled during playing phase

### 5a.2.9 Speed Trainer Step + Loop Mode
- [ ] Enable Speed Trainer (step +10) + Loop Mode
- [ ] Complete with >=95%: next loop starts at BPM +10
- [ ] Verify BPM caps at 200 and does not exceed

### 5a.2.10 Settings Visibility Rules
- [ ] Speed trainer off: no step buttons visible
- [ ] Loop mode off: no "Seamless" sub-toggle visible
- [ ] Speed trainer on: step buttons (+2/+5/+10) visible
- [ ] Loop mode on: "Seamless" sub-toggle visible
- [ ] Total toggles with nothing expanded: 5 (Metronome, Tap Sounds, Strict Mode, Speed Trainer, Loop Mode)
- [ ] Total toggles with loop mode on: 6 (+ Seamless)

### 5a.2.11 Results Overlay
- [ ] Overlay has a semi-transparent dark background
- [ ] Shows star display matching the loop's star rating
- [ ] Shows accuracy percentage (rounded)
- [ ] When speed trainer is active: shows "Next: X BPM" hint
- [ ] When speed trainer is off: no BPM hint shown
- [ ] Auto-dismisses after approximately 2 seconds

---

## Phase 5b — Handpan Instrument

### 5b.1 Exercise Selection (Handpan)
- [ ] Select "Handpan" on the Instrument Select screen
- [ ] Exercise Select shows only handpan exercises (not drum exercises)
- [ ] Beginner section shows 3 exercises: Ding Pulse, Two-Note Melody, Ascending Scale
- [ ] Intermediate section shows 3 exercises: Kurd Flow, Ding & Ring, Cascade
- [ ] Advanced section shows 3 exercises: Handpan Rain, Syncopated Groove, Endurance Flow
- [ ] Back button returns to Instrument Select
- [ ] Select "Drums" — only drum exercises shown (no handpan exercises)

### 5b.2 HandpanPad UI
- [ ] When instrument is Handpan, circular pad layout replaces drum pads
- [ ] Center pad (ding) is larger (64×64px) than surrounding pads (52×52px)
- [ ] Surrounding tone field pads arranged in a circle around the center ding
- [ ] Each pad is color-coded by pitch class (e.g., D=orange, A=blue, Bb=violet)
- [ ] Pad labels show note names (e.g., "D3", "A3", "Bb3")
- [ ] Number of pads matches the exercise scale (8 or 9 pads for D Kurd)
- [ ] Pads are disabled during idle phase
- [ ] Pads are visually enabled during countdown (taps silently ignored)
- [ ] Disabled pads show muted versions of their color (not gray)

### 5b.3 Handpan Audio
- [ ] Tapping a pad produces a pitched FM synth tone (warm, resonant)
- [ ] Each pad produces a distinct pitch matching its note name
- [ ] Notes have natural sustain and decay (not abrupt cutoff)
- [ ] Reverb effect is audible on all handpan tones
- [ ] Multiple rapid taps produce overlapping tones (polyphonic)
- [ ] "Tap Sounds" off: tapping registers timing but plays no handpan sound
- [ ] No audio plays before user interaction (browser autoplay policy)

### 5b.4 Handpan Keyboard Input
- [ ] Number keys 1–9 trigger pads in order (1=ding/center, 2–9=tone fields)
- [ ] Space key triggers the next expected note during playing
- [ ] Space key triggers the first note (ding) when no note is expected
- [ ] Holding a key does not repeat-fire (event.repeat guard)
- [ ] Keys do not respond during idle phase (keyboard taps silently ignored during countdown)

### 5b.5 Handpan Timeline
- [ ] Handpan exercises use single-row timeline (not multi-lane)
- [ ] Beat markers are color-coded by note pitch class
  - D = orange, A = blue, Bb = violet, C = red, E = amber, F = green, G = teal, etc.
- [ ] Colors on timeline markers match the pad colors
- [ ] Playhead scrolls smoothly during playback
- [ ] Short exercises (4 measures): no scrolling, percentage positioning
- [ ] Long exercises (Cascade 8 measures, Endurance Flow 16 measures): scrolling timeline
- [ ] Tap markers (vertical tick lines) appear at tap positions, color-coded by judgment

### 5b.6 Handpan Strict Mode
- [ ] Default is Free mode: any pad tap counts for timing-only scoring
  - Tap D3 when A3 expected → judges timing only, no penalty
- [ ] Enable Strict mode in settings
  - Tap D3 when A3 expected → miss judgment regardless of timing
  - Tap the correct note → normal timing judgment applies
- [ ] Strict mode only changeable in idle phase

### 5b.7 Handpan with Practice Features
- [ ] **Metronome:** Clicks during countdown and playback, same as drums
- [ ] **BPM controls:** +/- buttons work, range 40–200, disabled during playing
- [ ] **Speed Trainer:** BPM increments on ≥95% accuracy, badge shown, "Next: X BPM" on results
- [ ] **Loop Mode:** Exercise auto-restarts after brief results overlay
- [ ] **Seamless Loop:** Exercise restarts immediately with no countdown/overlay
- [ ] **Score persistence:** Handpan scores saved independently from drum scores
  - Complete an exercise on Handpan, note the score
  - Switch to Drums — handpan score not shown (per-instrument isolation)
  - Switch back to Handpan — score preserved
- [ ] **Tap placement markers:** Tick marks appear at tap positions on single-row timeline
- [ ] **Results screen:** Shows stars, accuracy, tap breakdown, personal best comparison

---

## Pre-Phase 6 — Timeline Overhaul & Practice Improvements

### P6.1 Tap Debounce
- [ ] Play a drum exercise and very rapidly double-tap the same pad (e.g., mash `f` for kick)
  - Only one tap should register per beat, no double-triggers within ~40ms
- [ ] Rapidly tap two different pads in quick succession (e.g., `f` then `d` within 40ms)
  - Both taps should register (debounce is per-pad, not global)
- [ ] At 200 BPM with 16th notes (75ms apart), taps on the same pad should all register cleanly
  - 75ms > 40ms debounce, so no taps should be lost
- [ ] Handpan: rapidly double-tap the same note pad — only one tap registers
- [ ] Handpan: rapidly tap two different note pads — both register
- [ ] After resetting (Stop then Start), debounce state is cleared (first tap always registers)

### P6.2 Beat Marker Shapes
- [ ] **Drum exercises:** each pad type has a unique marker shape on the timeline:
  - Kick = circle
  - Snare = diamond (rotated square)
  - Hi-hat = triangle (pointing up)
  - Tom1 = square
  - Tom2 = rounded rectangle (wider than tall)
- [ ] Shapes are visually distinct from each other at a glance
- [ ] All markers are ~16px (larger than previous 10px markers)
- [ ] **Handpan exercises:** marker shapes are based on register:
  - Low register (octave ≤3) = circle
  - Mid register (octave 4) = diamond
  - High register (octave ≥5) = triangle
  - Ding (first note in scale) = full-width horizontal line bar

### P6.3 Marker Text Labels
- [ ] **Drum markers** have single-letter labels inside: K, S, H, T1, T2
  - Labels are readable (white text, 8px font, bold)
  - Diamond markers: label text is counter-rotated so it reads normally
- [ ] **Handpan markers** have pitch class labels inside: D, A, Bb, C, etc.
  - Labels match the note being played
- [ ] Labels are visible at default zoom/scale on both mobile and desktop
- [ ] Line-shape markers (handpan ding) can display a label

### P6.4 Hollow/Filled Marker States
- [ ] **Before tapping:** all beat markers are solid/filled with their pad/note color
- [ ] **After tapping a beat:** the marker transitions to a hollow outline
  - On-time → green border outline
  - Early/late → yellow border outline
  - Miss → red border outline
- [ ] Background becomes transparent when hollow (not the original fill color)
- [ ] Transition is smooth (not an instant snap — CSS transition visible)
- [ ] Untapped beats remain solid/filled throughout the exercise
- [ ] After exercise ends: unfilled beats (missed) also become hollow red outlines
- [ ] Next upcoming beat retains its pulse animation until it's tapped or passed

### P6.5 Vertical Timeline — General
- [ ] Timeline is displayed as a vertical note highway above the instrument pads
  - Notes appear at the top and drop downward toward a hit line near the bottom (Guitar Hero style)
- [ ] Hit line is a horizontal indigo bar at approximately 70% from the top
  - Small triangle pointer on the right side of the hit line
- [ ] At the start of the exercise, the first beat is at the hit line and future beats are visible above it
- [ ] During playback, beats scroll smoothly downward past the hit line
  - Already-played beats disappear below the hit line
  - Upcoming beats drop in from above
- [ ] The hit line stays fixed in position throughout the exercise — content scrolls, not the line
- [ ] Beat markers use the correct shapes, labels, colors, and hollow/filled states
- [ ] Measure divider lines appear as horizontal gray lines between measures
- [ ] Timeline has a white rounded card background with shadow

### P6.6 Vertical Timeline — Drums
- [ ] Drum exercises show equal-width vertical columns (one per active pad)
  - Beginner (2 pads): 2 columns
  - Intermediate (3 pads): 3 columns
  - Advanced (5 pads): 5 columns
- [ ] Column labels visible at the bottom: HH, T1, T2, SN, KK (matching active pads)
- [ ] Beat markers are positioned in the correct column for their pad type
- [ ] Columns are separated by subtle vertical dividers
- [ ] Tap markers (horizontal tick lines) appear in the correct column
- [ ] Short exercises: all beats visible without scrolling
- [ ] Long exercises (8+ measures): smooth vertical scrolling, hit line stays fixed

### P6.7 Vertical Timeline — Handpan
- [ ] Handpan exercises show a single wide column (~160px)
- [ ] **Ding notes** render as full-width horizontal bar (line shape) — very distinct
- [ ] **Other notes** are positioned with horizontal offsets based on their pad position:
  - Notes spread across the column width (not all stacked in the center)
  - Different notes at the same time occupy different horizontal positions
- [ ] Each marker has the correct shape (register-based), color (pitch class), and label (note name)
- [ ] Tap markers appear as horizontal tick lines
- [ ] Scrolling works correctly for long handpan exercises (8+ measures)

### P6.8 Listen/Demo Mode
- [ ] **"Listen" button** appears in the idle state, next to the "Start" button
- [ ] Pressing "Listen" starts the countdown (same 4-3-2-1 timeline lead-in as normal)
- [ ] After countdown, exercise plays with auto-fired beat sounds:
  - **Drums:** each drum sound plays at the correct time (kick/snare/hihat/toms audible)
  - **Handpan:** each pitched note plays at the correct time
- [ ] Timeline playhead and markers animate during demo (same as normal play)
- [ ] **Pads are visible but disabled** — cannot tap during demo
  - Drum pads show muted colors (disabled state)
  - Handpan pads show muted colors (disabled state)
- [ ] **"Listening..." badge** appears next to the settings gear during demo playback
- [ ] **"Stop" button** is visible during demo playback and stops the demo
- [ ] **Metronome** clicks during demo if metronome is enabled
- [ ] **On completion:** exercise returns to idle state (no results screen, no scoring)
- [ ] **After demo completes:** "Start" and "Listen" buttons reappear
  - Can immediately start a normal practice session or another listen
- [ ] **BPM controls:** Listen mode uses the current BPM setting
  - Change BPM to 60 → listen plays at 60 BPM
  - Change BPM to 180 → listen plays at 180 BPM
- [ ] Demo mode does not affect score storage (no scores saved)

---

## Pre-Phase 6b — Timeline Lead-in, Outro Scroll, Learn Mode

### P6b.1 Timeline Lead-in (Replaces Full-Screen Countdown)
- [ ] Clicking "Start" does NOT show a full-screen countdown overlay
- [ ] A small round countdown badge appears in the top-right corner of the timeline
- [ ] Badge shows 4, then 3, then 2, then 1 at tempo-aligned intervals
  - At 120 BPM: each tick is ~500ms (total ~2000ms)
  - At 60 BPM: each tick is ~1000ms (total ~4000ms)
- [ ] During countdown, the timeline scrolls smoothly — empty runway first, then beats approach the hit line
- [ ] Beats are NOT visible at the hit line during early countdown — they scroll into view
- [ ] After countdown, playing begins seamlessly (no overlay dismissal transition)
- [ ] "Stop" button is visible during countdown (user can abort the lead-in)
- [ ] Clicking "Stop" during countdown resets to idle

### P6b.2 Idle Timeline Position (No Jump)
- [ ] In idle state, the timeline shows the lead-in start position (beats above viewport)
- [ ] Pressing "Start" does NOT cause the beat positions to visually jump
- [ ] The transition from idle → countdown → playing is a smooth continuous scroll
- [ ] This works at different BPMs (40, 120, 200) — no jump at any tempo

### P6b.3 Outro Scroll (Beats Scroll Past After Exercise)
- [ ] Start an exercise and play through all beats
- [ ] After the last beat passes the hit line, the timeline continues scrolling for ~1 measure
- [ ] Beats animate past the hit line and disappear below before results appear
- [ ] The exercise does NOT freeze with the last beat sitting on the hit line
- [ ] Results screen / scoring fires after the outro scroll completes
- [ ] In loop mode: exercise restarts after outro scroll (not immediately at last beat)

### P6b.4 Outro Scroll with Seamless Loop
- [ ] Enable seamless loop mode
- [ ] Play through an exercise
- [ ] After the last beat, outro scroll plays briefly
- [ ] Exercise restarts at the new BPM (if speed trainer active) after outro
- [ ] Pads remain enabled during the seamless restart (not disabled)
- [ ] Seamless loop works repeatedly without pads getting stuck in disabled state

### P6b.5 Pads Enabled During Countdown
- [ ] **Drums:** Pads are visually active (colored, not grayed out) during countdown
- [ ] **Handpan:** Pads are visually active during countdown
- [ ] Tapping pads during countdown does NOT register timing (no judgment flash)
- [ ] Tapping pads during countdown plays instrument sounds if tap sounds enabled
- [ ] When playing phase begins, first tap registers normally

### P6b.6 Learn Mode — Start & Countdown
- [ ] **"Learn" button** appears alongside "Start" and "Listen" in idle state
- [ ] Pressing "Learn" starts a 4-beat countdown with timeline lead-in (same badge as normal)
- [ ] Metronome clicks during learn countdown if metronome is enabled
- [ ] Timeline scrolls smoothly during learn countdown
- [ ] After countdown, the first beat is positioned at the hit line
- [ ] **"Learning" badge** appears (similar to "Listening..." badge)
- [ ] "Stop" button is visible during learn countdown and active phase

### P6b.7 Learn Mode — Step-Through Gameplay
- [ ] During learn active phase, the next expected beat is highlighted at the hit line
- [ ] **Correct tap:** beat is marked as on-time (green hollow outline)
  - Timeline smoothly scrolls to position the next beat at the hit line
  - Scroll speed scales with tempo (faster BPM = faster scroll animation)
  - Instrument sound plays on correct tap
- [ ] **Wrong tap:** tapped pad flashes red briefly (~400ms)
  - Beat does NOT advance — stays on the same beat
  - No instrument sound on wrong tap
  - Red flash clears automatically
- [ ] Multiple wrong taps in succession: each re-flashes the wrong pad
- [ ] After clearing the red flash, the player can try again

### P6b.8 Learn Mode — Completion
- [ ] Tapping all beats correctly reaches the "done" phase
- [ ] After ~600ms, learn mode auto-resets to idle
- [ ] "Start", "Listen", and "Learn" buttons reappear
- [ ] No scoring, no results screen, no score saved
- [ ] Can immediately start another learn session, listen, or normal exercise

### P6b.9 Learn Mode — Stop & Settings
- [ ] Pressing "Stop" during learn mode resets to idle
- [ ] Settings popover is disabled (gear icon hidden or not functional) during learn mode
- [ ] BPM controls are disabled during learn mode
- [ ] Learn mode uses the current BPM for countdown and scroll animation speed

### P6b.10 Learn Mode — Handpan
- [ ] Select Handpan instrument, pick an exercise, press "Learn"
- [ ] Countdown and timeline lead-in work the same as drums
- [ ] Correct note tap advances to the next beat with smooth scroll
- [ ] Wrong note tap flashes red, does not advance
- [ ] Ding notes and other notes all work correctly in learn mode
- [ ] Handpan sounds play on correct tap

### P6b.11 Learn Mode — Edge Cases
- [ ] Tapping during learn countdown has no effect (no-op)
- [ ] Tapping after all beats completed (done phase) has no effect
- [ ] Starting learn mode twice resets state (starts fresh countdown each time)
- [ ] Switching between Learn, Listen, and Start: each mode works independently

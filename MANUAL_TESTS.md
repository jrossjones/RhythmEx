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

### 2.3 Countdown
- [ ] Clicking "Start" shows a full-screen countdown overlay
- [ ] Countdown displays 3, then 2, then 1, then "Go!"
- [ ] Countdown ticks are spaced at the exercise tempo (not fixed 1s)
  - Verify: at 120 BPM, each tick is ~500ms; at 60 BPM, each tick is ~1000ms
- [ ] After "Go!", the overlay disappears and the exercise begins

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
- [ ] Pads are disabled during idle/countdown phases

### 5.4 Drum Sounds
- [ ] Kick produces a low "boom" (MembraneSynth)
- [ ] Snare produces a snappy noise burst (NoiseSynth)
- [ ] Hi-hat produces a metallic "tss" (MetalSynth)
- [ ] Tom1 produces a medium-pitched drum sound
- [ ] Tom2 produces a slightly different tom sound

### 5.5 Metronome
- [ ] Metronome clicks during countdown (on each 3-2-1-Go tick)
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
  - Exercise restarts with 3-2-1 countdown
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

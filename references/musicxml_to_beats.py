#!/usr/bin/env python3
"""Convert a MusicXML score into RhythmEx `beats: [...]` arrays.

Splits a single part into two rhythmic voices by register (thumb/bass vs.
finger melody), honors ties (a tie-stop note is a SUSTAIN, not a new strike),
and emits drum + handpan beat arrays ready to paste into an exercise file.

See references/MUSICXML_IMPORT.md for the full rationale and gotchas.

Usage (Windows / Anaconda):
    C:/Users/jross/anaconda3/python.exe references/musicxml_to_beats.py references/Song.musicxml

Adjust the CONFIG block for a new song (register split, pad/scale mapping).
"""
import sys
import xml.etree.ElementTree as ET

# ---- CONFIG ---------------------------------------------------------------
BASS_MAX_MIDI = 48          # notes strictly below this (MIDI) are the bass voice (C3 = 48)
DRUM_BASS, DRUM_TREBLE = 'kick', 'hihat'
HANDPAN_DING = 'C3'         # bass -> center ding note of the chosen scale
DUR_CAP = 1920              # clamp sustain length to a half note for display
# ---------------------------------------------------------------------------

STEP = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
DUR_CODE = {480: '8n', 960: '4n', 1440: '4n.', 1920: '2n', 2880: '2n.', 3840: '1n'}


def midi(step, octave, alter=0):
    return 12 * (octave + 1) + STEP[step] + alter


def parse(path):
    """Return (bass_onsets, treble_onsets, END) in absolute divisions.

    Each onset is (abs_ticks, note_name). Only staff 1 is read (staff 2 is
    typically a TAB duplicate); reading stops at the first <backup> per measure.
    """
    root = ET.parse(path).getroot()
    div = int(next(root.iter('divisions')).text)
    meas_ticks = 4 * div  # assumes 4/4
    bass, treble = [], []
    mi = 0
    for m in root.iter('measure'):
        t_cur, cur_dur, started = 0, 0, False
        for n in m:
            if n.tag == 'backup':
                break
            if n.tag != 'note':
                continue
            p = n.find('pitch')
            if p is None:      # rest
                continue
            dur = int(n.findtext('duration'))
            s = p.findtext('step')
            o = int(p.findtext('octave'))
            alt = int(p.findtext('alter') or 0)
            is_chord = n.find('chord') is not None
            if not is_chord:
                t_cur += cur_dur if started else 0
                cur_dur, started = dur, True
            # a tie-stop note is a sustain, not a new attack
            if 'stop' in [e.get('type') for e in n.findall('tie')]:
                continue
            onset = mi * meas_ticks + t_cur
            md = midi(s, o, alt)
            (bass if md < BASS_MAX_MIDI else treble).append((onset, f"{s}{o}", md))
        mi += 1
    return bass, treble, mi * meas_ticks


def collapse(notes):
    """One onset per time; melody keeps the highest attacked note."""
    best = {}
    for onset, name, md in notes:
        if onset not in best or md > best[onset][1]:
            best[onset] = (name, md)
    return [(t, best[t][0]) for t in sorted(best)]


def tcode(abs_ticks, meas_ticks, div):
    within = abs_ticks % meas_ticks
    return f"{abs_ticks // meas_ticks}:{within // div}:{(within % div) // (div // 4)}"


def build(onsets, mapper, end, meas_ticks, div):
    rows = []
    for i, (t, name) in enumerate(onsets):
        nxt = onsets[i + 1][0] if i + 1 < len(onsets) else end
        rows.append((t, DUR_CODE.get(min(nxt - t, DUR_CAP), '4n'), mapper(name)))
    return rows


def emit(bass_rows, treble_rows, meas_ticks, div):
    merged = [(t, d, note, 0) for t, d, note in bass_rows] + \
             [(t, d, note, 1) for t, d, note in treble_rows]
    merged.sort(key=lambda x: (x[0], x[3]))  # bass first at coincident times
    out, last_m = [], -1
    for t, d, note, _ in merged:
        m = t // meas_ticks
        if m != last_m:
            out.append(f"      // M{m + 1}")
            last_m = m
        out.append(f"      {{ time: '{tcode(t, meas_ticks, div)}', duration: '{d}', note: '{note}' }},")
    return "\n".join(out)


def main(path):
    root = ET.parse(path).getroot()
    div = int(next(root.iter('divisions')).text)
    meas_ticks = 4 * div
    bass, treble, end = parse(path)
    b, t = collapse(bass), collapse(treble)

    print("--- DRUM beats ---")
    print(emit(build(b, lambda n: DRUM_BASS, end, meas_ticks, div),
               build(t, lambda n: DRUM_TREBLE, end, meas_ticks, div), meas_ticks, div))
    print("\n--- HANDPAN beats ---")
    print(emit(build(b, lambda n: HANDPAN_DING, end, meas_ticks, div),
               build(t, lambda n: n, end, meas_ticks, div), meas_ticks, div))
    print(f"\nmelody notes used: {sorted({n for _, n in t})}")


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'references/FleetwoodMac_R.musicxml')

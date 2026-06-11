# LESSONS.md — Self-correction log

Review at session start. Add an entry after any user correction.

## 2026-06-11 — Run preflight checks before implementing a plan; don't assume
**Correction:** Before approving the engagement-phase plan, the user asked "any preflight checks prior to starting implementation? please don't make assumptions."
**Pattern:** I had built a plan on claims from a design agent (lint clean, code facts) without verifying them myself first.
**Rule:** Before presenting an implementation plan, verify the baseline with actual commands: run `npm run test` / `lint` / `build`, confirm key code claims by reading the cited lines, and check `git status` for uncommitted work. Record the baseline in the plan so "no new failures" is measurable.
**Payoff that time:** The lint baseline was NOT clean (4 pre-existing `react-hooks/purity` errors), which forced a real design change — no `Math.random()`/`new Date()` during render; use seeded `mulberry32` in `useMemo` or module-level constants.

# FF-Sleeper — Changelog

All versions, decisions, and session notes. Append-only — newest at top.

---

## v1.9.20-beta — 2026-04-12 @ ~9:30 PM EST

### Changes
- `utils.js` — added `getSellNowSignal()` function with position-adjusted criteria (WR/RB/TE/QB) and urgency levels (CRITICAL/HIGH/MEDIUM)
- `league.html` — added Sell Now section at bottom of page; `renderSellNowSection()` shows all sell candidates from bottom 8 teams grouped by position, sorted by urgency then score desc
- `index.html`, `profile.html` — version bump only
- `CLAUDE.md` — Sell Now Framework added as locked section with full spec and backlog items

### Decisions
- Sell Now shows for bottom 8 teams by dynasty score (top 4 = contenders, bottom 8 = sellers)
- Both age AND exp must align to trigger (biology + NFL curve — neither alone is sufficient)
- Depth D1–2 only — job secure players get better trade value from contenders
- Layout: one combined section at bottom of league.html, grouped by position
- Player pricing, package logic, and PP API check deferred to backlog

### Why
- Framework locked in prior session, now implemented
- Gives rebuilding managers systematic view of who to move and when

## v1.9.19-beta — 2026-04-12 @ ~8:30 PM EST

### Changes
- `utils.js` — NEW FILE. All shared functions extracted here: player lookup, scoring engine, allocation, pick inventory
- `index.html` — gutted of all shared functions, now loads utils.js via `<script src="utils.js">`
- `league.html` — gutted of all shared functions, now loads utils.js
- `profile.html` — gutted of all shared functions (including minified scoring engine copies), now loads utils.js
- `CLAUDE.md` — utils.js added to File Structure
- **Bug fix in utils.js**: `DEFAULT_RANK` field name corrected (was `Default_Rank` in all three HTML files — caused defaultRank=9999 for all players, breaking allocation sort)
- **Bug fix in utils.js**: bench slot count now excludes IR and TAXI slots from total (was inflating bench count, pushing real players out)

### Decisions
- utils.js is the single source of truth for all shared logic — scoring, allocation, player lookup, picks
- HTML files contain only page-specific render/fetch logic
- Any fix to shared logic goes in utils.js only — never back into the HTML files
- Profile.html had its own minified scoring engine that was silently diverging — now eliminated

### Why
- Allocation logic was broken (wrong players getting Starter slots) — root cause traced to `Default_Rank` vs `DEFAULT_RANK` field name mismatch causing all defaultRanks to be 9999
- Shared code was duplicated across 3 files — bugs had to be fixed in 3 places, caused T1/T4 threshold drift between pages
- Refactor to utils.js eliminates the duplication problem permanently

---

## v1.9.18-beta — 2026-04-12 @ ~6:00 PM EST

### Changes
- `index.html` — T4 score color fixed `#f97316` → `#64748b`
- `league.html` — T4 score color fixed `#475569` → `#64748b`
- `profile.html` — T4 bar color fixed `#475569` → `#64748b` (both instances); T1 threshold fixed `>= 85` → `>= 90`; T2 boundary fixed `< 85` → `< 90`; tier labels updated to `T1=90+ · T2=60-89`
- `CLAUDE.md` — players.json format corrected to raw array; column list updated with all current fields; Page 2 description updated to include slot icons; T4 color corrected to `#64748b`; WR FA caps added to Scoring Backlog; version sync rule added; CHANGELOG rule added; CHANGELOG.md added to File Structure

### Decisions
- T4 = gray `#64748b` confirmed. Orange `#f97316` is for Trade status only, not T4 score tier
- All four files (index.html, league.html, profile.html, CLAUDE.md) must always be on the same version — enforced going forward from this version
- CHANGELOG.md created as separate file from CLAUDE.md to keep CLAUDE.md lean
- CLAUDE.md is operational reference only; CHANGELOG.md is history + decisions

### Why
- T4 color was inconsistent across files and conflicted with Trade status color
- T1 threshold was 85 in profile.html (bug) vs 90 everywhere else
- Version sync was not previously enforced — files had drifted

---

## v1.9.17-beta — 2026-04-12 @ ~4:30 PM EST

### Changes
- `league.html` — added full `allocateRoster()` logic (ported from index.html); `getStatusIcon()` helper added; `tepTier` computed once per league; allocation passed into `renderRosterDetail()`; slot icons (⭐🎯🪑🔀🗑️💔🚕) now shown in full roster detail; score-colored left border added to player rows; Exp/Depth added to player meta line
- `index.html` — `positionStarters` demoted from global to local `const` inside `allocateRoster()`; global declaration removed
- `CLAUDE.md` — Allocation Logic section updated; score-only icon mapping explicitly rejected as a rule

### Decisions
- Full `allocateRoster()` slot-counting logic is ALWAYS required for status icons — score-only mapping (90+=⭐ etc.) is explicitly rejected
- `positionStarters` is local to `allocateRoster()` — not a global. On league.html, league slot counts are computed once and allocateRoster() runs once per team (all 12 teams share same roster requirements)
- league.html is a specific league view — anything possible on index.html should be possible on league.html

### Why
- league.html roster detail had no slot icons — inconsistent with index.html
- Global `positionStarters` was poor original implementation — fixed opportunistically (noted: should have been confirmed first, process violation)

---

## v1.9.16-beta — 2026-04-12 @ ~3:00 PM EST

### Changes
- `index.html` — `getPosRankNum()` fixed: removed `split('_')`, now `parseInt(posRank)` directly; `allocateRoster()` posRankNum fixed same way; `renderPlayerItem()` posNum display fixed; DEF/UNK fallback posRank values changed from strings (`'DEF_001'`, `'UNK_000'`) to integers (`1`, `9999`)
- `league.html` — same posRank fixes as index.html
- `profile.html` — same posRank fixes as index.html

### Decisions
- `POS_RANK` in players.json is a plain integer — always was, always will be with EasyMorph export. No string parsing needed.
- DEF fallback posRank = `1`, UNK fallback posRank = `9999`

### Why
- **Critical bug**: scoring engine was returning 0 for every player. `getPosRankNum()` was calling `.split('_')` on an integer, producing `NaN`, falling back to 9999, meaning every player scored 0. This broke all dynasty scoring across all three pages.

---

## v1.9.15-beta — 2026-04-12 @ ~2:00 PM EST

### Changes
- `league.html` — T1 threshold fixed from `>= 85` to `>= 90` in three places: `dynastyGrade()`, T1 player filter in `renderLeague()`, score color in `renderRosterDetail()`
- `index.html` — removed old star logic block from `allocateRoster()` (was prepending `⭐ ` to `finalStatus` based on posRank thresholds); removed `.replace('⭐ ', '').trim()` strip in `renderPlayerItem()` since finalStatus is now always clean

### Decisions
- Star (⭐) is driven solely by `dynastyScore >= 90` in `renderPlayerItem()` — not by allocation logic
- Old posRank-based star thresholds in `allocateRoster()` were dead code — removed

### Why
- T1 threshold was 85 in league.html (bug) vs 90 everywhere else — inconsistent with locked tier definitions
- Old star logic in allocateRoster() was overwriting finalStatus unnecessarily; renderPlayerItem() was stripping it back out — circular and messy

---

## v1.9.14-beta — Prior sessions

### Summary
Last stable version before this session. Established:
- Full scoring engine (WR/RB/TE/QB) — LOCKED
- Tier definitions: T1=90+, T2=60-89, T3=35-59, T4=1-34, 0=cut
- Three-page app structure with nav, design system, pick inventory
- allocateRoster() on index.html with slot-counting logic
- profile.html with league selector, position tendencies, NFL team biases
- players.json updated to EasyMorph raw array format with expanded columns
- 2026 draft order confirmed for Couch Crusaders
- KTC benchmark documented for validation

### Known issues at this version (now fixed)
- posRank bug: scoring engine returning 0 for all players
- T1 threshold inconsistent (85 vs 90) across files
- T4 color inconsistent (#f97316 vs #64748b) across files
- positionStarters was a global variable
- league.html had no slot icons in roster detail
- Version numbers not in sync across files

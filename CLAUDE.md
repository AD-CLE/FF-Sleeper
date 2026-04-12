# FF-Sleeper — Project Instructions

## Project Overview
Fantasy football management app built on the Sleeper API.
Three-page HTML/CSS/JS app hosted on GitHub Pages.
No frameworks, no build tools — vanilla everything.

**Live URL:** https://ad-cle.github.io/FF-Sleeper/
**Repo:** https://github.com/ad-cle/FF-Sleeper
**Current Version: v1.9.20-beta**

---

## File Structure
```
FF-Sleeper/
├── index.html      — My Rosters (Page 1)
├── league.html     — League View (Page 2)
├── profile.html    — Manager Profiles (Page 3)
├── utils.js        — Shared utilities (scoring, allocation, player lookup, picks)
├── players.json    — Player data master (sourced from Excel via EasyMorph)
├── CLAUDE.md       — Project reference file
└── CHANGELOG.md    — Version history, decisions, and session log
```

---

## Version Control Rules
- Bump the version number on EVERY file output, even small fixes
- Version format: v1.9.x-beta — increment the patch number each output
- ALL four files (index.html, league.html, profile.html, CLAUDE.md) must always be on the same version number — bump all four in every output even if a file had no changes
- User decides when to move to next minor version
- Always present files for download/review BEFORE user pushes to GitHub
- Never tell the user to push — let them decide
- User pushes via GitHub Desktop

---

## Change Rules
- 🚨 GOLDEN RULE: Before writing any code, Claude must output a confirmation request in this exact format: "Ready to build: [summary of changes]. Confirm?" and stop. No code is written until the user explicitly replies yes.
- This applies to ALL changes — logic, cosmetic, one-liners, cleanups, and anything bundled with an approved change. No exceptions.
- If Claude recognizes mid-plan that an additional change is needed, it must stop, describe it, and get confirmation before proceeding.
- Always confirm before outputting a new file
- At the end of every session, append a new entry to CHANGELOG.md with: version, EST timestamp, what changed, which files, why it changed, and any decisions made that affect future work

---

## User Tools
- Windows PC with full admin access
- Proficient in Excel and EasyMorph
- GitHub Desktop for pushing to repo
- VS Code available

---

## Tech Stack
- Vanilla HTML/CSS/JS
- Sleeper API (no auth required, read-only)
  - GET /v1/user/username
  - GET /v1/user/user_id/leagues/nfl/year
  - GET /v1/league/league_id/rosters
  - GET /v1/league/league_id/users
  - GET /v1/league/league_id/traded_picks
  - GET /v1/league/league_id/drafts
- players.json — local player data file, loaded via fetch('players.json')
  - Format: raw JSON array [ {...}, {...} ] — no wrapper object
  - 528 players, sourced from Excel master on Dropbox, exported via EasyMorph
  - Columns: SLEEPER_ID, PLAYER_NAME, POSITION, AGE, TEAM, COLLEGE, DEPTH_CHART_POS, DEPTH_CHART_ORDER, YEARS_EXP, FANTASY_POSITIONS, POS_RANK, DEFAULT_RANK, DynastyNerds_SFTEP_Rk, DynastyNerds_SFTEP_Value, FantasyPros_Dynasty_Rk
  - "a": null sentinel column is intentional — detects new fields

## EasyMorph Export Settings
- Encoding: UTF-8, Don't write BOM ✅, Wrap in quotes: Never, Don't write column headers ✅
- Column name: players

---

## App Pages

### Page 1 — index.html (My Rosters)
- Username search → loads all leagues for that user (defaults to ankurdeora)
- Per league: scoring type, roster requirements, player allocation, draft picks
- Player status icons: ⭐ Star | 🎯 Starter/FLEX | 🪑 Bench | 🔀 Trade | 🗑️ Cut | 💔 IR | 🚕 Taxi
- ⭐ Star = score >= 90 (T1), shown IN ADDITION to slot icon (e.g. ⭐🎯 = Star + Starter)
- Dynasty score shown per player (WR/RB/TE/QB) using scorePlayer() engine
- Draft picks pulled live from /traded_picks API
- Own picks: show slot (e.g. 1.10) or round (1st)
- Acquired picks: labeled with original team name e.g. 1st (Aparatore)
- "View My Profile →" link on user card → profile.html?user=username

### Page 2 — league.html (League View)
- Defaults to CC league (1313956225737580544), auto-loads on open
- Each team card: dynasty point total, T1/T2/T3/T4 tier pill counts
- T1 players shown on each card (all 90+ players, sorted by score desc)
- Full pick inventory per team
- @manager link → profile.html?user=username
- Roster detail shows dynasty scores (color coded) + full slot icons (⭐🎯🪑🔀🗑️💔🚕) via full allocateRoster() logic
- Teams sorted by total dynasty score descending
- Grade labels (Contender/Middling/Rebuilding/Oblivious) removed pending score validation

### Page 3 — profile.html (Manager Profiles)
- Auto-loads ankurdeora on open, accepts ?user= URL param
- Step 1: League selector with checkboxes (all checked by default), Toggle All button
- Step 2: "Analyze Selected Leagues →" runs analysis on checked leagues only
- ← Back button to return to selector
- Shows:
  - Summary stats (avg dynasty score, avg T1, avg age, total leagues)
  - Selected leagues breakdown table (BEFORE roster profile)
  - Roster profile: position % + tier % side by side
  - Format tendencies (avg count + avg score per position)
  - NFL team biases (3+ players from same team)

---

## User Journey
1. **My Rosters** — how am I doing across all my leagues?
2. **League View** — how do I stack up in a specific league? Click manager → their profile
3. **Manager Profile** — deep dive on opponent before trading

---

## Dynasty Scoring Engine — scorePlayer()
Scores each player 0-99 based on POS_RANK × exp/depth modifier. Global 99 cap.

### Tier Definitions
| Tier | Score | Label |
|------|-------|-------|
| T1 | 90-99 | Elite / Star (⭐) |
| T2 | 60-89 | Solid starter |
| T3 | 35-59 | Depth/stash |
| T4 | 1-34 | Bench/speculative |
| 0 | 0 | Cut candidate |

### Non-SF QB Tier Adjustments (future feature)
| Tier | SF | Non-SF |
|------|----|--------|
| T1 | 90+ | 90+ |
| T2 | 60-89 | 85-89 |
| T3 | 35-59 | 70-84 |
| T4 | 1-34 | 1-69 |

---

## WR Scoring — LOCKED

Base curve (POS_RANK):
| Rank | Score |
|------|-------|
| 1-12 | 99-95 |
| 13-18 | 94-90 |
| 19-24 | 88-84 |
| 25-36 | 82-76 |
| 37-48 | 75-68 |
| 49-60 | 67-60 |
| 61-78 | 50-35 |
| 79-125 | 32-12 |
| 126+ | 0 |

Exp × Depth Matrix:
| Tier | Exp | D1 | D2 | D3 | D4+ |
|------|-----|----|----|----|-----|
| Rookie | 0 | 1.0x | 1.0x | 0.90x | 0.50x |
| Prime | 1-3 | 1.05x | 1.0x | 0.95x | 0.60x |
| Late Prime | 4-7 | 1.0x | 0.95x | 0.75x | 0.40x |
| Declining | 8+ | 0.85x | 0.80x | 0.60x | 0.20x |

Depth rules: #1-2 = co-starters | #3 = 0.95x | #4+ = 0.60x | IR = 1.0x | Taxi = rookie matrix
Caps: WR 100+ AND exp 9+ AND FA → 10 | WR 100+ AND FA → 15 | WR 100+ AND exp 9+ → 18

---

## RB Scoring — LOCKED

Base curve (POS_RANK):
| Rank | Score |
|------|-------|
| 1-6 | 99-95 |
| 7-12 | 94-88 |
| 13-24 | 87-78 |
| 25-36 | 77-68 |
| 37-48 | 67-55 |
| 49-60 | 54-42 |
| 61-85 | 38-18 |
| 86-101 | 15-5 |
| 101+ | 0 |

Exp × Depth Matrix:
| Tier | Exp | D1 | D2 | D3 | D4+ |
|------|-----|----|----|----|-----|
| Rookie | 0 | 1.0x | 1.0x | 0.90x | 0.40x |
| Prime | 1-3 | 1.05x | 1.0x | 0.90x | 0.50x |
| Established | 4-6 | 1.0x | 0.90x | 0.75x | 0.25x |
| Declining | 7-8 | 0.85x | 0.70x | 0.40x | 0.10x |
| Grandpa | 9+ | 0.75x | 0.40x | 0.15x | 0.05x |

Depth rules: #1-2 = committee, both 1.0x | #3 = 0.95x | #4+ = 0.35x | IR = 1.0x
Special: depth 0/NA + exp 0 → depth #3 | depth 0/NA + exp >0 → depth #4+ | depth 5+ → #4+

---

## TE Scoring — LOCKED (1.5TEP native)

Base curve (POS_RANK):
| Rank | Score |
|------|-------|
| 1-6 | 99-95 |
| 7-12 | 94-88 |
| 13-24 | 87-72 |
| 25-36 | 68-50 |
| 37-48 | 45-25 |
| 49+ | 0 |

Exp × Depth Matrix:
| Tier | Exp | TE1 | TE2 | TE3 | FA/Cut |
|------|-----|-----|-----|-----|--------|
| Rookie | 0 | 1.0x | 0.90x | 0.60x | 0.20x |
| Young | 1-3 | 1.05x | 0.85x | 0.55x | 0.15x |
| Prime | 4-9 | 1.0x | 0.80x | 0.45x | 0.10x |
| Declining | 10+ | 0.80x | 0.50x | 0.20x | 0.05x |

Special: Kenyon Sadiq → depth #1 | Eli Stowers → depth #2 | other exp 0 NA → depth #3

---

## QB Scoring — LOCKED (SF native)

Base curve (POS_RANK):
| Rank | Score |
|------|-------|
| 1 | 99 |
| 2-12 | 97→85 linear |
| 13-18 | 85→80 |
| 19-24 | 80→70 |
| 25-36 | 70→60 |
| 37-64 | 60→5 |
| 65+ | 0 |

Exp × Depth Matrix:
| Tier | Exp | QB1 | QB2 | QB3 | FA/Cut |
|------|-----|-----|-----|-----|--------|
| Rookie | 0 | 1.00x | 0.95x | 0.50x | 0.20x |
| Young | 1-3 | 1.02x | 0.90x | 0.40x | 0.15x |
| Prime | 4-7 | 1.00x | 0.80x | 0.30x | 0.10x |
| Late Prime | 8-12 | 0.97x | 0.60x | 0.20x | 0.05x |
| Declining | 13+ | 0.85x | 0.30x | 0.10x | 0.02x |

QB T1 players (90+, 8 players): Maye 99, Daniels 98, Williams 97, Allen 96, Burrow 93, Lamar 91, Herbert 90, Dart 90

Notes:
- DN ranks are SF-based
- QB modifier is tenure (years exp) only — no separate age penalty
- 1QB flattening = future feature (Non-SF tier shifts: T2=85-89, T3=70-84, T4=1-69)
- Rushing QB bonus = future feature (needs IS_RUSHING_QB field)

---

## Allocation Logic — Current State
- allocateRoster() assigns KEEP/Trade/Cut then Starter/FLEX/Bench/Trade/Cut based on roster slots
- positionStarters is a LOCAL variable inside allocateRoster() — fixed, no longer a global
- Star flag driven by score >= 90 (T1), stacks with slot icon: ⭐🎯 = Star + Starter
- Status icons: ⭐ Star (score>=90) stacks with 🎯 Starter | 🪑 Bench | 🔀 Trade | 🗑️ Cut
- league.html: tepTier and positionStarters computed ONCE per league (all 12 teams share same slots), passed into allocateRoster() per roster

## Allocation Logic Rules — ALWAYS follow
- ALWAYS use the full allocateRoster() slot-counting logic for status icons — never use score-only icon mapping as a shortcut
- Score-only mapping (90+=⭐, 60-89=🎯 etc.) is explicitly rejected — it ignores actual roster construction
- league.html computes league slot counts once, runs allocateRoster() once per team

---

## Sell Now Framework — LOCKED (built in league.html)
Identifies aging vets on rebuilding teams (bottom 8 by dynasty score) with high trade value to contenders now but declining dynasty value in 1–2 years.

### Criteria by position
| Position | Score | Age | Exp | Depth |
|----------|-------|-----|-----|-------|
| WR | 55–84 | 27+ | 6–10 | D1–2 |
| RB | 55–80 | 26+ | 5–7 | D1–2 |
| TE | 55–80 | 30+ | 9–12 | TE1–2 |
| QB | 55–80 | 35+ | 10+ | QB1–2 |

### Urgency levels
- CRITICAL 🚨 — age 32+/exp 9+ (WR), age 30+/exp 7+ (RB), age 33+/exp 11+ (TE)
- HIGH 🔥 — standard hit
- MEDIUM ⚠️ — lower end of criteria

### Notes
- Both age AND exp must align to trigger (biology + NFL curve)
- Depth D1–2 only — job secure = better trade value to contenders
- Target buyers = top 4 teams by dynasty score (contenders with capital)
- UX: Combined section at bottom of league.html, grouped by position, sorted by urgency then score desc

### Backlog (not yet built)
- Player pricing (what's a 30yo T2 WR worth in picks/assets)
- Package logic (1-for-many, many-for-many trade construction)
- Potential Points API check (unresolved — currently using allocateRoster "not starting" as proxy)
- Show on profile.html per manager
- Dedicated Sell Now page (future)

---
- WR FA caps not yet implemented: WR 100+ AND exp 9+ AND FA → 10 | WR 100+ AND FA → 15 | WR 100+ AND exp 9+ → 18
- Pick capital scoring (framework locked, not yet in grade)
- 1QB league QB curve flattening
- Rushing QB multiplier (needs IS_RUSHING_QB in players.json)
- COLLEGE column in players.json (for college bias feature)
- Starter weighting (3x starters, 1x bench) — not yet applied
- Grade labels (Contender/Middling/Rebuilding/Oblivious) cutoffs — TBD after score validation
- Age profile by position on profile page
- T1 player breakdown (crown jewels) on profile page
- Consistency score across leagues on profile page
- Trade intel (overweight/underweight positions) on profile page
- Extend Manager Profiles to show all 11 CC managers automatically

---

## Pick Scoring Framework — LOCKED (not yet in grade logic)
| Pick | Points |
|------|--------|
| 2026 1.01 | 20 |
| 2026 1.02-1.05 | 15 |
| 2026 1.06-1.09 | 10 |
| 2026 1.10-1.12 | 4 |
| 2026 Rd 2 | 3 |
| 2026 Rd 3-4 | 1 |
| 2027 1st top tier (orig picks 1.01-1.04) | 15 |
| 2027 1st mid tier (orig picks 1.05-1.08) | 10 |
| 2027 1st low tier (orig picks 1.09-1.12) | 6 |
| 2027 Rd 2 | 4 |
| 2027 Rd 3-4 | 0 |
| 2028 any 1st | 10 |
| 2028 Rd 2+ | 0 |

---

## 2026 Draft Order — Couch Crusaders (CONFIRMED)
| Slot | Team | Roster ID |
|------|------|-----------|
| 1.01 | GothamCityToymen | 7 |
| 1.02 | Aparatore | 8 |
| 1.03 | Two Minute Drill | 11 |
| 1.04 | JC1929 | 12 |
| 1.05 | Unicorns and Rainbows | 10 |
| 1.06 | The Largest Chubb | 5 |
| 1.07 | The Frank Solich Haunting | 9 |
| 1.08 | Bear Goggles | 6 |
| 1.09 | Die-Nasty | 18 |
| 1.10 | Snake Oil Liniment | 3 |
| 1.11 | Valyrian Steelers | 2 |
| 1.12 | InCambellWeTrust | 4 |

Note: GothamCityToymen co-owner user_id 1264427906721914880 — not in draft_order object, slot 1 confirmed missing.

---

## KTC Benchmark — Couch Crusaders (for validation)
| Rank | Team | KTC |
|------|------|-----|
| 1 | Snake Oil Liniment | 99 |
| 2 | InCambellWeTrust | 94 |
| 3 | Die-Nasty | 92 |
| 4 | Bear Goggles | 90 |
| 5 | Valyrian Steelers | 80 |
| 6 | JC1929 | 77 |
| 7 | Unicorns and Rainbows | 72 |
| 8 | The Largest Chubb | 71 |
| 9 | GothamCityToymen | 68 |
| 10 | Two Minute Drill | 67 |
| 11 | The Frank Solich Haunting | 66 |
| 12 | Aparatore | 62 |

---

## Design System
- Dark theme: background #0f172a → #1e293b
- Accent: #fbbf24 (amber/gold)
- Font: system-apple/Segoe UI stack
- Nav: sticky, rgba(10,16,30,0.95), amber brand color
- Score colors: T1 amber #fbbf24 | T2 green #34d399 | T3 slate #94a3b8 | T4 gray #64748b | 0 red #ef4444
- Status colors: green #34d399 starters | orange #f97316 trade | red #ef4444 cut

---

## Key League
| Field | Value |
|-------|-------|
| Name | Couch Crusaders FFL |
| League ID | 1313956225737580544 |
| Format | 12 teams, SF PPR 1.5TEP |
| Season | 2026 |
| User's team | Snake Oil Liniment |
| Username | ankurdeora |

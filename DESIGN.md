# DESIGN.md — KinoBeat Studio Surface Expression

## 1. Design Read
> *Reading this as: professional NLE workstation for film editors and generative creators, leaning toward precision-tool dark — quiet, dense, the chrome disappears and the work remains.*

### Dials
- **Mode**: `Operate`
- **VARIANCE**: `4` (balanced modular control grid)
- **MOTION**: `3` (restrained, functional, sub-250ms transitions)
- **DENSITY**: `7` (pro technical density, aligned SMPTE readouts, compact drawers)

---

## 2. Color System: Studio Dark (Graphite + Amber Accent)

Purged all first-order and second-order AI tells (banned: neon cyan `#00F0FF`, neon magenta `#FF00FF`, rainbow track icons, fuzzy glows).

| Role | Token / Hex | OKLCH Equiv | Purpose |
|---|---|---|---|
| Canvas Background | `--bg-canvas: #090B0E` | `oklch(0.11 0.007 255)` | Base viewport and graph background |
| Panel Surface | `--bg-surface: #10141B` | `oklch(0.14 0.007 255)` | Node cards, toolbar, drawers |
| Elevated Surface | `--bg-elevated: #161C26` | `oklch(0.18 0.008 255)` | Buttons, hover states, inputs |
| Hairline Border | `--border-subtle: #1C2331` | `oklch(1 0 0 / 0.07)` | 1px clean card and header borders |
| Strong Border | `--border-strong: #242E40` | `oklch(1 0 0 / 0.13)` | Active selections and focus boundaries |
| Primary Text (Ink) | `--text-primary: #F1F4F9` | `oklch(0.93 0.006 80)` | High-contrast readable typography |
| Secondary Text | `--text-secondary: #94A0B4` | `oklch(0.68 0.007 80)` | Labels, metadata, units |
| Muted Text | `--text-muted: #626F84` | `oklch(0.50 0.005 80)` | Inactive icons, timestamps |
| Primary Accent | `--accent-primary: #F59E0B` | `oklch(0.76 0.11 75)` | Single studio amber accent (<5% area) |
| Semantic Success | `--status-success: #10B981` | `oklch(0.55 0.14 155)` | Engine Ready indicator, render complete |

---

## 3. Typography System
- **Display Face**: `Space Grotesk` (500, 600) — used for brand mark and modal headers.
- **UI & Controls**: `Geist` — clean, neutral grotesque with high legibility at 11–13px.
- **Telemetry & Numerics**: `Geist Mono` with `font-variant-numeric: tabular-nums` enforced on all SMPTE clocks, frame counters, BPM values, and timestamps.

---

## 4. Radius & Elevation
- **Radius Scale**: Locked to 8px (`rounded-lg` for cards, `rounded-md` for controls). No mixing of pill buttons with brutalist square cards.
- **Depth**: Surface tone separation over heavy drop shadows. Crisp 1px borders without colored halos.

---

## 5. Motion Personality
- Archetype: **Snappy** for toggles and buttons (150–180ms, `cubic-bezier(0.2, 0, 0, 1)`).
- Drawers and Modals: **Smooth** (240ms, `cubic-bezier(0.16, 1, 0.3, 1)`).
- Reduced Motion: Instant state change fallback via `@media (prefers-reduced-motion: reduce)`.

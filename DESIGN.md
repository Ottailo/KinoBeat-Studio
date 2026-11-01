# DESIGN.md — KinoBeat Studio Surface Expression & Design Contract

> **Framework**: Next.js 15, React 19, Motion (`motion/react`), Remotion 4.x, Tailwind CSS v4, Web Audio API  
> **Governing Skill**: [`design`](../../.agents/skills/design/SKILL.md)  
> **Design Archetype**: **Archetype H (Monochrome + One / Tactile Hardware Precision)** intertwined with **Archetype D (Alive / Kinetic Spring Physics)**

---

## 1. MANDATORY GATE 0: THE DESIGN CONTRACT

```text
DESIGN CONTRACT
───────────────
Product Truth    : KinoBeat is an industrial, local-first generative AI video and audio-reactive NLE workstation that synchronizes multi-model DiT prompts and 6-DOF optical camera paths directly to real Web Audio transient waveforms for filmmakers, motion designers, and beatmakers.
Surface Mode     : OPERATE
Design Read      : Tactile hardware video editing console combining Teenage Engineering / Ableton physical studio precision with cinematic anamorphic director monitors, spring-reactive jog-shuttle transport, and live 48kHz audio transient bloom.
Chosen Archetype : Archetype H (Monochrome + One / Tactile Hardware Precision) + Archetype D (Alive / Kinetic Spring Physics)
MOTION_INTENSITY : 8/10 — Framer Motion (`motion/react`) zero-re-render pointer physics, spring micro-interactions (stiffness: 350, damping: 28), and dynamic audio FFT pulse
VISUAL_DENSITY   : 8/10 — Professional NLE workstation density with aligned SMPTE timecodes, physical rotary/slider jog controls, track header badges, and compact camera optics drawers
Signature Element: Kinetic Anamorphic Jog-Shuttle Scrubber with Dynamic FFT Waveform Bloom & Tactile Spring Frame Snapping
Typography       : Space Grotesk (Display) / Geist (UI & Body) / Geist Mono (SMPTE Timecodes, Tabular Metrics)
Accent Color     : #FF5500 (Teenage Engineering Signal Orange, oklch(0.68 0.24 38))
Anti-defaults    : Rejected generic SaaS dark obsidian glow cards with rainbow borders; rejected static motionless grids in favor of physical tactile hardware surfaces with spring-physics micro-interactions
```

---

## 2. Semantic Token Architecture (OKLCH Light / Dark & Hardware Bedrock)

Defined in perceptual OKLCH color space for lightness fidelity:

| Semantic Token | Value / Hex | OKLCH Equiv | Purpose |
|---|---|---|---|
| `--bg-canvas` | `#121317` | `oklch(0.14 0.006 250)` | Deep carbon bedrock and graph canvas |
| `--bg-surface` | `#191B22` | `oklch(0.18 0.008 250)` | Machined slate panels, drawers, toolbars |
| `--bg-elevated` | `#21242E` | `oklch(0.22 0.010 250)` | Raised control decks, active buttons, pills |
| `--bg-recessed` | `#0D0E12` | `oklch(0.11 0.005 250)` | Recessed machine cutouts, wells, jog dial |
| `--border-subtle` | `rgba(255,255,255,0.08)` | `oklch(1 0 0 / 0.08)` | Hairline structural borders (1px) |
| `--border-medium` | `rgba(255,255,255,0.14)` | `oklch(1 0 0 / 0.14)` | Interactive element boundaries |
| `--border-strong` | `rgba(255,255,255,0.24)` | `oklch(1 0 0 / 0.24)` | Active selections and focused headers |
| `--accent-primary` | `#FF5500` | `oklch(0.68 0.24 38)` | The ONE Accent: Signal Orange (<5% screen area) |
| `--accent-glow` | `rgba(255,85,0,0.35)` | `oklch(0.68 0.24 38 / 0.35)` | Tally lamp and transient peak glow |
| `--text-primary` | `#FFFFFF` | `oklch(0.98 0 0)` | Pure structural ink |
| `--text-secondary`| `#E2E8F0` | `oklch(0.85 0.006 240)` | High-contrast readable typography |
| `--text-muted` | `#94A3B8` | `oklch(0.65 0.008 240)` | Secondary metadata, units, focal lengths |
| `--text-dim` | `#64748B` | `oklch(0.48 0.008 240)` | Inactive icons, subtle grid marks |

---

## 3. Kinetic Motion & Micro-Interactions

* **Framer Motion (`motion/react`)**:
  - Tactile controls: `{ stiffness: 350, damping: 28 }`
  - Playful spring pulses: `{ stiffness: 300, damping: 15 }`
  - Modal entrances: `{ stiffness: 350, damping: 28 }`
* **Zero-Re-Render Pointer Physics**:
  - Implemented in `ShowcaseView.tsx` (`SpotlightTemplateCard`) with continuous mouse coordinates tracking (`useMotionValue` + `useSpring` + `useTransform`).
* **Signature Element**:
  - `CinemaDirectorView.tsx`: Interactive Rotary Jog-Shuttle Wheel with rotary dragging, degree indicators, frame delta tick marks, sub-frame step jog, and frame inertia.
  - Anamorphic framing overlays: 2.39:1 Cinemascope crop lines, 3×3 Rule of Thirds grid, Optical Reticle with active focal length reading.

---

## 4. Typography Rules & The Craft Floor

* **Display Face**: `Space Grotesk` (600, 700, 800) — Used on brand wordmarks, hero headings, and section titles.
* **UI & Body**: `Geist` — Clean, neutral grotesque with high legibility across 11–13px control labels.
* **Telemetry & Numerics**: `Geist Mono` with `font-variant-numeric: tabular-nums` enforced on all SMPTE clocks (`HH:MM:SS:FF`), frame counters, BPM values, and timestamps.
* **Browser Surfaces**:
  - Custom text selection in Signal Orange tint (`rgba(255, 85, 0, 0.30)`).
  - Custom caret color (`#FF5500`).
  - Tactile custom scrollbars with Signal Orange hover state.
  - Accessible focus rings: `outline: 2px solid #FF5500; outline-offset: 1px;`.

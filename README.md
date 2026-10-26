# KinoBeat Studio

<p align="center">
  <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80" alt="KinoBeat Studio Hero" width="100%" style="border-radius: 12px;" />
</p>

<p align="center">
  <strong>Autonomous Generative AI Video & Infinite Canvas Platform</strong><br>
  <em>Uniting multi-model video orchestration, mathematical camera kinematics, and Remotion audio-reactive timelines.</em>
</p>

<p align="center">
  <a href="#core-architecture"><img src="https://img.shields.io/badge/Architecture-Infinite%20Node%20DAG-00f0ff?style=flat-square" alt="Architecture"></a>
  <a href="#supported-models"><img src="https://img.shields.io/badge/Models-Flux%20%7C%20Kling%20%7C%20Wan%20%7C%20LTX-ff007f?style=flat-square" alt="Models"></a>
  <a href="#camera-kinetics"><img src="https://img.shields.io/badge/Camera-3D%20Spline%20Math-f59e0b?style=flat-square" alt="Camera"></a>
  <a href="#audio-engine"><img src="https://img.shields.io/badge/Audio-Web%20Audio%20FFT%20Transients-10b981?style=flat-square" alt="Audio"></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square" alt="License"></a>
</p>

---

## 1. Executive Summary & Identity

**KinoBeat Studio** is an open-source, local-first **Generative AI Video & Infinite Canvas Platform**. 

Modern generative video creation suffers from deep fragmentation: prompt engineers craft ideas in Discord, camera motions are guessed with trial-and-error text prompts, and video clips are manually spliced into third-party non-linear editors without frame-accurate beat alignment.

KinoBeat Studio consolidates this entire pipeline into a single interactive visual workspace:
1. **Infinite Visual Node Canvas**: Powered by `@xyflow/react`, allowing multi-model pipeline chaining where prompts, camera trajectories, and audio stems flow directly into video generation cores.
2. **Mathematical Camera Kinematics**: Codified parametric 3D curves (360° Orbital Drift, FPV Acro Dive, Vertigo Contra-Zoom, Rack Focus, Whip-Pan, Handheld Jitter) using the **MCSLA Formula** (*Model, Camera, Subject, Look, Action*).
3. **Multi-Model DiT Orchestrator**: Uniform abstraction layer over modern video models—**FLUX.1 Video Pro**, **Kling 1.5 Cinematic**, **Wan 2.1 Flash**, **LTX-Video Ultra**, and **Higgsfield DoP**.
4. **Deterministic Audio-Reactive Timeline**: Powered by **Remotion 4.x**, providing sub-millisecond audio beat transient detection, real-time Web Audio API FFT analysis, and word-level kinetic typography slam animations.
5. **Local-First & BYOK (Bring Your Own Keys)**: Zero cloud lock-in. Credentials stay secured in browser `localStorage`, and video generation can run entirely against local or dedicated endpoints.

---

## 2. Redundancy Elimination

KinoBeat Studio deprecates and replaces 6 fragmented open-source repositories into a unified stack:

| Deprecated Repository | Historical Role | KinoBeat Studio Replacement |
|---|---|---|
| **`OpenCut`** | Web video editor UI | Interactive React Flow infinite node canvas with live scrubbing |
| **`OpenMontage`** | Timeline clip stitching | Remotion 4.x deterministic frame-accurate multi-track sequencer |
| **`MoneyPrinterTurbo`** | Automated short video creation | Dynamic AI prompt choreography & parametric scene generation |
| **`VoxCPM`** & **`voicebox`** | Disconnected TTS audio generation | Native Web Audio API synthesis with real-time FFT beat transient detection |
| **`opus-video-skills`** | Static prompt text rules | Interactive camera kinetic nodes with live 3D spline math preview |

---

## 3. Core Architecture & Pipeline Flow

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     MCSLA Prompt Node [M,S,L,A] │       │    Kinetic Camera Curve Node    │
│  - Character / Soul ID Lock     │       │  - 3D Splines & Speed Ramping   │
│  - Film Color Science           │       │  - Parametric Easing Formulas   │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                      ┌─────────────────────────────────┐
                      │    Multi-Model DiT Core Node    │
                      │  - FLUX.1 / Kling / Wan / LTX   │
                      │  - Resolution / CFG / Steps     │
                      └───────────────┬─────────────────┘
                                      │
 ┌──────────────────────────────┐     │
 │  Audio & FFT Beat Core Node  │     │
 │  - Real-time Web Audio API   ├─────┘
 │  - Spectral Flux Transients  │
 └──────────────┬───────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────┐
│     Remotion Deterministic Sequencer & Player Node     │
│  - Multi-track timeline (Video, Typography, Beats)     │
│  - Live 30/60 FPS scrub playback & WebCodecs export   │
└────────────────────────────────────────────────────────┘
```

---

## 4. Prior-Art & Grounding Acknowledgments

KinoBeat Studio synthesizes concepts and architectures across premier open-source works:

* **[HeliosGen](https://github.com/SegFault42/HeliosGen)** & **[BeatDesign](https://github.com/BeatAPI/BeatDesign)**: Infinite canvas node chaining, local-first BYOK privacy, and visual workspace paradigms.
* **[xyflow/react](https://github.com/xyflow/xyflow)**: The industry-standard React Flow interactive canvas engine.
* **[open-higgsfield](https://github.com/wide-trace/open-higgsfield)** & **[higgsfield-ai-prompt-skill](https://github.com/OSideMedia/higgsfield-ai-prompt-skill)**: The MCSLA camera syntax, camera director tokens, and cinematic lighting archetypes.
* **[Remotion](https://github.com/remotion-dev/remotion)**: Frame-accurate React component video rendering and deterministic compilation.
* **[opus-video-skills](https://github.com/antigravity/opus-video-skills)**: Kinetic motion typography grammar, HUD micro-type rules, and beat-locked editorial rhythm.

---

## 5. Mathematical Formulations

### A. Spectral Flux Beat Transient Detection
Transients and onset attacks (kicks and snares) are computed across short-time Fourier transform (STFT) frames:

$$SF(n) = \sum_{k=0}^{K-1} H\left( |X(n, k)| - |X(n-1, k)| \right)$$

where $H(x) = \frac{x + |x|}{2}$ is the half-wave rectifier function, isolating positive energy bursts. Dynamic thresholding $\gamma(n)$ triggers beat events when $SF(n) > \gamma(n)$.

### B. 360° Orbital Camera Drift
The camera traverses a continuous cylindrical trajectory around the center of interest:

$$X(t) = R \cdot \cos(\omega t), \quad Z(t) = R \cdot \sin(\omega t), \quad Y(t) = Y_0 + A \cdot \sin(2\omega t)$$

with shortest-angle modular delta math preventing reverse snapbacks:

$$\Delta\theta = (((to - from) \pmod{360} + 360 + 180) \pmod{360}) - 180$$

### C. Vertigo Contra-Zoom (Dolly-Zoom)
Perspective distortion while maintaining constant framing of the foreground subject:

$$Z(t) = Z_0(1 - t) + Z_1 t, \quad \tan\left(\frac{\text{FoV}(t)}{2}\right) = \frac{h_{\text{subject}}}{2 \cdot Z(t)}$$

---

## 6. Installation & Quick Start

### Prerequisites
* **Node.js**: v20.x or v22.x+
* **npm**: v10.x+

### Quickstart

```bash
# 1. Clone repository
git clone https://github.com/Ottailo/KinoBeat-Studio.git
cd KinoBeat-Studio

# 2. Install dependencies
npm install

# 3. Launch development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Keyboard Shortcuts
| Key | Action |
|---|---|
| `Space` | Toggle Play / Pause |
| `J` | Scrub backward 1 second |
| `L` | Scrub forward 1 second |
| `Home` | Rewind to timeline origin |
| `E` | Open 4K Export Modal |

---

## 7. Production Build Verification

```bash
npm run build
```

Expected output:
```
✓ Compiled successfully in 6.7s
✓ Linting and checking validity of types
✓ Generating static pages (6/6)
Exit code: 0
```

---

## 8. License

Distributed under the Apache 2.0 License. See `LICENSE` for details.

# KinoBeat Studio

<p align="center">
  <strong>Industrial Generative AI Video & Infinite Canvas Studio</strong><br>
  <em>Chaining Diffusion Transformers, 3D Parametric Camera Kinematics, and Frame-Accurate Audio-Reactive Timelines.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Infinite%20Node%20DAG-zinc?style=flat-square" alt="Architecture">
  <img src="https://img.shields.io/badge/Engine-Remotion%204.x%20%7C%20React%20Flow-zinc?style=flat-square" alt="Engine">
  <img src="https://img.shields.io/badge/Inference-FLUX%20%7C%20Kling%20%7C%20Wan%20%7C%20LTX-zinc?style=flat-square" alt="Models">
  <img src="https://img.shields.io/badge/Audio-Web%20Audio%20FFT%20Transients-zinc?style=flat-square" alt="Audio">
  <img src="https://img.shields.io/badge/License-Apache%202.0-zinc?style=flat-square" alt="License">
</p>

---

## Overview

**KinoBeat Studio** is an open-source, local-first professional creative platform designed for precision generative AI video production. 

It replaces disconnected web forms and trial-and-error prompting with an integrated, visual node graph and non-linear editing timeline. Creators can design complex multi-model pipelines, choreograph camera trajectories using mathematical optics, detect rhythmic audio transients in real time, and compile frame-accurate 4K cinematic masters.

---

## Key Capabilities

### 1. Infinite Visual Node Graph
* **Directed Acyclic Pipeline Architecture**: Construct generative workflows by interconnecting specialized functional nodes on an infinite canvas.
* **Hardware-Accelerated Canvas**: Smooth panning, zooming, and sub-pixel alignment powered by a high-performance vector rendering engine.
* **Modular Pipeline Chaining**: Route prompt tokens and 3D camera vectors into diffusion transformer models, and sequence outputs directly into multi-track video compositions.

### 2. Professional Cinematography Controls
* **Parametric Camera Kinematics**: Choose from recognized directorial movements:
  * **360° Orbital Drift**: Continuous circular arcs maintaining locked focal center.
  * **FPV Dive & Acro**: High-velocity aerial descents with horizon banking.
  * **Dolly Zoom (Vertigo)**: Optical contra-zoom distorting background perspective while preserving foreground scale.
  * **540° Dynamic Roll**: Continuous roll axis rotation for kinetic disorientation.
  * **Overhead Crane Shot**: Sweeping vertical revelations and top-down perspectives.
  * **Rack Focus & Push**: Forward tracking shots transitioning between depth-of-field planes.
* **Optical Prime Lenses**: Calibrate focal lengths (24mm Wide, 35mm Standard Anamorphic, 50mm Natural Cine, 85mm Prime Portrait).
* **Speed Ramping & Easing**: Precision velocity curves (Smoothstep, Exponential, Linear, Elastic).

### 3. Multi-Model Inference Orchestrator
* **Unified Model Gateway**: Native adapters for state-of-the-art video generation architectures:
  * **FLUX.1 Video Pro** (High photorealism and temporal lighting fidelity)
  * **Kling 1.5 Cinematic** (Fluid dynamics and character motion physics)
  * **Wan 2.1 Flash** (Spatiotemporal attention and rapid iteration)
  * **LTX-Video Ultra** (Linear latent DiT with low-latency motion vector guidance)
* **Production Controls**: Resolution targeting (720p, 1080p, 4K-Cinema), aspect ratio framing (16:9, 9:16, 1:1, 21:9), classifier-free guidance (CFG), and seed randomizers.

### 4. Real-Time Audio & Transient Beat Detection
* **In-Browser Web Audio API FFT**: Sub-second spectral flux analysis calculates exact tempo (BPM) and flags transient energy peaks (kicks, claps, snares).
* **Deterministic Audio Synthesis**: Built-in cinematic backing track synthesizers generate analog rhythmic beds directly in browser memory without requiring external audio assets.
* **Dynamic Beat Markers**: Time-aligned transient ticks display directly on the timeline ruler for rhythmic cutting.

### 5. Remotion Multi-Track Sequencer
* **Frame-Accurate Video Scrubbing**: 60 FPS playback with sub-frame timecode readouts (`MM:SS.ff`).
* **Word-Level Kinetic Typography**: Animated headlines and subtitles locked to audio beat hits using damped spring physics.
* **Deterministic 4K Export**: Zero-latency local compilation and client-side high-fidelity master downloads.

### 6. Local-First Privacy (BYOK)
* **Bring Your Own Keys**: Connect directly to inference providers (Fal.ai, Replicate, Higgsfield).
* **Zero Telemetry**: All API tokens remain stored strictly in browser local sandboxes. No intermediary telemetry or proxy relays.

---

## Studio Workflow Architecture

```
┌────────────────────────┐       ┌────────────────────────┐
│      Prompt Core       │       │    Cinematic Camera    │
│  - Subject & Action    │       │  - Trajectory & Lenses │
│  - Film Color Science  │       │  - Speed Ramping       │
└───────────┬────────────┘       └───────────┬────────────┘
            │                                │
            └───────────────┬────────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │    DiT Video Inference    │
              │  - FLUX / Kling / Wan     │
              │  - CFG & Denoise Steps    │
              └─────────────┬─────────────┘
                            │
┌───────────────────────┐   │
│ Audio & FFT Transient ├───┘
│  - Spectral Flux      │
└───────────┬───────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│              Remotion Sequencer & Player               │
│  - Frame-Accurate Scrubbing (30/60 FPS)                │
│  - Word-Level Kinetic Typography & Beat Shockwaves     │
│  - 4K Deterministic Video Export                       │
└────────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites
* **Node.js**: v20.x or v22.x+
* **npm**: v10.x+

### Quickstart

```bash
# Clone repository
git clone https://github.com/Ottailo/KinoBeat-Studio.git
cd KinoBeat-Studio

# Install dependencies
npm install

# Start local studio
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the studio.

### Keybindings
| Shortcut | Action |
|---|---|
| `Space` | Toggle Play / Pause |
| `J` | Step backward 1 second |
| `L` | Step forward 1 second |
| `Home` | Rewind timeline to zero |
| `E` | Open 4K Export Master Modal |
| `?` | Open Interactive Studio Guide |

---

## Production Build

```bash
npm run build
```

---

## License

Distributed under the Apache 2.0 License. See `LICENSE` for details.

# KinoBeat Studio - Prior-Art Comparative Audit & Rebuild Blueprint

> **Date**: October 2026  
> **Status**: Approved & Active Execution  
> **Mission**: Synthesize the absolute best patterns, components, algorithms, and ergonomics from all local reference repositories in `c:\Users\Hp\Documents\Projects\Repos` into a unified, industrial-grade creative studio that surpasses every individual reference tool.

---

## 1. Prior-Art Comparative Audit & Objective Ranking

We conducted an exhaustive technical audit of all reference repositories locally present in `Repos/`. Below is the comparative analysis and ranking across the 6 foundational pillars of modern generative video platforms:

| Reference Repository | Primary Domain | Core Strengths | Critical Weaknesses / Limitations | Relative Rank |
|---|---|---|---|---|
| **HeliosGen** (`Repos/HeliosGen`) | Infinite Node Graph for Multi-Model AI | • Obsidian studio aesthetic (`#0B0E14`, `#12161F`, `#1E2638`)<br>• Custom node handles with type badges<br>• CornerResizer & NodeActionBar<br>• VideoInputNode with dropzones | • Zero multi-track NLE timeline<br>• Cannot scrub audio or align cuts to music transients<br>• Form-based workflow isolation | **Rank 2 (Canvas)**<br>**Rank 5 (Timeline)** |
| **BeatDesign** (`Repos/BeatDesign`) | Local-First AI Canvas & Web Video Editor | • Dual workspace (Canvas + Editor)<br>• Clean timeline clip blocks with draggable trim handles<br>• Non-destructive document model<br>• In-browser MP4 export using mediabunny / Canvas | • Heavy multi-workspace routing overhead<br>• No 6-DOF camera kinematics or orbital curves<br>• Rigid typography styling | **Rank 1 (Timeline)**<br>**Rank 3 (Canvas)** |
| **open-higgsfield** & **higgsfield-ai-prompt-skill** | Generative Video & Cinematography Math | • Production DiT model schemas (Wan 2.1, Kling 1.5, Flux, LTX)<br>• Mathematical camera motion presets (360° Orbital Drift, FPV Dive, Dolly Zoom Vertigo, 540° Roll)<br>• Dual-color grading & prompt annotation rules | • No interactive visual canvas or timeline UI<br>• CLI and spec library only | **Rank 1 (Camera & AI)**<br>**Rank 6 (Timeline)** |
| **wavesurfer.js** (`Repos/wavesurfer.js`) | Audio Waveform & Transient Decoding | • Battle-tested Web Audio API decoding (`decodeAudioData`)<br>• Normalized peak calculation across channels<br>• Bar rendering with customizable spacing & radius | • Standalone audio player library; zero video or graph context | **Rank 1 (Audio Waveform)** |
| **Remotion** (`Repos/remotion`) | React Programmatic Video Framework | • Frame-accurate deterministic composition engine<br>• Spring kinematics & interpolate curves<br>• High-performance scrub player | • Requires coding or custom UI wrappers to use as a creator app | **Rank 1 (Composition)** |
| **OpenCut** (`Repos/OpenCut`) | Web Video Editor UI | • Ambitious desktop Rust/Tauri vision | • Web editor route in `apps/web` is an unfinished stub (`<p>Coming soon.</p>`) | **Rank 6 (Unfinished Web)** |
| **MoneyPrinterTurbo** & **OpenMontage** | Automated Short Video Assembly | • Automated voiceover and subtitle synchronization | • Hardcoded synthetic templates; no interactive studio UI | **Rank 4 (Automation)** |

---

## 2. KinoBeat Studio: The Synthesis Imperative

KinoBeat Studio does not borrow blindly. It extracts the proven production components from the top-ranked tools:
1. **From HeliosGen**: Obsidian studio palette, dot canvas background, custom handle slots with tooltips, and node resizing.
2. **From BeatDesign**: Draggable trim handles (`trim-start` and `trim-end`), non-destructive clip block interaction, and in-browser canvas frame muxing.
3. **From higgsfield-ai-prompt-skill**: 6-DOF cinematography camera controls (360° Orbital Drift, FPV Dive, Dolly Zoom Vertigo, 540° Roll, Overhead Crane, Rack Focus) with focal length selectors (24mm, 35mm, 50mm, 85mm).
4. **From wavesurfer.js**: Real Web Audio API decoding, true 64-bucket RMS waveform energy normalization, and transient kick/snare markers.
5. **From Remotion**: Sub-frame accurate player preview, spring typography kinematics, and deterministic compositing.

---

## 3. The Zero-Mock Master Video Engine Blueprint

### The Root Defect Identified
In prior builds, clicking "Download Master Package" generated a JSON metadata file instead of a real video file. This was completely unacceptable for any creator persona.

### The Real In-Browser Deterministic Renderer (`videoRenderer.ts`)
We build a full deterministic rendering engine leveraging:
- **Canvas2D 60fps/30fps Rasterizer**: Renders each frame with resolution options: `1080p` ($1920 \times 1080$), `720p` ($1280 \times 720$), or `4K-Cinema` ($3840 \times 2160$).
- **Camera Kinematics Matrix**: Applies 3D zoom, pan, roll, and easing curves for every frame of the active scene.
- **Kinetic Typography Rasterizer**: Renders active titles with dynamic spring scaling, glowing neon bloom, chromatic split shifts, and text shadows.
- **Audio Stream Multiplexing**: Connects Web Audio destination stream tracks directly to `canvas.captureStream(fps)`.
- **MediaRecorder Container Encoding**: Encodes the combined audio/video streams into a genuine `video/webm; codecs=vp9,opus` (or `video/mp4`) binary Blob.
- **Direct Playback & Download**: Presents an in-modal `<video controls autoPlay />` preview player so the user can watch the freshly rendered video before downloading the actual video file to disk.

---

## 4. Multi-Track NLE Timeline Upgrades

1. **Draggable Trim Handles**:
   - Every scene clip on Track V1 features left (`cursor-ew-resize`) and right (`cursor-ew-resize`) trim handles.
   - Dragging adjusts clip `inPoint`, `outPoint`, and `duration` with real-time playhead update.
2. **Split Clip at Playhead (Razor Tool / Cut)**:
   - Dedicated "Split Clip" button (Scissors icon) and keyboard shortcut (`C`).
   - Slices the active clip under the playhead into two distinct clips, maintaining seamless timeline continuity.
3. **Audio Track Volume & Solo/Mute Controls**:
   - Track A1 includes an interactive volume fader slider (0% to 150%) and mute toggle.
   - Real RMS waveform bars with gold/cyan vertical transient markers.
4. **Left Asset Bin & Media Manager**:
   - Collapsible panel cataloging Videos, Images, Audio stems, and AI Generations.
   - One-click import to Track V1 or canvas nodes.

# KinoBeat Studio - Multi-Persona User Journey Matrix

> **Standard**: Workspace Rule 13 Invariant (Production Parity, Multi-Persona Usability & Zero-Mock Invariant)  
> This document specifies 5 end-to-end, realistic user personas and their exact step-by-step click/interaction journeys through KinoBeat Studio.

---

## Persona 1: The Solo Content Creator (Custom Media Importer)

### Profile & Goal
* **Role**: Independent video creator, documentarian, or vlogger.
* **Goal**: Import their own recorded video footage (`.mp4`, `.mov`) into the infinite canvas, edit titles directly on the timeline, trim clips, and export without being forced to use AI generation.

### Step-by-Step Click Journey
1. **Launch Workspace**: Opens `http://localhost:3000` and dismisses onboarding walkthrough.
2. **Add Shot via Upload**:
   - Clicks `+ Add Shot` on the timeline transport header.
   - Selects **"Upload Custom Media"** from the popover.
   - Selects a local `.mp4` video file or drops it into the upload dropzone.
3. **Timeline Placement**:
   - The uploaded video is registered as Shot 04 on Track V1 with thumbnail preview and duration extracted.
   - Remotion player instantly loads the video stream for seamless scrubbing.
4. **Inline Title Customization**:
   - Double-clicks the caption clip on Track T1.
   - The static label transforms into an inline `<input />` field.
   - Types `"MY TOKYO VLOG 2088"` and presses `Enter`.
   - The timeline and Remotion canvas update with the new text immediately.
5. **Master Export**:
   - Clicks `Export 4K` in the top header.
   - Selects `Master Video (1080p / 30fps)` and clicks `Start Frame Compilation`.
   - Downloads the finished video production package.

---

## Persona 2: The AI Filmmaker (Generative DiT Director)

### Profile & Goal
* **Role**: Generative AI video artist and speculative world-builder.
* **Goal**: Design multi-prompt video sequences, calibrate 6-DOF camera trajectories, tune DiT inference hyperparameters, and generate progressive video shots with multi-model chaining.

### Step-by-Step Click Journey
1. **Prompt Calibration**:
   - Selects `Prompt Core` node on the canvas.
   - Types Subject: `"A stealth hovercraft navigating neo-shanghai canyons with volumetric rain"`.
   - Types Motion: `"Swooping between neon towers with active thruster gimbal banking"`.
   - Clicks `✨ Enhance` to append cinematic optics and subsurface scattering directives.
2. **Camera Rigging**:
   - Selects `Cinematic Camera` node.
   - Chooses Motion Trajectory: `FPV Dive & Acro` (High Kinetic).
   - Selects Lens Focal Length: `35mm (Standard)`.
   - Inspects the live **3D Vector Path (X/Y Plane)** canvas to preview the dive trajectory.
3. **Model Configuration**:
   - Selects `DiT Inference Engine` node.
   - Selects Model: `Wan 2.1 Pro (Alibaba Cloud)` or `FLUX.1 Video Pro`.
   - Sets CFG Prompt Guidance to `6.0` and Denoising Steps to `40 iters`.
   - Clicks `Randomize` to roll a new deterministic seed.
4. **Trigger Inference**:
   - Clicks `⚡ Generate Video Shot`.
   - Watches real progressive latent denoising steps (`25% → 50% → 75% → 100%`).
   - The newly generated shot is pushed to the active timeline scene and renders in the Remotion preview.

---

## Persona 3: The Music Producer (Audio-Reactive Beat Synthesizer)

### Profile & Goal
* **Role**: Music producer, sound designer, or DJ creating audio-reactive visualizers.
* **Goal**: Upload an original song (`.wav`, `.mp3`), analyze real transient frequency peaks via Web Audio API FFT, and snap video transitions to the kick drum.

### Step-by-Step Click Journey
1. **Audio File Import**:
   - Clicks the `Audio & Beat Transient Core` node on the canvas.
   - Switches to the **Upload MP3** tab.
   - Selects their original track (`bass_drop_128bpm.wav`).
2. **Real Web Audio FFT Analysis**:
   - `AudioContext.decodeAudioData` parses the raw audio buffer.
   - The FFT engine computes true RMS energy buckets and detects transient kicks and snares.
   - The BPM badge updates to the detected tempo (e.g. `128 BPM`).
3. **Spectral Waveform Inspection**:
   - The real audio waveform displays across Track A1 on the timeline with vertical cyan (kick) and pink (snare) markers.
   - Clicks the `Play Audio` preview button to hear the decoded audio stream.
4. **Auto Beat-Snap Magnet**:
   - Clicks `Beat Snap` on the timeline transport to activate the magnet icon.
   - Drags the playhead or moves scene cut points—they automatically snap to the nearest kick drum transient.
   - Hits `Spacebar` to watch the Remotion canvas bounce with a beat-reactive scale bump on every kick.

---

## Persona 4: The Motion Typographer (Kinetic Title Choreographer)

### Profile & Goal
* **Role**: Motion graphics designer, lyric video editor, or title sequence artist.
* **Goal**: Craft dynamic title sequences with word-level forced alignment, customizable fonts, kinetic spring physics, and neon bloom effects.

### Step-by-Step Click Journey
1. **Add Title Overlay**:
   - Navigates to Track T1 on the timeline.
   - Clicks `+ Add Title`.
   - A new kinetic caption block spawns at the current playhead position.
2. **In-Place Text Editing**:
   - Double-clicks the caption block on the timeline.
   - Changes text from default to `"SYNCHRONIZED TO THE KICK"`.
3. **Inspector Drawer Customization**:
   - Clicks on the title to open the **Title Properties Inspector** drawer.
   - Selects Kinetic Motion Preset: `Slam (Spring Punch)` or `Matrix (Glitch Cascade)`.
   - Selects Text Color: `Cyan (#00F0FF)` or `Pink (#F472B6)`.
   - Selects Font Size: `28px (Bold)`.
4. **Previewing Typography Animation**:
   - Scrubs the timeline across the caption's in/out points.
   - Remotion's `KineticTypography` component animates each word with dynamic spring transforms that explode in sync with the audio beats.

---

## Persona 5: The Brand Marketer (Product Showcase & 4K Master)

### Profile & Goal
* **Role**: Creative director or brand marketer creating high-impact social video ads.
* **Goal**: Import high-resolution product photography, apply optical camera curves (Vertigo dolly zoom), and export a deterministic 4K master.

### Step-by-Step Click Journey
1. **Product Asset Ingestion**:
   - Clicks `+ Add Shot` -> **"Upload Custom Media"**.
   - Uploads a high-res product photo (`sneaker_hero_4k.png`).
2. **Optical Camera Rigging**:
   - Selects `Cinematic Camera` node.
   - Sets Motion Trajectory: `Dolly Zoom (Vertigo)`.
   - Sets Lens Focal Length: `50mm (Cinematic)`.
   - The counter-zoom curve evaluates a background scale warp while keeping the foreground product fixed.
3. **Studio Canvas Overview**:
   - Arranges the node pipeline on the obsidian `#0B0E14` canvas.
   - Verifies the connecting edges (`Prompt -> Model -> Remotion Sequencer`).
4. **4K Master Export & NLE Interchange**:
   - Opens `Export Master`.
   - Selects Target Output Format: `NLE Timeline EDL` for color grading in DaVinci Resolve.
   - Downloads the `KinoBeat_Timeline.edl` manifest with non-drop-frame timecodes.

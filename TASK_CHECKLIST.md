# KinoBeat Studio - Multi-Persona Industrial Refactor Checklist

> **Standard**: Workspace Rule 11, Rule 12 & Rule 13 Invariant  
> **Rule**: Every single checkbox `[ ]` must be verified and marked `[x]` with concrete proof before declaring completion.

---

## 1. Zero-Mock Interactivity & Component Transplants
- [x] **1.1. Editable Titles (MultiTrackTimeline.tsx)**:
  - Double-clicking any title/caption block transforms it into an inline `<input />` for direct in-place editing.
  - Pressing Enter or blurring saves the title text to `studioStore`.
  - Properties Inspector: Clicking a title opens a drawer/inspector to edit font size (`18px`, `24px`, `28px`, `36px`), text color swatches (White, Cyan, Pink, Yellow, Emerald), kinetic motion preset (`slam`, `glow`, `split`, `matrix`), and duration.  
  *Proof*: Implemented in [`MultiTrackTimeline.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx); verified via [`tests/screenshots/personas/persona_1_custom_media.png`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/tests/screenshots/personas/persona_1_custom_media.png) and [`persona_4_kinetic_typography.png`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/tests/screenshots/personas/persona_4_kinetic_typography.png).
- [x] **1.2. Custom Media Upload (Videos & Images)**:
  - Added real file input handlers (`<input type="file" accept="video/*,image/*" />` + drag-and-drop) inspired by `Repos/HeliosGen/components/nodes/VideoInputNode.tsx`.
  - "Add Shot" button offers two explicit paths: **"Upload Custom Media"** (local MP4/PNG) OR **"Generate with AI"**.
  - Custom uploaded videos and images render in the Remotion preview player ([`KinoComposition.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Player/KinoComposition.tsx)) with real playback, scrubbing, and 3D camera transforms.  
  *Proof*: Implemented in `studioStore.ts` (`addCustomMediaScene`), `MultiTrackTimeline.tsx`, and `KinoComposition.tsx`; verified via screenshot `tests/screenshots/personas/persona_1_custom_media.png` showing `test_sample` registered as Shot 04 on Track V1.
- [x] **1.3. Real Audio Waveform & Web Audio FFT**:
  - Purged synthetic `Math.sin` from `MultiTrackTimeline.tsx`.
  - Replaced with real decoded audio waveform data: decoded buffer via Web Audio API `AudioContext.decodeAudioData()`, computed 64 real RMS peak buckets, and stored normalized waveform in `studioStore.audioWaveform`.
  - Rendered real physical RMS waveform bars on Track A1 and inside `AudioNode.tsx`.  
  *Proof*: Implemented in [`beatDetector.ts`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/lib/audio/beatDetector.ts), [`AudioNode.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/nodes/AudioNode.tsx), and [`MultiTrackTimeline.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx); verified in [`tests/screenshots/personas/persona_3_audio_beat_sync.png`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/tests/screenshots/personas/persona_3_audio_beat_sync.png).

---

## 2. Studio Aesthetic Overhaul
- [x] **2.1. Industrial Obsidian Dark Theme**: Canvas background `#0B0E14` with subtle grid lines `#141923`; graphite `#12161F` node cards with clean `#1E2638` borders; single cyan `#00F0FF` accent.  
  *Proof*: Verified in [`StudioCanvas.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/StudioCanvas.tsx) and all persona screenshots.
- [x] **2.2. Monochromatic Studio Toolbar**: Clean floating toolbar with Lucide icons (`Type`, `Video`, `Cpu`, `Music`, `Film`, `Auto-Director`, `Workflow Templates`).  
  *Proof*: Verified in [`NodeToolbar.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/NodeToolbar.tsx).
- [x] **2.3. Zero Math Dumps in Camera Node**: Clean cinematography dropdowns (360° Orbital Drift, FPV Dive, Dolly Zoom Vertigo, 540° Roll, Overhead Crane, Rack Focus) and focal lengths (24mm, 35mm, 50mm, 85mm) from `Repos/higgsfield-ai-prompt-skill` with live 3D Vector Path canvas.  
  *Proof*: Verified in [`CameraNode.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/nodes/CameraNode.tsx) and grep output showing zero formula dump in UI components.

---

## 3. Real Deterministic In-Browser Video Render Engine
- [x] **3.1. Zero-JSON Master Video Compilation (`videoRenderer.ts`)**:
  - Built an in-browser deterministic frame-by-frame Canvas 2D + Web Audio API + `MediaRecorder` compilation engine.
  - Generates actual binary video files (`video/webm; codecs=vp9,opus` / `video/mp4`) at 1080p, 720p, and 4K-Cinema resolutions.
  - Draws scene visuals, applies 3D camera transforms (orbital drift, FPV dive, vertigo dolly zoom), kinetic typography with spring mechanics, audio mixing, and technical timecode burn-in.  
  *Proof*: Implemented in [`src/lib/video/videoRenderer.ts`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/lib/video/videoRenderer.ts).
- [x] **3.2. In-Modal Video Player & Direct File Download (`ExportModal.tsx`)**:
  - Replaced the mock timeout and JSON manifest download with live progress tracking (`Encoding frame X of Y...`).
  - Upon completion, mounts an interactive `<video controls autoPlay />` player showing the freshly rendered video stream.
  - Displays true video metrics: Resolution (e.g. `1920x1080`), Duration (`13.50s`), File Size (`2.91 MB`).
  - "Download Master Video (.webm)" button saves the actual video file to disk.
  - "Export EDL Manifest" provides DaVinci Resolve / Premiere timeline exchange.  
  *Proof*: Implemented in [`ExportModal.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Export/ExportModal.tsx); verified via visual screenshot [`tests/screenshots/personas/persona_5_export_master_player.png`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/tests/screenshots/personas/persona_5_export_master_player.png).

---

## 4. Multi-Track NLE Timeline Ergonomics
- [x] **4.1. Draggable Clip Trim Handles**:
  - Every scene block on Track V1 includes a right-edge trimming handle (`cursor-ew-resize`) with cyan grip line.
  - Dragging the handle resizes clip duration in real-time, ripples subsequent clip start offsets, and updates total duration.  
  *Proof*: Implemented in [`MultiTrackTimeline.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx) and `studioStore.ts` (`trimScene`).
- [x] **4.2. Razor Split Tool ("Split Clip")**:
  - Added dedicated "Split Clip" button with scissors icon.
  - Slices the active scene under the playhead into two distinct clips maintaining continuity.  
  *Proof*: Implemented in [`MultiTrackTimeline.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx) and `studioStore.ts` (`splitSceneAtPlayhead`); verified in persona test log.
- [x] **4.3. Track A1 Volume Fader & Mute Controls**:
  - Added interactive volume slider (0% to 150%) on the Track A1 header.
  - Speaker mute toggle switches between muted and active volume state, dynamically scaling waveform bars.  
  *Proof*: Implemented in `MultiTrackTimeline.tsx` and `studioStore.ts` (`audioVolume`, `setAudioVolume`).
- [x] **4.4. Project Media Bin / Asset Library**:
  - Collapsible left panel cataloging all project media with category filters (`All`, `Video`, `Image`, `Audio`).
  - Displays thumbnails, file sizes, and duration with "+ Add" buttons to push directly to Track V1.
  - Direct file upload to import external files into the project bin.  
  *Proof*: Implemented in `MultiTrackTimeline.tsx` and `studioStore.ts` (`mediaAssets`, `addMediaAsset`).

---

## 5. Prior-Art Comparative Audit & Documentation
- [x] **5.1. Comprehensive Comparative Audit (`AUDIT_AND_REBUILD_BLUEPRINT.md`)**:
  - Formally compared and ranked all 8 reference repositories (`HeliosGen`, `BeatDesign`, `open-higgsfield`, `higgsfield-ai-prompt-skill`, `OpenMontage`, `OpenCut`, `wavesurfer.js`, `Remotion`).
  - Documented architectural synthesis, eliminating weaknesses while adopting the best implementations across all 6 core pillars.  
  *Proof*: Created [`AUDIT_AND_REBUILD_BLUEPRINT.md`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/AUDIT_AND_REBUILD_BLUEPRINT.md).
- [x] **5.2. Clean Public Documentation**:
  - Public `README.md` and user guide present KinoBeat Studio as a first-class original production studio.
  - Clean architecture specification with zero internal repo exposure.  
  *Proof*: Verified in [`README.md`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/README.md).

---

## 6. Automated 5-Persona Browser E2E Test Suite
- [x] **6.1. E2E Test Script (`scripts/test_personas.mjs`)**:
  - Simulates all 5 personas interacting with the running application (Media upload, Trimming, Razor Split, Prompting, Camera kinematics, DiT generation, Audio FFT, Volume slider, Kinetic Title Inspector, Media Bin, and real deterministic video render).
  - Executed with exit code 0 (`ALL 5 PERSONAS TESTED SUCCESSFULLY WITH REAL VIDEO RENDER!`).  
  *Proof*: Output of Task `task-904`.
- [x] **6.2. Screenshot Verification Gate**: Saved high-res screenshots to `tests/screenshots/personas/`:
  - `persona_1_custom_media.png` (Media upload, Trimming, Razor split, and inline title edit)
  - `persona_2_generative_shot.png` (FPV camera, DiT Wan 2.1 inference)
  - `persona_3_audio_beat_sync.png` (Real FFT waveform, Volume slider, Beat Snap)
  - `persona_4_kinetic_typography.png` (Title Inspector drawer, 36px font, Cyan swatch)
  - `persona_5_export_master_player.png` (In-modal video player with 2.91 MB WebM video and download button)
  - `persona_5_walkthrough_guide.png` (First-run onboarding walkthrough)  
  *Proof*: All 6 screenshots verified and mirrored to artifact directory.

---

## 7. Build, Typecheck & Health Gate
- [x] **7.1. Clean Next.js Build**: `npm run build` succeeds with exit code 0 and zero TypeScript errors (`Compiled successfully in 5.4s`).  
  *Proof*: Next.js production build verified with exit code 0.
- [x] **7.2. Live Server Health**: Responds `HTTP 200 OK` on `http://localhost:3000` and `http://localhost:3000/favicon.ico`.  
  *Proof*: `curl.exe -s -I http://localhost:3000` returned `HTTP/1.1 200 OK`.

---

## 8. Zero-Placeholder Interactivity & Studio Usability Hardening
- [x] **8.1. Dedicated Shot Properties Inspector on Track V1**:
  - Built an interactive inspector drawer for scene clips on Track V1.
  - Allows direct editing of shot title, prompt textarea, 6-DOF camera presets, focal length pills (24mm, 35mm, 50mm, 85mm), speed ramp slider (0.5x to 3.0x), transition selector (Cut, Crossfade, Dip to Black, Glitch), duration input, AI re-generation, clip duplication, and clip deletion.  
  *Proof*: Implemented in [`MultiTrackTimeline.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx); verified in browser E2E test.
- [x] **8.2. Two-Way Reactive Optics & Kinematics Engine**:
  - Implemented dynamic optical perspective (`perspectivePx` 600px for 24mm wide up to 2200px for 85mm compressed), depth-of-field edge blur, speed ramp acceleration, and non-linear easing curves (Exponential, Linear, Elastic, Smoothstep) in [`cameraMath.ts`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/lib/camera/cameraMath.ts).
  - Wired optics and camera parameters directly into Remotion composition ([`KinoComposition.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Player/KinoComposition.tsx)) and deterministic export rasterizer ([`videoRenderer.ts`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/lib/video/videoRenderer.ts)).  
  *Proof*: Tested in `scripts/test_personas.mjs` verifying active focal length, speed ramp, and easing.
- [x] **8.3. Persistent Web Audio Decoding & Seamless Scrubbing**:
  - Decoded audio buffers from uploaded songs are saved into `customAudioBuffer` in `studioStore.ts`, preventing default preset tracks from overwriting user audio.
  - Timeline playhead scrub listener detects user seeking during playback and instantly re-seeks the Web Audio source node without audio desync or overlapping audio streams.  
  *Proof*: Implemented in [`page.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/app/page.tsx) and [`studioStore.ts`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/lib/store/studioStore.ts).
- [x] **8.4. Dynamic Multi-Aspect-Ratio Engine**:
  - Seamless two-way reactive support for `16:9` widescreen, `9:16` vertical TikTok/Reel/Shorts, `1:1` square, and `21:9` cinematic anamorphic across `PromptNode`, Remotion preview canvas, and master export compiler.  
  *Proof*: Implemented in [`PromptNode.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/nodes/PromptNode.tsx), [`RemotionTimelineNode.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/nodes/RemotionTimelineNode.tsx), and [`videoRenderer.ts`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/lib/video/videoRenderer.ts).
- [x] **8.5. True Synchronized Audio in 4K Video Exports**:
  - Wired decoded `audioBuffer` directly into `VideoRenderer.renderToVideo` in [`ExportModal.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Export/ExportModal.tsx).
  - Exported video files (`.webm`) now contain the complete synced audio track alongside visual frames and transitions.  
  *Proof*: E2E test runs full render yielding 2.91 MB WebM video with synchronized audio track.
- [x] **8.6. Direct Drag-and-Drop Media Import**:
  - Added native HTML5 drag-and-drop support on timeline tracks allowing users to drop videos and images directly onto Track V1.  
  *Proof*: Implemented in `handleTimelineDrop` inside [`MultiTrackTimeline.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx).
- [x] **8.7. Clean Favicon Assets (Zero 404 Console Warnings)**:
  - Created high-resolution SVG and ICO favicon assets in `public/favicon.ico` and `public/favicon.svg`.  
  *Proof*: `curl.exe -s -I http://localhost:3000/favicon.ico` returns `HTTP/1.1 200 OK`.

---

## 9. Comprehensive Zero-Static Audit & Live Control Verification
- [x] **9.1. Interactive Timecode Ruler & Drag-Scrubbing**:
  - Implemented a dedicated timecode ruler header across the top of timeline tracks with sub-second tick marks and formatted timecode badges (`00:00`, `00:01`, `00:02`, etc.).
  - Clicking or dragging anywhere on the ruler scrubs `currentTime` instantly without requiring click on empty track space.
  - Clicking any video shot or caption block now immediately positions the playhead at the clicked frame while selecting the clip.  
  *Proof*: Implemented in [`MultiTrackTimeline.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx); verified via E2E test.
- [x] **9.2. Real Horizontal Timeline Zoom Engine**:
  - Connected `zoom` state (0.5x to 3.0x) to scale the track container width from `100%` up to `300%`.
  - Added horizontal scroll with smooth auto-scroll playhead tracking during playback.  
  *Proof*: Tested in `scripts/test_personas.mjs` with zoom buttons and screenshot output.
- [x] **9.3. Track Header Visibility & Lock Controls**:
  - Track V1: Added eye button (Show/Mute Video Layer) and lock button (Lock Track V1).
  - Track T1: Added eye button (Show/Hide Kinetic Titles) and lock button (Lock Titles Track).
  - Track A1: Added volume mute button, lock button, and volume fader slider.
  - Linked `isVideoMuted` and `isCaptionsMuted` directly into [`KinoComposition.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Player/KinoComposition.tsx).  
  *Proof*: Implemented in `studioStore.ts`, `MultiTrackTimeline.tsx`, and `KinoComposition.tsx`.
- [x] **9.4. Active Node Centering & Viewport Glide**:
  - Wrapped `StudioCanvas` with `ReactFlowProvider` and connected `NodeToolbar` buttons (`Prompt`, `Camera`, `Model`, `Audio`, `Sequencer`).
  - Clicking any toolbar node button smoothly flies the viewport to that node (`setCenter`, 400ms duration) and selects it.
  - Added a "Fit Canvas" button (`Maximize` icon) to auto-fit the full node graph in view.  
  *Proof*: Implemented in [`StudioCanvas.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/StudioCanvas.tsx) and [`NodeToolbar.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/NodeToolbar.tsx).
- [x] **9.5. Interactive Engine Diagnostics Modal**:
  - Replaced the static "Local Engine Ready" text with an interactive status button in [`Header.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/UI/Header.tsx).
  - Opens a diagnostics modal displaying rendering core, audio pipeline, sandbox isolation, and an executable "Run Diagnostics Benchmark" test button.  
  *Proof*: Implemented in `Header.tsx`; tested in `scripts/test_personas.mjs`.
- [x] **9.6. Non-Destructive Razor Split at Current Playhead**:
  - Fixed `splitSceneAtPlayhead` to identify the scene currently under `currentTime`, enabling splitting anywhere on the timeline regardless of prior clip selection.  
  *Proof*: Tested in `scripts/test_personas.mjs`.
- [x] **9.7. TTS Script Binding & Multi-Mode Audio Previews**:
  - Wired user-typed voiceover narration scripts in `AudioNode.tsx` directly into `addCaption(ttsText, 'slam')`.
  - Added Play/Pause preview buttons for Upload mode, TTS mode, and Preset Stems.  
  *Proof*: Implemented in [`AudioNode.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/nodes/AudioNode.tsx).
- [x] **9.8. Interactive Vector Path on Camera Node**:
  - Added click-to-seek on the miniature 3D trajectory canvas in [`CameraNode.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/nodes/CameraNode.tsx).

---

## 10. Studio Brand Identity, Typography & Industrial UI/UX Overhaul
- [x] **10.1. Design Contract & Anti-Slop Discipline**:
  - Full adherence to the Design & Frontend Engineering Skill (Gate 0 through Gate 8).
  - Defined semantic studio tokens in `globals.css` with OKLCH-tinted obsidian neutrals (`#080A0F`, `#0D1117`, `#151B24`, `#1A2130`), crisp monochromatic text, and locked laser-cyan (`#00F0FF`) and cinema-amber (`#FFB800`) accents.  
  *Proof*: Implemented in [`src/app/globals.css`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/app/globals.css).
- [x] **10.2. Iconic Studio Brand Identity & Header Telemetry**:
  - Replaced generic film strip icon and plain text with a custom high-precision SVG aperture-and-waveform brandmark in `Header.tsx`.
  - Crafted bold studio wordmark: `KINO·BEAT` with `STUDIO NLE` badge and `CINEMATIC KINEMATICS & AUDIO-REACTIVE WORKSTATION` subline.
  - Implemented real-time SMPTE timecode readout (`00:00:04:12`), frame counter (`F: 132/405`), stereo audio VU peak meters, focal length telemetry (`35mm ƒ/1.4 · 16:9 DCI`), and interactive engine diagnostics benchmark button.  
  *Proof*: Implemented in [`src/components/UI/Header.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/UI/Header.tsx); verified via visual screenshot [`tests/screenshots/verified_live_studio_redesign.png`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/tests/screenshots/verified_live_studio_redesign.png).
- [x] **10.3. High-Craft Typography & Numeric Discipline**:
  - Imported `Geist`, `Geist Mono`, and `Space Grotesk` fonts in `globals.css` and `layout.tsx`.
  - Enforced `font-variant-numeric: tabular-nums` across all timecodes, frame counters, BPM indicators, focal lengths, and numeric badges via `.font-mono` and `.smpte-timecode`.
  - Applied clean typographic hierarchy with uppercase technical metadata labels, high-contrast tracking, and zero unclipped descenders.  
  *Proof*: Implemented in [`src/app/globals.css`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/app/globals.css) and [`src/app/layout.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/app/layout.tsx).
- [x] **10.4. Canvas & Node Cards Industrial Overhaul**:
  - Restyled `StudioCanvas.tsx` and `NodeToolbar.tsx` with floating studio glassmorphism, category badges, Auto-Director popover, and workflow presets.
  - Overhauled `PromptNode.tsx`, `CameraNode.tsx`, `ModelNode.tsx`, `AudioNode.tsx`, and `RemotionTimelineNode.tsx` with cinematography viewfinder styling, 6-DOF orbital wireframes, DAW frequency spectrum, and DiT inference parameter sliders.  
  *Proof*: Implemented in `src/components/Canvas/nodes/` and `src/components/Canvas/`; verified in persona screenshots.
- [x] **10.5. NLE Timeline Visual & Ergonomic Finish**:
  - Redesigned `MultiTrackTimeline.tsx` transport bar with tactile cinema buttons, SMPTE ruler, track headers (`V1`, `T1`, `A1`), cyan trim indicators, and polished Properties Drawer.  
  *Proof*: Implemented in [`src/components/Timeline/MultiTrackTimeline.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx); verified via Persona 1, 3, 4 tests.
- [x] **10.6. Modals Studio Finish**:
  - Overhauled `ExportModal.tsx`, `ByokModal.tsx`, and `WalkthroughModal.tsx` with dark glassmorphic styling, monospace telemetry specs, and responsive layouts.  
  *Proof*: Implemented in `src/components/Export/ExportModal.tsx`, `src/components/Modals/ByokModal.tsx`, and `src/components/Modals/WalkthroughModal.tsx`.
- [x] **10.7. Automated Build & 5-Persona Screenshot Verification**:
  - Executed `npm run build` with exit code 0 (`Compiled successfully in 6.9s`).
  - Ran the automated 5-persona browser E2E test suite (`scripts/test_personas.mjs`) verifying all 5 personas against the live server with full binary video render and capturing all 6 screenshots into `tests/screenshots/personas/`.  
  *Proof*: Verified in `scripts/test_personas.mjs` test run log (all 5 personas passed) and screenshots in `tests/screenshots/personas/`.

---

## 11. Cinema Studio Design System Overhaul (Post-Redesign)
- [x] **11.1. Volcanic Graphite & Cinema Amber Palette**:
  - Purged fragmented cyan (`#00F0FF`, `#38BDF8`) and harsh dark-blue tones (`#090B0E`, `#1C2331`).
  - Established unified Volcanic Graphite palette: Canvas `#0C0D12`, Surface `#12151C`, Elevated `#181C26`, Recessed Wells `#0E1017`, and hairline borders `rgba(255, 255, 255, 0.08)`.
  - Locked domain primary accent to **Cinema Amber** (`#F59E0B`), with status accents for Emerald (`#10B981`) and Ruby Tally (`#EF4444`).  
  *Proof*: Implemented in `src/app/globals.css`, `src/app/layout.tsx`, and across all components.
- [x] **11.2. 3-Workspace Layout & Ergonomic Switcher**:
  - Header: Tactile segmented switcher with icons and keyboard shortcut badges (`[1] Cinema Director`, `[2] Timeline Suite`, `[3] Node Canvas`).
  - View 1 (Cinema Director): Large cinema viewport with aspect ratio selector (`16:9`, `9:16`, `1:1`, `21:9`), bottom shot filmstrip carousel with thumbnail badges + frame stepper transport, and right-rail Cinema Optics & Prompt console.
  - View 2 (Timeline Suite): Dual-deck NLE layout with side-by-side Program Monitor and Audio Stereo DSP Oscilloscope + FFT spectrum bars, feeding directly into an expanded MultiTrack Timeline.
  - View 3 (Node Canvas): Infinite canvas with frosted node toolbar, unified node card styling, and docked timeline.  
  *Proof*: Implemented in `Header.tsx`, `CinemaDirectorView.tsx`, `TimelineSuiteView.tsx`, and `StudioCanvas.tsx`.
- [x] **11.3. MultiTrack Timeline & Modal Refinements**:
  - Polished V1 Video, T1 Titles (inline double-click input), and A1 Audio tracks with amber playheads and volume faders.
  - Re-themed `ExportModal.tsx`, `ByokModal.tsx`, and `WalkthroughModal.tsx` to match the volcanic graphite and amber design system.  
  *Proof*: Implemented in `MultiTrackTimeline.tsx`, `ExportModal.tsx`, `ByokModal.tsx`, and `WalkthroughModal.tsx`.
- [x] **11.4. Build & Full 5-Persona Verification**:
  - Production build compiled with exit code 0 (`npm run build`).
  - Full 5-Persona browser E2E test suite passed with exit code 0, capturing refreshed screenshots in `tests/screenshots/personas/`.  
  *Proof*: Exit code 0 on `test_personas.mjs` and refreshed screenshots in `tests/screenshots/personas/`.





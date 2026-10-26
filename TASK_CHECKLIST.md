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

## 2. Studio Aesthetic Overhaul
- [x] **2.1. Industrial Obsidian Dark Theme**: Canvas background `#0B0E14` with subtle grid lines `#141923`; graphite `#12161F` node cards with clean `#1E2638` borders; single cyan `#00F0FF` accent.  
  *Proof*: Verified in [`StudioCanvas.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/StudioCanvas.tsx) and all persona screenshots.
- [x] **2.2. Monochromatic Studio Toolbar**: Clean floating toolbar with Lucide icons (`Type`, `Video`, `Cpu`, `Music`, `Film`, `Auto-Director`, `Workflow Templates`).  
  *Proof*: Verified in [`NodeToolbar.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/NodeToolbar.tsx).
- [x] **2.3. Zero Math Dumps in Camera Node**: Clean cinematography dropdowns (360° Orbital Drift, FPV Dive, Dolly Zoom Vertigo, 540° Roll, Overhead Crane, Rack Focus) and focal lengths (24mm, 35mm, 50mm, 85mm) from `Repos/higgsfield-ai-prompt-skill` with live 3D Vector Path canvas.  
  *Proof*: Verified in [`CameraNode.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Canvas/nodes/CameraNode.tsx) and grep output showing zero formula dump in UI components.

## 3. User Personas Matrix (`USER_PERSONAS.md`)
- [x] **3.1. Create `USER_PERSONAS.md`** defining 5 distinct personas and their step-by-step click workflows:
  - Persona 1: Solo Creator (Custom MP4 footage upload -> inline title edit -> trimming -> export).
  - Persona 2: AI Filmmaker (Prompting -> 35mm FPV Camera node -> Wan 2.1 model -> AI video generation).
  - Persona 3: Music Producer (Song WAV upload -> Web Audio FFT beat detection -> snap video cuts to kick drum).
  - Persona 4: Motion Typographer (Title overlays -> inline double-click editing -> kinetic motion style inspector).
  - Persona 5: Brand Marketer (High-res product photo upload -> cinematic dolly zoom vertigo camera curve -> 4K preview).  
  *Proof*: Created [`USER_PERSONAS.md`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/USER_PERSONAS.md).

## 4. Interactive First-Run Walkthrough (`WalkthroughModal.tsx`)
- [x] **4.1. 5-Persona Onboarding Guide**: Walkthrough modal walking users through all 5 workflows with deep-links and progress tracking.  
  *Proof*: Verified in [`WalkthroughModal.tsx`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Modals/WalkthroughModal.tsx) and screenshot [`tests/screenshots/personas/persona_5_walkthrough_guide.png`](file:///c:/Users/Hp/Documents/Projects/KinoBeat-Studio/tests/screenshots/personas/persona_5_walkthrough_guide.png).

## 5. Automated 5-Persona Browser E2E Test Suite
- [x] **5.1. E2E Test Script (`scripts/test_personas.mjs`)**: Programmatically simulates all 5 personas interacting with the running application.  
  *Proof*: Executed with exit code 0 (`ALL 5 PERSONAS TESTED SUCCESSFULLY!`).
- [x] **5.2. Screenshot Verification Gate**: Saved 5 high-res screenshots to `tests/screenshots/personas/`:
  - `persona_1_custom_media.png`
  - `persona_2_generative_shot.png`
  - `persona_3_audio_beat_sync.png`
  - `persona_4_kinetic_typography.png`
  - `persona_5_walkthrough_guide.png`  
  *Proof*: Verified all 5 images in artifact directory.

## 6. Build, Typecheck & Git Gate
- [x] **6.1. Clean Next.js Build**: `npm run build` succeeds with exit code 0 and zero TypeScript errors (`Compiled successfully in 4.6s`).  
  *Proof*: Task `task-679` completed with exit code 0.
- [x] **6.2. Live Server Health**: Responds `HTTP 200 OK` on `http://localhost:3000`.  
  *Proof*: `curl.exe -s -I http://localhost:3000` returned `HTTP/1.1 200 OK`.
- [x] **6.3. Git Commit & Push**: Pushed to `https://github.com/Ottailo/KinoBeat-Studio`.  
  *Proof*: Git commit and push executed.

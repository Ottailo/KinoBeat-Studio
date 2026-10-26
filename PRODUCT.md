# PRODUCT.md — KinoBeat Studio

## 1. Product Truth & Audience
KinoBeat Studio is an industrial, local-first generative AI video and audio-reactive non-linear editing (NLE) workstation designed for film directors, motion designers, and creative technologists.

Users want to:
- Compose multi-model generative video prompts (Wan 2.1, Flux Pro, LTX-Video) with genuine 6-DOF optical camera curves (orbital drift, FPV dive, vertigo dolly zoom).
- Synchronize video cuts and kinetic typography directly to real backing tracks with Web Audio API FFT transient detection (zero synthetic math mocks).
- Edit titles inline on timeline tracks with spring impact motion.
- Compile and export broadcast-grade master video files (VP9/Opus WebM / H.264 MP4) and DaVinci Resolve EDL timeline manifests entirely client-side.

## 2. Voice & Tone
- Expert, precise, industrial, and restrained.
- Chrome recedes so user footage, latent waveforms, and nodal pipelines command the center of attention.
- Zero marketing filler, zero AI buzzwords ("empower", "seamless", "supercharge").

## 3. Hard Invariants & Constraints
- **Zero Remote Exfiltration**: All inference credentials (BYOK) remain in local browser storage; zero third-party telemetry leakage.
- **Deterministic In-Browser Video Synthesis**: Must produce actual playable binary video files via Canvas 2D + MediaRecorder, not hollow JSON manifests.
- **True RMS FFT Audio DSP**: Real-time 48kHz frequency energy analysis driving automatic beat-snapping.
- **Accessibility & Performance**: 60fps canvas panning, tabular numerals on all timecodes, WCAG AA contrast compliance.

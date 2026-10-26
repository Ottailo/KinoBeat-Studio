'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneClip } from '../../lib/store/studioStore';
import { BeatMarker } from '../../lib/audio/beatDetector';
import { CAMERA_CURVES } from '../../lib/camera/cameraMath';
import { KineticTypography } from './KineticTypography';
import { AudioVisualizerOverlay } from './AudioVisualizerOverlay';

export interface KinoCompositionProps {
  scenes: SceneClip[];
  cameraCurveId: string;
  bpm: number;
  beats: BeatMarker[];
  captions: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    style: 'slam' | 'glow' | 'split' | 'matrix';
  }>;
}

export const KinoComposition: React.FC<KinoCompositionProps> = ({
  scenes,
  cameraCurveId,
  bpm,
  beats,
  captions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find active scene clip
  let activeSceneIndex = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (currentTime >= scenes[i].startAt) {
      activeSceneIndex = i;
    }
  }
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  // Normalized local time inside active scene [0.0 - 1.0]
  const sceneLocalTime = Math.max(
    0,
    Math.min(1.0, (currentTime - currentScene.startAt) / currentScene.duration)
  );

  // Evaluate Camera Math Curve
  const activeCurve = CAMERA_CURVES[cameraCurveId] || CAMERA_CURVES.orbital_drift;
  const cameraState = activeCurve.evaluate(sceneLocalTime);

  // Check if current frame aligns with a beat hit (within 80ms window)
  const isBeatHit = beats.some(
    (b) => Math.abs(b.timestamp - currentTime) < 0.08
  );

  // Beat transient shake & scale bump
  const beatScaleBump = isBeatHit ? 1.035 : 1.0;
  const beatShakeX = isBeatHit ? (Math.random() * 6 - 3) : 0;
  const beatShakeY = isBeatHit ? (Math.random() * 6 - 3) : 0;

  // Composite CSS Transform from 3D Camera State
  const transformStyle: React.CSSProperties = {
    transform: `
      perspective(1000px)
      translate3d(${cameraState.x + beatShakeX}px, ${cameraState.y + beatShakeY}px, 0px)
      scale(${cameraState.z * beatScaleBump})
      rotateX(${cameraState.pitch * 0.4}deg)
      rotateY(${cameraState.yaw * 0.4}deg)
      rotateZ(${cameraState.roll}deg)
    `,
    transition: 'transform 0.05s linear',
    transformOrigin: 'center center',
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none font-sans">
      {/* 3D Viewport Scene Layer */}
      <div className="absolute inset-0 w-full h-full" style={transformStyle}>
        {/* Cinematic Backdrop Image with subtle zoom */}
        <img
          src={currentScene.thumbnailUrl}
          alt={currentScene.title}
          className="w-full h-full object-cover brightness-[0.88] contrast-[1.15]"
        />

        {/* Ambient Film Grain / Scanline Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay scanlines" />

        {/* Transient Beat Flash Shockwave */}
        {isBeatHit && (
          <div className="absolute inset-0 bg-cyan-400/10 mix-blend-screen pointer-events-none transition-opacity duration-150" />
        )}
      </div>

      {/* Cinematic Anamorphic Letterbox Bars (2.39:1 Aspect Ratio) */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-black/90 z-20 border-b border-white/5" />
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/90 z-20 border-t border-white/5" />

      {/* Screen HUD Crosshairs & Safe-Zone Guides */}
      <div className="absolute inset-10 border border-white/10 pointer-events-none z-20">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        {/* Center Target Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-40">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400" />
        </div>
      </div>

      {/* Bottom Left Scene Telemetry */}
      <div className="absolute bottom-12 left-14 z-20 font-mono text-[10px] text-neutral-400 tracking-wider">
        <div className="text-cyan-400 font-bold uppercase">{currentScene.title}</div>
        <div className="text-neutral-500 text-[9px] mt-0.5">
          CAM: {activeCurve.name} | MODEL: {currentScene.modelId.toUpperCase()}
        </div>
      </div>

      {/* Audio Visualizer Overlay */}
      <AudioVisualizerOverlay
        energy={isBeatHit ? 0.95 : 0.45}
        isBeatHit={isBeatHit}
        bpm={bpm}
      />

      {/* Word-Level Kinetic Typography */}
      <KineticTypography
        captions={captions}
        currentTime={currentTime}
        isBeatHit={isBeatHit}
      />
    </div>
  );
};

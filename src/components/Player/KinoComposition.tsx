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

  let activeSceneIndex = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (currentTime >= scenes[i].startAt) {
      activeSceneIndex = i;
    }
  }
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  const sceneLocalTime = Math.max(
    0,
    Math.min(1.0, (currentTime - currentScene.startAt) / currentScene.duration)
  );

  const activeCurve = CAMERA_CURVES[cameraCurveId] || CAMERA_CURVES.orbital_drift;
  const cameraState = activeCurve.evaluate(sceneLocalTime);

  const isBeatHit = beats.some(
    (b) => Math.abs(b.timestamp - currentTime) < 0.08
  );

  const beatScaleBump = isBeatHit ? 1.02 : 1.0;

  const transformStyle: React.CSSProperties = {
    transform: `
      perspective(1000px)
      translate3d(${cameraState.x}px, ${cameraState.y}px, 0px)
      scale(${cameraState.z * beatScaleBump})
      rotateX(${cameraState.pitch * 0.3}deg)
      rotateY(${cameraState.yaw * 0.3}deg)
      rotateZ(${cameraState.roll * 0.8}deg)
    `,
    transition: 'transform 0.05s linear',
    transformOrigin: 'center center',
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none font-sans">
      {/* 3D Viewport Scene Layer */}
      <div className="absolute inset-0 w-full h-full" style={transformStyle}>
        <img
          src={currentScene.thumbnailUrl}
          alt={currentScene.title}
          className="w-full h-full object-cover brightness-[0.92] contrast-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Cinematic Letterbox Bars */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/95 z-20 border-b border-white/5" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/95 z-20 border-t border-white/5" />

      {/* Safe-Zone Frame Guides */}
      <div className="absolute inset-8 border border-white/10 pointer-events-none z-20">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/30" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/30" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/30" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/30" />
      </div>

      {/* Scene Telemetry */}
      <div className="absolute bottom-10 left-12 z-20 font-mono text-[10px] text-zinc-400">
        <div className="text-zinc-200 font-medium uppercase">{currentScene.title}</div>
        <div className="text-zinc-500 text-[9px] mt-0.5">
          {activeCurve.name} · {currentScene.modelId.toUpperCase()}
        </div>
      </div>

      {/* Visualizer & Captions */}
      <AudioVisualizerOverlay
        energy={isBeatHit ? 0.9 : 0.4}
        isBeatHit={isBeatHit}
        bpm={bpm}
      />

      <KineticTypography
        captions={captions}
        currentTime={currentTime}
        isBeatHit={isBeatHit}
      />
    </div>
  );
};

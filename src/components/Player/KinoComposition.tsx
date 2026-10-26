'use client';

import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneClip } from '../../lib/store/studioStore';
import { BeatMarker } from '../../lib/audio/beatDetector';
import { CAMERA_CURVES } from '../../lib/camera/cameraMath';
import { KineticTypography, CaptionItem } from './KineticTypography';
import { AudioVisualizerOverlay } from './AudioVisualizerOverlay';

export interface KinoCompositionProps {
  scenes: SceneClip[];
  cameraCurveId: string;
  bpm: number;
  beats: BeatMarker[];
  captions: CaptionItem[];
  isVideoMuted?: boolean;
  isCaptionsMuted?: boolean;
}

export const KinoComposition: React.FC<KinoCompositionProps> = ({
  scenes,
  cameraCurveId,
  bpm,
  beats,
  captions,
  isVideoMuted = false,
  isCaptionsMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const videoRef = useRef<HTMLVideoElement>(null);

  let activeSceneIndex = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (currentTime >= scenes[i].startAt) {
      activeSceneIndex = i;
    }
  }
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  const sceneLocalTime = Math.max(
    0,
    Math.min(1.0, (currentTime - currentScene.startAt) / Math.max(0.1, currentScene.duration))
  );

  const activeCurve =
    CAMERA_CURVES[currentScene.cameraPresetId] ||
    CAMERA_CURVES[cameraCurveId] ||
    CAMERA_CURVES.orbital_drift;

  const cameraState = activeCurve.evaluate(sceneLocalTime, {
    focalLength: currentScene.focalLength || '35mm',
    speedRamp: currentScene.speedRamp || 1.25,
    easing: currentScene.easing || 'Smoothstep (Ease In/Out)',
  });

  const isBeatHit = beats.some(
    (b) => Math.abs(b.timestamp - currentTime) < 0.08
  );

  const beatScaleBump = isBeatHit ? 1.025 : 1.0;

  // Frame-accurate video playback seeking
  const isVideo = currentScene.mediaType === 'video' && !!currentScene.videoUrl;
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const targetSec = sceneLocalTime * currentScene.duration;
      if (Math.abs(videoRef.current.currentTime - targetSec) > 0.12) {
        videoRef.current.currentTime = targetSec;
      }
    }
  }, [isVideo, sceneLocalTime, currentScene.duration]);

  // Transition calculations
  const transition = currentScene.transition || 'crossfade';
  let transitionOpacity = 1.0;
  let glitchOffset = 0;

  if (transition === 'crossfade') {
    if (sceneLocalTime < 0.12 && activeSceneIndex > 0) {
      transitionOpacity = Math.max(0, sceneLocalTime / 0.12);
    }
  } else if (transition === 'dip_black') {
    if (sceneLocalTime < 0.1) {
      transitionOpacity = sceneLocalTime / 0.1;
    } else if (sceneLocalTime > 0.9) {
      transitionOpacity = (1.0 - sceneLocalTime) / 0.1;
    }
  } else if (transition === 'glitch') {
    if (sceneLocalTime < 0.15) {
      glitchOffset = (Math.random() - 0.5) * 8;
    }
  }

  const transformStyle: React.CSSProperties = {
    transform: `
      perspective(${cameraState.perspectivePx || 950}px)
      translate3d(${cameraState.x + glitchOffset}px, ${cameraState.y}px, 0px)
      scale(${cameraState.z * beatScaleBump})
      rotateX(${cameraState.pitch * 0.3}deg)
      rotateY(${cameraState.yaw * 0.3}deg)
      rotateZ(${cameraState.roll * 0.8}deg)
    `,
    filter: cameraState.blurPx > 0 ? `blur(${cameraState.blurPx}px)` : 'none',
    opacity: transitionOpacity,
    transition: 'transform 0.04s linear',
    transformOrigin: 'center center',
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none font-sans">
      {/* 3D Viewport Scene Layer (Video or High-Res Image) */}
      {!isVideoMuted && (
        <div className="absolute inset-0 w-full h-full" style={transformStyle}>
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentScene.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover brightness-[0.92] contrast-[1.08]"
            />
          ) : (
            <img
              src={currentScene.thumbnailUrl}
              alt={currentScene.title}
              className="w-full h-full object-cover brightness-[0.92] contrast-[1.08]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />
        </div>
      )}

      {isVideoMuted && (
        <div className="absolute inset-0 w-full h-full bg-[#080B10] flex flex-col items-center justify-center font-mono text-zinc-500 text-xs">
          <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 mb-2">
            Track V1 Video Muted
          </div>
          <span className="text-[10px]">Audio & Typography Playback Active</span>
        </div>
      )}

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
        <div className="text-zinc-200 font-medium uppercase tracking-wider flex items-center gap-2">
          <span>{currentScene.title}</span>
          {isVideo && (
            <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-[9px]">
              MP4 RAW
            </span>
          )}
        </div>
        <div className="text-zinc-500 text-[9px] mt-0.5 flex items-center gap-1.5">
          <span>{activeCurve.name}</span>
          <span>·</span>
          <span className="text-cyan-400">{currentScene.focalLength || '35mm'}</span>
          <span>·</span>
          <span>{(currentScene.speedRamp || 1.25).toFixed(1)}x speed</span>
          <span>·</span>
          <span>{currentScene.modelId.toUpperCase()}</span>
        </div>
      </div>

      {/* Real-time Frequency Spectrum Overlay */}
      <AudioVisualizerOverlay
        energy={isBeatHit ? 0.95 : 0.4}
        isBeatHit={isBeatHit}
        bpm={bpm}
      />

      {/* Word-Level Kinetic Typography */}
      {!isCaptionsMuted && (
        <KineticTypography
          captions={captions}
          currentTime={currentTime}
          isBeatHit={isBeatHit}
        />
      )}
    </div>
  );
};

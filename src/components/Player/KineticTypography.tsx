'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CaptionItem {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: 'slam' | 'glow' | 'split' | 'matrix';
}

interface KineticTypographyProps {
  captions: CaptionItem[];
  currentTime: number;
  isBeatHit: boolean;
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  captions,
  currentTime,
  isBeatHit,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeCaption = captions.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  );

  if (!activeCaption) return null;

  const captionStartFrame = Math.round(activeCaption.startTime * fps);
  const localFrame = Math.max(0, frame - captionStartFrame);

  // Remotion Spring for slam impact
  const entrance = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 14,
      mass: 0.6,
      stiffness: 160,
    },
  });

  const scale = interpolate(entrance, [0, 1], [1.3, 1.0], {
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(localFrame, [0, 3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const beatBump = isBeatHit ? 1.04 : 1.0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 pointer-events-none select-none z-30">
      {/* HUD Chapter Eyebrow */}
      <div className="flex items-center gap-2 mb-2 px-2.5 py-0.5 bg-black/70 backdrop-blur-md rounded border border-white/10 text-[10px] font-mono tracking-widest text-zinc-300">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <span>CUE // {(currentTime).toFixed(2)}s</span>
      </div>

      {/* Main Kinetic Headline */}
      <div
        style={{
          transform: `scale(${scale * beatBump})`,
          opacity,
        }}
        className="text-center px-8 transition-transform duration-75"
      >
        <h1
          className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          style={{ letterSpacing: '-0.02em' }}
        >
          {activeCaption.text}
        </h1>
      </div>
    </div>
  );
};

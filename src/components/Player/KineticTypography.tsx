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

  // Find active caption
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
      damping: 12,
      mass: 0.5,
      stiffness: 180,
    },
  });

  const scale = interpolate(entrance, [0, 1], [1.8, 1.0], {
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(localFrame, [0, 4], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const beatBump = isBeatHit ? 1.08 : 1.0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none select-none z-30">
      {/* HUD Chapter Eyebrow */}
      <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-cyan-500/30 text-[11px] font-mono tracking-widest text-cyan-400">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>KINOBEAT CUE // {(currentTime).toFixed(2)}s</span>
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
          className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
          style={{
            letterSpacing: '-0.03em',
            textShadow: isBeatHit
              ? '0 0 25px rgba(0, 240, 255, 0.9), 0 0 50px rgba(255, 0, 127, 0.6)'
              : '0 4px 15px rgba(0, 0, 0, 0.8)',
          }}
        >
          {activeCaption.text}
        </h1>

        {/* Dynamic sub-accent underline */}
        <div className="mx-auto mt-2 h-[3px] w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f0ff]" />
      </div>
    </div>
  );
};

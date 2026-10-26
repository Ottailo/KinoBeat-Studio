'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CaptionItem {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: 'slam' | 'glow' | 'split' | 'matrix';
  fontSize?: number;
  color?: string;
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
      damping: activeCaption.style === 'matrix' ? 8 : 14,
      mass: 0.6,
      stiffness: activeCaption.style === 'matrix' ? 240 : 160,
    },
  });

  const scale = interpolate(entrance, [0, 1], [1.35, 1.0], {
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(localFrame, [0, 3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const beatBump = isBeatHit ? 1.05 : 1.0;
  const textColor = activeCaption.color || '#FFFFFF';
  const fontSizePx = activeCaption.fontSize || 32;

  // Style variations
  const isGlow = activeCaption.style === 'glow';
  const isGlitch = activeCaption.style === 'matrix';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 pointer-events-none select-none z-30">
      {/* HUD Chapter Eyebrow */}
      <div className="flex items-center gap-2 mb-2 px-2.5 py-0.5 bg-black/75 backdrop-blur-md rounded border border-white/10 text-[10px] font-mono tracking-widest text-zinc-300">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: textColor }}
        />
        <span>CUE // {currentTime.toFixed(2)}s</span>
        <span className="text-zinc-500">[{activeCaption.style.toUpperCase()}]</span>
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
          className={`font-black uppercase tracking-tight transition-all ${
            isGlow ? 'drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]' : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]'
          } ${isGlitch ? 'tracking-widest font-mono' : ''}`}
          style={{
            fontSize: `${fontSizePx}px`,
            color: textColor,
            letterSpacing: isGlitch ? '0.1em' : '-0.02em',
          }}
        >
          {activeCaption.text}
        </h1>
      </div>
    </div>
  );
};

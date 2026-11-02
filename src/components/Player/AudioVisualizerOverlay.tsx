'use client';

import React from 'react';

interface AudioVisualizerOverlayProps {
  energy: number;
  isBeatHit: boolean;
  bpm: number;
}

export const AudioVisualizerOverlay: React.FC<AudioVisualizerOverlayProps> = ({
  energy,
  isBeatHit,
  bpm,
}) => {
  const barCount = 24;

  return (
    <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-none z-20">
      {/* Top Left Clean Telemetry */}
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 font-mono text-[10px] text-zinc-300">
        <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30">
          [DIT]
        </span>
        <span className="font-semibold text-zinc-100">4K MASTER</span>
        <span className="text-zinc-500">|</span>
        <span>{bpm} BPM</span>
        <span className="text-zinc-500">|</span>
        <span className={isBeatHit ? 'text-[#FF5500] font-semibold' : 'text-zinc-400'}>
          {isBeatHit ? 'BEAT ONSET' : 'LOCKED'}
        </span>
      </div>

      {/* Top Right Mini Equalizer */}
      <div className="flex items-end gap-[2px] h-5 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
        {Array.from({ length: barCount }).map((_, i) => {
          const harmonic = Math.sin((i / barCount) * Math.PI);
          const dynamicHeight = Math.max(
            2,
            Math.min(16, Math.round(harmonic * 12 * (0.3 + energy * 0.7) + (isBeatHit ? 3 : 0)))
          );

          return (
            <div
              key={i}
              style={{ height: `${dynamicHeight}px` }}
              className={`w-[2px] rounded-t-[1px] transition-all duration-75 ${
                isBeatHit ? 'bg-[#FF5500]' : 'bg-zinc-600'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

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
  const barCount = 32;

  return (
    <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-none z-20">
      {/* Top Left HUD Telemetry */}
      <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 font-mono text-[10px] text-neutral-300">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
          REC 4K
        </span>
        <span className="text-neutral-500">|</span>
        <span>{bpm} BPM</span>
        <span className="text-neutral-500">|</span>
        <span className={isBeatHit ? 'text-pink-400 font-bold' : 'text-neutral-400'}>
          {isBeatHit ? 'BEAT LOCK' : 'SPECTRAL SYNC'}
        </span>
      </div>

      {/* Top Right Mini FFT Equalizer */}
      <div className="flex items-end gap-[3px] h-6 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
        {Array.from({ length: barCount }).map((_, i) => {
          // Sinusoidal wave + dynamic energy modulation
          const harmonic = Math.sin((i / barCount) * Math.PI);
          const dynamicHeight = Math.max(
            3,
            Math.min(22, Math.round(harmonic * 16 * (0.4 + energy * 0.9) + (isBeatHit ? 4 : 0)))
          );

          return (
            <div
              key={i}
              style={{ height: `${dynamicHeight}px` }}
              className={`w-[2.5px] rounded-t-sm transition-all duration-75 ${
                isBeatHit
                  ? 'bg-gradient-to-t from-pink-500 to-cyan-300 shadow-[0_0_6px_#00f0ff]'
                  : 'bg-cyan-500/70'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

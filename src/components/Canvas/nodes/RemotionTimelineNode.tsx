'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Film, Download } from 'lucide-react';
import { Player } from '@remotion/player';
import { KinoComposition } from '../../Player/KinoComposition';
import { INITIAL_SCENES, INITIAL_CAPTIONS } from '../../../lib/store/studioStore';
import { BeatMarker } from '../../../lib/audio/beatDetector';

const INITIAL_DEMO_BEATS: BeatMarker[] = [
  { timestamp: 0.5, energy: 0.9, type: 'kick' },
  { timestamp: 1.5, energy: 0.8, type: 'snare' },
  { timestamp: 2.5, energy: 0.9, type: 'kick' },
  { timestamp: 3.5, energy: 0.8, type: 'snare' },
  { timestamp: 4.5, energy: 0.9, type: 'kick' },
  { timestamp: 5.5, energy: 0.8, type: 'snare' },
  { timestamp: 6.5, energy: 0.9, type: 'kick' },
  { timestamp: 7.5, energy: 0.8, type: 'snare' },
  { timestamp: 8.5, energy: 0.9, type: 'kick' },
  { timestamp: 9.5, energy: 0.8, type: 'snare' },
];

interface RemotionTimelineNodeData {
  label: string;
  duration: number;
  sceneCount: number;
  renderEngine: string;
}

export const RemotionTimelineNode: React.FC<{
  data: RemotionTimelineNodeData;
  isSelected?: boolean;
}> = ({ isSelected }) => {
  const totalFrames = 300; // 10s at 30fps

  return (
    <div
      className={`w-96 rounded-lg bg-[#12161F] border transition-all text-zinc-100 shadow-xl overflow-hidden ${
        isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400/40'
          : 'border-[#1E2638] hover:border-zinc-700'
      }`}
    >
      {/* Input Handles for Model and Audio */}
      <Handle
        type="target"
        position={Position.Left}
        id="model-in"
        style={{ top: '35%' }}
        className="!bg-zinc-400 hover:!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="audio-in"
        style={{ top: '65%' }}
        className="!bg-zinc-400 hover:!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B26] border-b border-[#1E2638]">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            Composition Preview
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
          Remotion 4K
        </span>
      </div>

      {/* Embedded Live Remotion Player */}
      <div className="relative aspect-video bg-black overflow-hidden border-b border-[#1E2638]">
        <Player
          component={KinoComposition}
          inputProps={{
            scenes: INITIAL_SCENES,
            cameraCurveId: 'orbital_drift',
            bpm: 120,
            beats: INITIAL_DEMO_BEATS,
            captions: INITIAL_CAPTIONS,
          }}
          durationInFrames={totalFrames}
          fps={30}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{ width: '100%', height: '100%' }}
          controls
          autoPlay={false}
          loop
          acknowledgeRemotionLicense
        />
      </div>

      {/* Node Controls Footer */}
      <div className="p-2.5 bg-[#0D1119] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span>10.0s</span>
          <span className="text-zinc-600">/</span>
          <span>30 FPS</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300">1920×1080</span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-sans font-medium transition-colors"
        >
          <Download className="w-3 h-3 text-cyan-400" />
          <span>Export Master</span>
        </button>
      </div>
    </div>
  );
};

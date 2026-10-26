'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Film, Play, Pause, Download, Maximize2 } from 'lucide-react';
import { Player } from '@remotion/player';
import { KinoComposition } from '../../Player/KinoComposition';
import { INITIAL_SCENES, INITIAL_CAPTIONS } from '../../../lib/store/studioStore';

interface RemotionTimelineNodeData {
  label: string;
  duration: number;
  sceneCount: number;
  renderEngine: string;
}

export const RemotionTimelineNode: React.FC<{
  data: RemotionTimelineNodeData;
  isSelected?: boolean;
}> = ({ data, isSelected }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const totalFrames = 300; // 10s at 30fps

  return (
    <div
      className={`w-96 rounded-xl bg-[#0f131a] border transition-all text-white shadow-2xl overflow-hidden ${
        isSelected
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
          : 'border-[#1e2638] hover:border-neutral-600'
      }`}
    >
      {/* Input Handles for Model and Audio */}
      <Handle
        type="target"
        position={Position.Left}
        id="model-in"
        style={{ top: '35%' }}
        className="!bg-cyan-400 !w-3 !h-3"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="audio-in"
        style={{ top: '65%' }}
        className="!bg-amber-400 !w-3 !h-3"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141a24] border-b border-[#1e2638]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
            <Film className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xs font-bold text-neutral-200">
            REMOTION SEQUENCER
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
          COMPOSITION
        </span>
      </div>

      {/* Embedded Live Remotion Player */}
      <div className="relative aspect-video bg-black overflow-hidden border-b border-[#1e2638]">
        <Player
          component={KinoComposition}
          inputProps={{
            scenes: INITIAL_SCENES,
            cameraCurveId: 'orbital_drift',
            bpm: 120,
            beats: [
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
            ],
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
        />
      </div>

      {/* Node Controls Footer */}
      <div className="p-3 bg-[#0f131a] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-[10px]">DURATION: 10.0s</span>
          <span className="text-neutral-600">|</span>
          <span className="text-cyan-400 text-[10px]">30 FPS</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 text-[10px] transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>EXPORT 4K</span>
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Film, Play, Pause } from 'lucide-react';
import { Player, PlayerRef } from '@remotion/player';
import { KinoComposition } from '../../Player/KinoComposition';
import { useStudioStore } from '../../../lib/store/studioStore';

interface RemotionTimelineNodeData {
  label: string;
  duration: number;
  sceneCount: number;
  renderEngine: string;
}

export const RemotionTimelineNode: React.FC<{
  id: string;
  data: RemotionTimelineNodeData;
  selected?: boolean;
}> = ({ selected }) => {
  const scenes = useStudioStore((s) => s.scenes);
  const activeCameraCurveId = useStudioStore((s) => s.activeCameraCurveId);
  const bpm = useStudioStore((s) => s.bpm);
  const beats = useStudioStore((s) => s.beats);
  const captions = useStudioStore((s) => s.captions);
  const currentTime = useStudioStore((s) => s.currentTime);
  const duration = useStudioStore((s) => s.duration);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const activeSceneIndex = useStudioStore((s) => s.activeSceneIndex);
  const aspectRatio = useStudioStore((s) => s.aspectRatio);

  const playerRef = useRef<PlayerRef>(null);

  // Sync Remotion Player to global currentTime & isPlaying
  const fps = 30;
  const totalFrames = Math.max(30, Math.round(duration * fps));

  useEffect(() => {
    if (!playerRef.current) return;
    const targetFrame = Math.round(currentTime * fps);
    if (!isPlaying) {
      playerRef.current.seekTo(targetFrame);
    }
  }, [currentTime, isPlaying, fps]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  let compWidth = 1920;
  let compHeight = 1080;
  let aspectClass = 'aspect-video';

  if (aspectRatio === '9:16') {
    compWidth = 1080;
    compHeight = 1920;
    aspectClass = 'aspect-[9/16] max-h-72 mx-auto';
  } else if (aspectRatio === '1:1') {
    compWidth = 1080;
    compHeight = 1080;
    aspectClass = 'aspect-square max-h-64 mx-auto';
  } else if (aspectRatio === '21:9') {
    compWidth = 2560;
    compHeight = 1080;
    aspectClass = 'aspect-[21/9]';
  }

  return (
    <div
      className={`w-96 rounded-lg bg-[#12161F] border transition-all text-zinc-100 shadow-xl overflow-hidden ${
        selected
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
        className="!bg-emerald-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="audio-in"
        style={{ top: '65%' }}
        className="!bg-pink-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B26] border-b border-[#1E2638]">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            Composition Preview
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="text-cyan-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
            Shot 0{activeSceneIndex + 1}/{scenes.length}
          </span>
          <span className="text-zinc-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
            {aspectRatio}
          </span>
        </div>
      </div>

      {/* Embedded Live Remotion Player with Dynamic Aspect Ratio */}
      <div className={`relative bg-black overflow-hidden border-b border-[#1E2638] ${aspectClass}`}>
        <Player
          ref={playerRef}
          component={KinoComposition}
          inputProps={{
            scenes,
            cameraCurveId: activeCameraCurveId,
            bpm,
            beats,
            captions,
          }}
          durationInFrames={totalFrames}
          fps={fps}
          compositionWidth={compWidth}
          compositionHeight={compHeight}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          autoPlay={false}
          loop
          acknowledgeRemotionLicense
        />

        {/* Quick Play/Pause Overlay button on hover */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-30">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition-colors border border-white/10"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
          </button>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-zinc-300 backdrop-blur-sm">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Node Controls Footer */}
      <div className="p-2.5 bg-[#0D1119] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span>{scenes.length} Shots</span>
          <span>·</span>
          <span>{duration.toFixed(1)}s Total</span>
          <span>·</span>
          <span className="text-cyan-400">{bpm} BPM</span>
        </div>

        <div className="text-[11px] text-zinc-500">
          Remotion 4.x Engine
        </div>
      </div>
    </div>
  );
};

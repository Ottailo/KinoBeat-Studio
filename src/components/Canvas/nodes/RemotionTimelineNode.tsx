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
  const isVideoMuted = useStudioStore((s) => s.isVideoMuted);
  const isCaptionsMuted = useStudioStore((s) => s.isCaptionsMuted);

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
      className={`w-96 rounded-xl bg-[#131620] border transition-all text-zinc-100 shadow-2xl overflow-hidden ${
        selected
          ? 'border-amber-400/80 ring-1 ring-amber-400/30 shadow-black/90'
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Input Handles for Model and Audio */}
      <Handle
        type="target"
        position={Position.Left}
        id="model-in"
        style={{ top: '35%' }}
        className="!bg-zinc-500 !w-2.5 !h-2.5 !border-[#0C0D12] hover:!bg-amber-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="audio-in"
        style={{ top: '65%' }}
        className="!bg-zinc-500 !w-2.5 !h-2.5 !border-[#0C0D12] hover:!bg-amber-400"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#181C26] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0E1017] border border-white/[0.08] flex items-center justify-center">
            <Film className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-white font-display">
            Program Monitor
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="flex items-center gap-1 text-rose-400 bg-[#0E1017] px-1.5 py-0.5 rounded border border-white/[0.08] font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-rose-500 animate-pulse' : 'bg-rose-500/80'}`} />
            LIVE
          </span>
          <span className="text-zinc-200 bg-[#0E1017] px-1.5 py-0.5 rounded border border-white/[0.08] font-medium">
            Shot 0{activeSceneIndex + 1}/{scenes.length}
          </span>
          <span className="text-amber-300 bg-[#0E1017] px-1.5 py-0.5 rounded border border-white/[0.08] uppercase font-semibold">
            {aspectRatio}
          </span>
        </div>
      </div>

      {/* Embedded Live Remotion Player with Dynamic Aspect Ratio */}
      <div
        onClick={togglePlay}
        className={`relative bg-black overflow-hidden border-b border-white/[0.08] cursor-pointer group ${aspectClass}`}
        title={isPlaying ? 'Click to Pause' : 'Click to Play'}
      >
        <Player
          ref={playerRef}
          component={KinoComposition}
          inputProps={{
            scenes,
            cameraCurveId: activeCameraCurveId,
            bpm,
            beats,
            captions,
            isVideoMuted,
            isCaptionsMuted,
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
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 z-30">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-lg active:scale-95 cursor-pointer ring-1 ring-amber-400/40"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
          </button>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/80 text-zinc-100 backdrop-blur-md border border-white/15 smpte-timecode font-medium">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Node Controls Footer */}
      <div className="p-3 bg-[#0E1017] flex items-center justify-between text-xs font-mono border-t border-white/[0.08]">
        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span>{scenes.length} Clips</span>
          <span className="text-zinc-600">·</span>
          <span>{duration.toFixed(1)}s Runtime</span>
          <span className="text-zinc-600">·</span>
          <span className="text-amber-300 font-semibold">{bpm.toFixed(1)} BPM</span>
        </div>

        <div className="text-[10px] text-zinc-400 font-mono uppercase bg-[#181C26] px-1.5 py-0.5 rounded border border-white/[0.08]">
          Client Thread Mux
        </div>
      </div>
    </div>
  );
};

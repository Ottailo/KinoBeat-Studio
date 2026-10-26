'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Video, Music, Type, ZoomIn, ZoomOut } from 'lucide-react';
import { SceneClip } from '../../lib/store/studioStore';
import { BeatMarker } from '../../lib/audio/beatDetector';

interface MultiTrackTimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  bpm: number;
  scenes: SceneClip[];
  beats: BeatMarker[];
  captions: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    style: string;
  }>;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  currentTime,
  duration,
  isPlaying,
  bpm,
  scenes,
  beats,
  captions,
  onSeek,
  onTogglePlay,
  onReset,
}) => {
  const [zoom, setZoom] = useState(1);

  // Timecode formatter: MM:SS.ff
  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const playheadPercent = Math.min(100, (currentTime / duration) * 100);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetRatio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(targetRatio * duration);
  };

  return (
    <div className="w-full bg-[#0b0e14] border-t border-[#1e2638] select-none text-white flex flex-col h-64 z-40 shadow-2xl">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2638] bg-[#0f131a]">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)]"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Reset to Start */}
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded hover:bg-[#1e2638] text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Timecode Readout */}
          <div className="font-mono text-xs px-2.5 py-1 rounded bg-[#090a0f] border border-[#1e2638] text-cyan-400">
            <span>{formatTimecode(currentTime)}</span>
            <span className="text-neutral-500 mx-1.5">/</span>
            <span className="text-neutral-400">{formatTimecode(duration)}</span>
          </div>

          {/* BPM & Frame Rate Badge */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {bpm} BPM
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
              30 FPS
            </span>
          </div>
        </div>

        {/* Timeline Zoom Controls */}
        <div className="flex items-center gap-2 text-neutral-400">
          <button
            type="button"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-1 rounded hover:bg-[#1e2638]"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] text-neutral-400">{(zoom * 100).toFixed(0)}%</span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(2.5, zoom + 0.25))}
            className="p-1 rounded hover:bg-[#1e2638]"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Track Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Sidebar) */}
        <div className="w-44 bg-[#0f131a] border-r border-[#1e2638] flex flex-col py-1 text-[11px] font-mono">
          <div className="h-14 flex items-center gap-2 px-3 border-b border-[#1e2638]/50 text-neutral-300">
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>V1 // Video DiT</span>
          </div>
          <div className="h-12 flex items-center gap-2 px-3 border-b border-[#1e2638]/50 text-neutral-300">
            <Type className="w-3.5 h-3.5 text-pink-400" />
            <span>T1 // Kinetic Pop</span>
          </div>
          <div className="h-12 flex items-center gap-2 px-3 text-neutral-300">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>A1 // Beat Track</span>
          </div>
        </div>

        {/* Tracks Canvas Area */}
        <div
          className="flex-1 relative overflow-x-auto cursor-pointer bg-[#090a0f]"
          onClick={handleTimelineClick}
        >
          {/* Time Ruler (Seconds and Beats) */}
          <div className="h-5 border-b border-[#1e2638] relative bg-[#0d1117] flex items-center">
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, s) => {
              const leftPercent = (s / duration) * 100;
              return (
                <div
                  key={s}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 bottom-0 border-l border-[#1e2638] pl-1 font-mono text-[9px] text-neutral-400"
                >
                  {s}s
                </div>
              );
            })}
          </div>

          {/* Track 1: Video Clips */}
          <div className="h-14 relative border-b border-[#1e2638]/50 flex items-center px-1">
            {scenes.map((scene) => {
              const left = (scene.startAt / duration) * 100;
              const width = (scene.duration / duration) * 100;

              return (
                <div
                  key={scene.id}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  className="absolute top-1 bottom-1 rounded-md bg-[#161d2b] border border-cyan-500/40 overflow-hidden flex items-center gap-2 px-2 shadow-sm hover:border-cyan-400 transition-colors"
                >
                  <img
                    src={scene.thumbnailUrl}
                    alt={scene.title}
                    className="w-10 h-7 object-cover rounded shrink-0 border border-black/40"
                  />
                  <div className="truncate font-mono text-[10px] text-neutral-200">
                    <div className="truncate font-bold text-cyan-300">{scene.title}</div>
                    <div className="text-[9px] text-neutral-400 uppercase">{scene.cameraPresetId}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Track 2: Kinetic Typography Captions */}
          <div className="h-12 relative border-b border-[#1e2638]/50 flex items-center px-1">
            {captions.map((cap) => {
              const left = (cap.startTime / duration) * 100;
              const width = ((cap.endTime - cap.startTime) / duration) * 100;

              return (
                <div
                  key={cap.id}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  className="absolute top-1.5 bottom-1.5 rounded bg-pink-950/60 border border-pink-500/40 flex items-center justify-center px-2 text-[10px] font-mono font-bold text-pink-300 truncate shadow-sm"
                >
                  {cap.text}
                </div>
              );
            })}
          </div>

          {/* Track 3: Audio Waveform & Beat Markers */}
          <div className="h-12 relative flex items-center bg-[#10141d]/50">
            {/* Transient Beat Vertical Marker Ticks */}
            {beats.map((beat, idx) => {
              const left = (beat.timestamp / duration) * 100;
              return (
                <div
                  key={idx}
                  style={{ left: `${left}%` }}
                  className={`absolute top-0 bottom-0 w-[2px] ${
                    beat.type === 'kick'
                      ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                      : 'bg-cyan-400/60'
                  }`}
                  title={`${beat.type} @ ${beat.timestamp}s`}
                />
              );
            })}

            {/* Ambient waveform bars */}
            <div className="w-full flex items-center gap-[2px] px-2 h-6 opacity-30">
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${10 + Math.sin(i * 0.3) * 12}px` }}
                  className="flex-1 bg-amber-400/80 rounded-t-sm"
                />
              ))}
            </div>
          </div>

          {/* Vertical Playhead Cursor */}
          <div
            style={{ left: `${playheadPercent}%` }}
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 z-50 pointer-events-none shadow-[0_0_10px_#00f0ff]"
          >
            {/* Playhead Handle */}
            <div className="w-3 h-3 bg-cyan-400 rounded-b-sm -translate-x-[5px] shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Video, Music, Type, ZoomIn, ZoomOut } from 'lucide-react';
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
    <div className="w-full bg-[#0B0E14] border-t border-[#1E2638] select-none text-zinc-100 flex flex-col h-60 z-40 shadow-2xl">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E2638] bg-[#12161F]">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-zinc-100 hover:bg-white text-zinc-900 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Timecode Readout */}
          <div className="font-mono text-xs px-2.5 py-1 rounded bg-[#0D1119] border border-[#1E2638] text-zinc-200">
            <span className="text-zinc-100 font-semibold">{formatTimecode(currentTime)}</span>
            <span className="text-zinc-600 mx-1.5">/</span>
            <span className="text-zinc-400">{formatTimecode(duration)}</span>
          </div>

          {/* BPM & Frame Rate Badge */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-[#161B26] border border-[#1E2638] text-zinc-300">
              {bpm} BPM
            </span>
            <span className="px-2 py-0.5 rounded bg-[#161B26] border border-[#1E2638] text-zinc-400">
              30 FPS
            </span>
          </div>
        </div>

        {/* Timeline Zoom Controls */}
        <div className="flex items-center gap-2 text-zinc-400">
          <button
            type="button"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-1 rounded hover:bg-zinc-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-zinc-400">{(zoom * 100).toFixed(0)}%</span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(2.5, zoom + 0.25))}
            className="p-1 rounded hover:bg-zinc-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Track Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Sidebar) */}
        <div className="w-36 bg-[#12161F] border-r border-[#1E2638] flex flex-col py-1 text-[11px] font-mono">
          <div className="h-12 flex items-center gap-2 px-3 border-b border-[#1E2638]/50 text-zinc-300">
            <Video className="w-3.5 h-3.5 text-zinc-400" />
            <span>V1 Video</span>
          </div>
          <div className="h-10 flex items-center gap-2 px-3 border-b border-[#1E2638]/50 text-zinc-300">
            <Type className="w-3.5 h-3.5 text-zinc-400" />
            <span>T1 Text</span>
          </div>
          <div className="h-10 flex items-center gap-2 px-3 text-zinc-300">
            <Music className="w-3.5 h-3.5 text-zinc-400" />
            <span>A1 Audio</span>
          </div>
        </div>

        {/* Tracks Canvas Area */}
        <div
          className="flex-1 relative overflow-x-auto cursor-pointer bg-[#0B0E14]"
          onClick={handleTimelineClick}
        >
          {/* Time Ruler (Seconds) */}
          <div className="h-5 border-b border-[#1E2638] relative bg-[#0E121A] flex items-center">
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, s) => {
              const leftPercent = (s / duration) * 100;
              return (
                <div
                  key={s}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 bottom-0 border-l border-[#1E2638] pl-1 font-mono text-[9px] text-zinc-500"
                >
                  {s}s
                </div>
              );
            })}
          </div>

          {/* Track 1: Video Clips */}
          <div className="h-12 relative border-b border-[#1E2638]/50 flex items-center px-1">
            {scenes.map((scene) => {
              const left = (scene.startAt / duration) * 100;
              const width = (scene.duration / duration) * 100;

              return (
                <div
                  key={scene.id}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  className="absolute top-1 bottom-1 rounded bg-[#161B26] border border-[#2A3447] overflow-hidden flex items-center gap-2 px-2 hover:border-zinc-500 transition-colors"
                >
                  <img
                    src={scene.thumbnailUrl}
                    alt={scene.title}
                    className="w-8 h-6 object-cover rounded-sm shrink-0 border border-black/40"
                  />
                  <div className="truncate font-sans text-[11px] text-zinc-200">
                    <div className="truncate font-medium">{scene.title}</div>
                    <div className="text-[9px] text-zinc-500 uppercase font-mono">{scene.cameraPresetId}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Track 2: Kinetic Typography Captions */}
          <div className="h-10 relative border-b border-[#1E2638]/50 flex items-center px-1">
            {captions.map((cap) => {
              const left = (cap.startTime / duration) * 100;
              const width = ((cap.endTime - cap.startTime) / duration) * 100;

              return (
                <div
                  key={cap.id}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  className="absolute top-1 bottom-1 rounded bg-[#12161F] border border-[#2A3447] flex items-center justify-center px-2 text-[10px] font-sans font-medium text-zinc-300 truncate"
                >
                  {cap.text}
                </div>
              );
            })}
          </div>

          {/* Track 3: Audio Waveform & Beat Markers */}
          <div className="h-10 relative flex items-center bg-[#0D1119]">
            {/* Transient Beat Vertical Marker Ticks */}
            {beats.map((beat, idx) => {
              const left = (beat.timestamp / duration) * 100;
              return (
                <div
                  key={idx}
                  style={{ left: `${left}%` }}
                  className="absolute top-0 bottom-0 w-[1.5px] bg-zinc-600"
                  title={`${beat.type} @ ${beat.timestamp}s`}
                />
              );
            })}

            {/* Subtle waveform bars */}
            <div className="w-full flex items-center gap-[2px] px-2 h-5 opacity-40">
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${6 + Math.sin(i * 0.3) * 10}px` }}
                  className="flex-1 bg-zinc-500 rounded-t-[1px]"
                />
              ))}
            </div>
          </div>

          {/* Vertical Playhead Cursor (Subtle cyan line) */}
          <div
            style={{ left: `${playheadPercent}%` }}
            className="absolute top-0 bottom-0 w-[1.5px] bg-cyan-400 z-50 pointer-events-none"
          >
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-b-sm -translate-x-[4px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

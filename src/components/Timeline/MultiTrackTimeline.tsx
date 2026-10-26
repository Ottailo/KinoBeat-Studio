'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepBack,
  StepForward,
  Plus,
  Trash2,
  Video,
  Music,
  Type,
  ZoomIn,
  ZoomOut,
  Magnet,
} from 'lucide-react';
import { useStudioStore, SceneClip, CaptionItem } from '../../lib/store/studioStore';
import { BeatMarker } from '../../lib/audio/beatDetector';

export const MultiTrackTimeline: React.FC = () => {
  const currentTime = useStudioStore((s) => s.currentTime);
  const duration = useStudioStore((s) => s.duration);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const bpm = useStudioStore((s) => s.bpm);
  const scenes = useStudioStore((s) => s.scenes);
  const beats = useStudioStore((s) => s.beats);
  const captions = useStudioStore((s) => s.captions);
  const activeSceneIndex = useStudioStore((s) => s.activeSceneIndex);
  const autoBeatSnap = useStudioStore((s) => s.autoBeatSnap);

  const seekTo = useStudioStore((s) => s.seekTo);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const resetPlayback = useStudioStore((s) => s.resetPlayback);
  const stepFrame = useStudioStore((s) => s.stepFrame);
  const selectScene = useStudioStore((s) => s.selectScene);
  const addScene = useStudioStore((s) => s.addScene);
  const removeScene = useStudioStore((s) => s.removeScene);
  const addCaption = useStudioStore((s) => s.addCaption);
  const toggleBeatSnap = useStudioStore((s) => s.toggleBeatSnap);

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
    let targetRatio = Math.max(0, Math.min(1, clickX / rect.width));
    let targetTime = targetRatio * duration;

    // Magnet snap to nearest beat if enabled
    if (autoBeatSnap && beats.length > 0) {
      const nearestBeat = beats.reduce((prev, curr) =>
        Math.abs(curr.timestamp - targetTime) < Math.abs(prev.timestamp - targetTime) ? curr : prev
      );
      if (Math.abs(nearestBeat.timestamp - targetTime) < 0.25) {
        targetTime = nearestBeat.timestamp;
      }
    }

    seekTo(targetTime);
  };

  return (
    <div className="w-full bg-[#0B0E14] border-t border-[#1E2638] select-none text-zinc-100 flex flex-col h-64 z-40 shadow-2xl">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E2638] bg-[#12161F]">
        <div className="flex items-center gap-3">
          {/* Rewind */}
          <button
            type="button"
            onClick={resetPlayback}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Rewind to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Back 1 Frame */}
          <button
            type="button"
            onClick={() => stepFrame(-1)}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Step Back 1 Frame"
          >
            <StepBack className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-md flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold transition-colors shadow-md shadow-cyan-950/30"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            type="button"
            onClick={() => stepFrame(1)}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Step Forward 1 Frame"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          {/* Timecode Readout */}
          <div className="font-mono text-xs px-2.5 py-1 rounded bg-[#0D1119] border border-[#1E2638] text-zinc-200">
            <span className="text-cyan-400 font-semibold">{formatTimecode(currentTime)}</span>
            <span className="text-zinc-600 mx-1.5">/</span>
            <span className="text-zinc-400">{formatTimecode(duration)}</span>
          </div>

          {/* BPM Badge */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-[#161B26] border border-[#1E2638] text-zinc-300">
              {bpm} BPM
            </span>
            <span className="px-2 py-0.5 rounded bg-[#161B26] border border-[#1E2638] text-zinc-400">
              30 FPS
            </span>
          </div>

          {/* Beat Snap Toggle */}
          <button
            type="button"
            onClick={toggleBeatSnap}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              autoBeatSnap
                ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300'
                : 'bg-[#161B26] border-[#1E2638] text-zinc-500'
            }`}
            title="Snap playhead & edits to nearest audio kick/transient"
          >
            <Magnet className="w-3 h-3" />
            <span>Beat Snap</span>
          </button>
        </div>

        {/* Timeline Actions & Zoom */}
        <div className="flex items-center gap-2 text-zinc-400">
          <button
            type="button"
            onClick={addScene}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Shot</span>
          </button>

          <button
            type="button"
            onClick={addCaption}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Type className="w-3.5 h-3.5 text-pink-400" />
            <span>Add Title</span>
          </button>

          <div className="h-4 w-[1px] bg-[#1E2638] mx-1" />

          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-zinc-500">{zoom.toFixed(1)}x</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Column) */}
        <div className="w-36 bg-[#0D1119] border-r border-[#1E2638] flex flex-col justify-between py-1 shrink-0 text-xs text-zinc-400 font-mono">
          <div className="h-18 px-3 flex flex-col justify-center border-b border-[#1E2638]/60">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>V1 Video</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-0.5">{scenes.length} Clips</span>
          </div>

          <div className="h-10 px-3 flex flex-col justify-center border-b border-[#1E2638]/60">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Type className="w-3.5 h-3.5 text-pink-400" />
              <span>T1 Titles</span>
            </div>
          </div>

          <div className="h-14 px-3 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>A1 Audio</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-0.5">{beats.length} Transient Hits</span>
          </div>
        </div>

        {/* Track Timeline Area (Right Scrollable / Interactive Canvas) */}
        <div
          className="flex-1 relative bg-[#0B0E14] overflow-hidden cursor-pointer"
          onClick={handleTimelineClick}
        >
          {/* Subtle Vertical Time Tick Marks */}
          <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="h-full border-r border-zinc-700 w-full" />
            ))}
          </div>

          {/* V1 Video Track: Scene Blocks */}
          <div className="h-18 p-1 flex items-center gap-1 border-b border-[#1E2638]/60">
            {scenes.map((scene, idx) => {
              const widthPct = (scene.duration / duration) * 100;
              const isSelected = activeSceneIndex === idx;

              return (
                <div
                  key={scene.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectScene(idx);
                  }}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full rounded-md border relative overflow-hidden group transition-all flex flex-col justify-between p-1.5 select-none ${
                    isSelected
                      ? 'border-cyan-400 bg-[#162032] shadow-md ring-1 ring-cyan-400/50'
                      : 'border-[#1E2638] bg-[#12161F] hover:border-zinc-600'
                  }`}
                >
                  {/* Clip Thumbnail Background with dark fade */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity pointer-events-none"
                    style={{ backgroundImage: `url(${scene.thumbnailUrl})` }}
                  />

                  {/* Header: Shot Title & Delete Action */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-tight text-zinc-200 truncate">
                      {scene.title}
                    </span>
                    {scenes.length > 1 && isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeScene(idx);
                        }}
                        className="p-0.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete Shot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Footer: Camera Preset Badge & Duration */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="px-1 py-0.2 rounded bg-black/60 border border-white/10 text-cyan-300">
                      {scene.cameraPresetId.replace('_', ' ')}
                    </span>
                    <span>{scene.duration.toFixed(1)}s</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* T1 Title Track: Kinetic Caption Blocks */}
          <div className="h-10 p-1 flex items-center relative border-b border-[#1E2638]/60">
            {captions.map((cap) => {
              const leftPct = (cap.startTime / duration) * 100;
              const widthPct = ((cap.endTime - cap.startTime) / duration) * 100;

              return (
                <div
                  key={cap.id}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  className="absolute h-7 rounded border border-pink-500/40 bg-pink-950/40 text-pink-200 px-2 flex items-center text-[10px] font-mono truncate shadow-sm"
                >
                  <Type className="w-2.5 h-2.5 mr-1 text-pink-400 shrink-0" />
                  <span className="truncate">{cap.text}</span>
                </div>
              );
            })}
          </div>

          {/* A1 Audio Track: Waveform & Beat Markers */}
          <div className="h-14 p-1 relative flex items-center">
            {/* Waveform Bars */}
            <div className="w-full h-8 flex items-end gap-[2px] opacity-40">
              {Array.from({ length: 64 }).map((_, i) => {
                const height = 20 + Math.sin(i * 0.4) * 15 + Math.cos(i * 0.7) * 15;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-emerald-600 to-cyan-400"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            {/* Vertical Beat Marker Ticks (Cyan for kick, Pink for snare) */}
            {beats.map((beat, i) => {
              const posPct = (beat.timestamp / duration) * 100;
              const isKick = beat.type === 'kick';

              return (
                <div
                  key={i}
                  style={{ left: `${posPct}%` }}
                  className={`absolute top-0 bottom-0 w-[1.5px] pointer-events-none ${
                    isKick ? 'bg-cyan-400 opacity-80' : 'bg-pink-400 opacity-60'
                  }`}
                  title={`${beat.type.toUpperCase()} @ ${beat.timestamp.toFixed(2)}s`}
                />
              );
            })}
          </div>

          {/* Smooth Playhead Scrubber */}
          <div
            style={{ left: `${playheadPercent}%` }}
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 pointer-events-none z-30 transition-transform duration-75"
          >
            {/* Playhead Arrow Handle */}
            <div className="w-3 h-3 bg-cyan-400 -ml-[5px] -mt-1 rotate-45 rounded-[1px] shadow-lg shadow-cyan-400/50" />
          </div>
        </div>
      </div>
    </div>
  );
};

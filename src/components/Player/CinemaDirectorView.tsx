'use client';

import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Video,
  Sparkles,
  Sliders,
  Compass,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Maximize2,
} from 'lucide-react';
import { Player, PlayerRef } from '@remotion/player';
import { KinoComposition } from './KinoComposition';
import { useStudioStore } from '../../lib/store/studioStore';
import { CINEMA_PRESETS, FOCAL_LENGTHS } from '../Canvas/nodes/CameraNode';

export const CinemaDirectorView: React.FC = () => {
  const scenes = useStudioStore((s) => s.scenes);
  const activeSceneIndex = useStudioStore((s) => s.activeSceneIndex);
  const selectScene = useStudioStore((s) => s.selectScene);
  const updateScene = useStudioStore((s) => s.updateScene);
  const setCameraOptions = useStudioStore((s) => s.setCameraOptions);
  const currentTime = useStudioStore((s) => s.currentTime);
  const duration = useStudioStore((s) => s.duration);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const seekTo = useStudioStore((s) => s.seekTo);
  const stepFrame = useStudioStore((s) => s.stepFrame);
  const aspectRatio = useStudioStore((s) => s.aspectRatio);
  const setAspectRatio = useStudioStore((s) => s.setAspectRatio);
  const addScene = useStudioStore((s) => s.addScene);
  const isGeneratingVideo = useStudioStore((s) => s.isGeneratingVideo);
  const activeCameraCurveId = useStudioStore((s) => s.activeCameraCurveId);
  const bpm = useStudioStore((s) => s.bpm);
  const beats = useStudioStore((s) => s.beats);
  const captions = useStudioStore((s) => s.captions);
  const isVideoMuted = useStudioStore((s) => s.isVideoMuted);
  const isCaptionsMuted = useStudioStore((s) => s.isCaptionsMuted);

  const activeScene = scenes[activeSceneIndex] || scenes[0];
  const playerRef = useRef<PlayerRef>(null);
  const fps = 30;

  // Sync player seek
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

  const formatSMPTE = (timeSec: number) => {
    const totalFramesCount = Math.floor(timeSec * fps);
    const ff = totalFramesCount % fps;
    const totalSeconds = Math.floor(timeSec);
    const ss = totalSeconds % 60;
    const mm = Math.floor(totalSeconds / 60) % 60;
    const hh = Math.floor(totalSeconds / 3600);
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}:${ff.toString().padStart(2, '0')}`;
  };

  const handleEnhancePrompt = () => {
    if (!activeScene) return;
    const enhanced = activeScene.prompt.includes('volumetric')
      ? activeScene.prompt
      : `${activeScene.prompt.trim()}, volumetric atmospheric lighting, cinematic 35mm optical bloom, hyper-detailed textures`;
    updateScene(activeSceneIndex, { prompt: enhanced });
  };

  const handleGenerateShot = () => {
    useStudioStore.setState({ isGeneratingVideo: true, generationProgress: 10 });
    setTimeout(() => useStudioStore.setState({ generationProgress: 50 }), 400);
    setTimeout(() => {
      useStudioStore.setState({ isGeneratingVideo: false, generationProgress: 100 });
      updateScene(activeSceneIndex, { status: 'ready' });
    }, 900);
  };

  let compWidth = 1920;
  let compHeight = 1080;
  let aspectStyle = 'aspect-video';

  if (aspectRatio === '9:16') {
    compWidth = 1080;
    compHeight = 1920;
    aspectStyle = 'aspect-[9/16] max-h-[580px]';
  } else if (aspectRatio === '1:1') {
    compWidth = 1080;
    compHeight = 1080;
    aspectStyle = 'aspect-square max-h-[560px]';
  } else if (aspectRatio === '21:9') {
    compWidth = 2560;
    compHeight = 1080;
    aspectStyle = 'aspect-[21/9]';
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#090B0E] text-zinc-100 select-none">
      {/* Left/Center Cinema Viewport Stage */}
      <div className="flex-1 flex flex-col justify-between border-r border-[#1C2331] bg-[#07090C] relative">
        {/* Viewport Top Bar */}
        <div className="h-10 px-4 flex items-center justify-between border-b border-[#1C2331] bg-[#0D1117]/80 backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#141A24] px-2.5 py-1 rounded-md border border-[#222E42]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold text-zinc-200">MASTER MONITOR</span>
            </div>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">4K CINEMA (3840×2160) · 30 FPS</span>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 bg-[#10141B] p-0.5 rounded-md border border-[#1E2535]">
            {(['16:9', '9:16', '1:1', '21:9'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setAspectRatio(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  aspectRatio === r
                    ? 'bg-[#18202C] text-white font-bold border border-[#2B3B54]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Center Stage: The Cinema Viewport */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
          <div className={`relative w-full max-w-4xl ${aspectStyle} bg-black rounded-lg overflow-hidden border border-[#1E2535] shadow-2xl flex items-center justify-center`}>
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
              durationInFrames={Math.max(30, Math.round(duration * fps))}
              compositionWidth={compWidth}
              compositionHeight={compHeight}
              fps={fps}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls={false}
              loop
              acknowledgeRemotionLicense
            />
          </div>
        </div>

        {/* Bottom Transport Bar & SMPTE HUD */}
        <div className="h-14 px-6 bg-[#0D1117] border-t border-[#1C2331] flex items-center justify-between">
          {/* SMPTE HUD */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-200 font-semibold smpte-timecode bg-[#141A24] px-2.5 py-1 rounded border border-[#222E42]">
              {formatSMPTE(currentTime)}
            </span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-400">{formatSMPTE(duration)}</span>
          </div>

          {/* Centered Transport Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepFrame(-1)}
              className="p-2 rounded-md bg-[#141A24] hover:bg-[#1C2533] border border-[#222E42] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Step Back 1 Frame (Left Arrow)"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Play / Pause (Space)"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => stepFrame(1)}
              className="p-2 rounded-md bg-[#141A24] hover:bg-[#1C2533] border border-[#222E42] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Step Forward 1 Frame (Right Arrow)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
            <span>SHOT {activeSceneIndex + 1} OF {scenes.length}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-amber-400 font-semibold">{activeScene?.focalLength || '35mm'}</span>
          </div>
        </div>
      </div>

      {/* Right Rail: Pro Shot & Optics Inspector */}
      <div className="w-96 bg-[#0D1117] flex flex-col justify-between shrink-0 p-4 space-y-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Header & Scene Chips */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1C2331]">
              <div className="flex items-center gap-2 font-semibold text-xs text-white">
                <Video className="w-3.5 h-3.5 text-zinc-300" />
                <span>DIRECTOR INSPECTOR</span>
              </div>
              <button
                type="button"
                onClick={addScene}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#161C26] hover:bg-[#202737] text-[10px] text-zinc-200 border border-[#242E40] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Shot</span>
              </button>
            </div>

            {/* Scene Selector Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
              {scenes.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => selectScene(idx)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono shrink-0 transition-colors cursor-pointer ${
                    activeSceneIndex === idx
                      ? 'bg-[#18202C] text-white font-bold border border-zinc-200'
                      : 'bg-[#10141B] text-zinc-400 hover:text-white border border-[#1E2535]'
                  }`}
                >
                  Shot {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* 6-DOF Camera Kinematics */}
          <div className="p-3 rounded-lg bg-[#10141B] border border-[#1E2535] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                6-DOF Camera Kinematics
              </span>
              <span className="text-[9px] font-mono text-zinc-400 bg-[#161C26] px-1.5 py-0.2 rounded border border-[#242E40]">
                Matrix 3D
              </span>
            </div>

            <select
              value={activeScene?.cameraPresetId || 'orbital_drift'}
              onChange={(e) => setCameraOptions({ presetId: e.target.value })}
              className="w-full bg-[#080A0F] border border-[#1E2535] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-300 cursor-pointer font-medium"
            >
              {CINEMA_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>

            {/* Lens Focal Length Pills */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                <span>Lens Optics</span>
                <span className="text-amber-400 font-bold">{activeScene?.focalLength || '35mm'}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {FOCAL_LENGTHS.map((foc) => (
                  <button
                    key={foc.mm}
                    type="button"
                    onClick={() => setCameraOptions({ focalLength: foc.mm })}
                    className={`py-1 text-[10px] font-mono rounded-md border text-center transition-all cursor-pointer ${
                      (activeScene?.focalLength || '35mm') === foc.mm
                        ? 'bg-[#18202C] border-zinc-200 text-white font-bold'
                        : 'bg-[#080A0F] border-[#1E2535] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {foc.mm}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Ramp */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                <span>Speed Ramp Factor</span>
                <span className="text-zinc-200 font-bold">{(activeScene?.speedRamp || 1.25).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.05}
                value={activeScene?.speedRamp || 1.25}
                onChange={(e) => setCameraOptions({ speedRamp: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#080A0F] rounded-lg appearance-none cursor-pointer accent-zinc-200 border border-[#1E2535]"
              />
            </div>
          </div>

          {/* Generative Visual Directive & Prompt */}
          <div className="p-3 rounded-lg bg-[#10141B] border border-[#1E2535] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                Visual Directive
              </span>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#161C26] hover:bg-[#202737] text-[10px] text-zinc-200 border border-[#242E40] transition-colors cursor-pointer"
                title="Auto-enhance with cinematic modifiers"
              >
                <Sparkles className="w-2.5 h-2.5 text-zinc-300" />
                <span>Enhance</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={activeScene?.prompt || ''}
              onChange={(e) => updateScene(activeSceneIndex, { prompt: e.target.value })}
              className="w-full bg-[#080A0F] border border-[#1E2535] rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-300 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Generate Button Footer */}
        <div className="pt-3 border-t border-[#1C2331]">
          <button
            type="button"
            onClick={handleGenerateShot}
            disabled={isGeneratingVideo}
            className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>{isGeneratingVideo ? 'Generating Video Shot...' : 'Generate Video Shot'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

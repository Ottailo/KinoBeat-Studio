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
    <div className="flex-1 flex overflow-hidden bg-[#0C0D12] text-zinc-100 select-none">
      {/* Left/Center Cinema Viewport Stage */}
      <div className="flex-1 flex flex-col justify-between border-r border-white/[0.08] bg-[#0A0B10] relative">
        {/* Viewport Top Bar */}
        <div className="h-10 px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#12151C]/90 backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#181C26] px-2.5 py-1 rounded-md border border-white/[0.08]">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-rose-500 animate-pulse' : 'bg-rose-500/80'}`} />
              <span className="font-semibold text-zinc-200">MASTER MONITOR</span>
            </div>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">4K CINEMA (3840×2160) · 30 FPS · DCI SCOPE</span>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 bg-[#0E1017] p-0.5 rounded-md border border-white/[0.08]">
            {(['16:9', '9:16', '1:1', '21:9'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setAspectRatio(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  aspectRatio === r
                    ? 'bg-[#181C26] text-white font-bold border border-amber-400/30 text-amber-300'
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
          <div className={`relative w-full max-w-4xl ${aspectStyle} bg-black rounded-xl overflow-hidden border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex items-center justify-center`}>
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

        {/* Bottom Shot Filmstrip & Mechanical Transport Bar */}
        <div className="flex flex-col border-t border-white/[0.08] bg-[#12151C]/95 backdrop-blur-md">
          {/* Filmstrip Shot Selector Bar */}
          <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 shrink-0">
              Shots:
            </span>
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto py-0.5">
              {scenes.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => selectScene(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer border ${
                    activeSceneIndex === idx
                      ? 'bg-[#181C26] border-amber-400/60 text-white shadow-sm ring-1 ring-amber-400/20'
                      : 'bg-[#0E1017] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-[#181C26]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeSceneIndex === idx ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                  <span className="font-semibold text-zinc-200">Shot {idx + 1}</span>
                  <span className="text-[10px] text-zinc-400 border-l border-white/[0.08] pl-1.5">
                    {sc.focalLength || '35mm'}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {sc.duration.toFixed(1)}s
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={addScene}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0E1017] hover:bg-[#181C26] border border-white/[0.08] text-zinc-400 hover:text-white text-xs font-mono transition-colors shrink-0 cursor-pointer"
                title="Add New Cinema Shot"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Shot</span>
              </button>
            </div>
          </div>

          {/* Transport Controls & Timecode */}
          <div className="h-14 px-6 flex items-center justify-between">
            {/* SMPTE HUD */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-zinc-100 font-semibold smpte-timecode bg-[#181C26] px-2.5 py-1 rounded-md border border-white/[0.08]">
                {formatSMPTE(currentTime)}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{formatSMPTE(duration)}</span>
            </div>

            {/* Centered Transport Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => stepFrame(-1)}
                className="p-2 rounded-md bg-[#181C26] hover:bg-[#202533] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Step Back 1 Frame (Left Arrow)"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="p-2.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-md active:scale-95 cursor-pointer ring-1 ring-amber-400/40"
                title="Play / Pause (Space)"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => stepFrame(1)}
                className="p-2 rounded-md bg-[#181C26] hover:bg-[#202533] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
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
      </div>

      {/* Right Rail: Pro Shot & Optics Inspector */}
      <div className="w-96 bg-[#12151C] flex flex-col justify-between shrink-0 p-4 space-y-4 overflow-y-auto border-l border-white/[0.08]">
        <div className="space-y-4">
          {/* Header & Scene Selector */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 font-semibold text-xs text-white">
                <Video className="w-3.5 h-3.5 text-amber-400" />
                <span>DIRECTOR INSPECTOR</span>
              </div>
              <button
                type="button"
                onClick={addScene}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#181C26] hover:bg-[#202533] text-[10px] text-zinc-200 border border-white/[0.08] transition-colors cursor-pointer"
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
                      ? 'bg-[#181C26] text-white font-bold border border-amber-400/50 text-amber-300'
                      : 'bg-[#0E1017] text-zinc-400 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  Shot {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* 6-DOF Camera Kinematics */}
          <div className="p-3 rounded-lg bg-[#0E1017] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                6-DOF Camera Kinematics
              </span>
              <span className="text-[9px] font-mono text-zinc-400 bg-[#181C26] px-1.5 py-0.5 rounded border border-white/[0.08]">
                Matrix 3D
              </span>
            </div>

            <select
              value={activeScene?.cameraPresetId || 'orbital_drift'}
              onChange={(e) => setCameraOptions({ presetId: e.target.value })}
              className="w-full bg-[#12151C] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400/60 cursor-pointer font-medium"
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
                        ? 'bg-[#181C26] border-amber-400/60 text-amber-300 font-bold shadow-sm'
                        : 'bg-[#12151C] border-white/[0.08] text-zinc-400 hover:text-white'
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
                className="w-full h-1 bg-[#181C26] rounded-lg appearance-none cursor-pointer accent-amber-400 border border-white/[0.08]"
              />
            </div>
          </div>

          {/* Generative Visual Directive & Prompt */}
          <div className="p-3 rounded-lg bg-[#0E1017] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                Visual Directive
              </span>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#181C26] hover:bg-[#202533] text-[10px] text-zinc-200 border border-white/[0.08] transition-colors cursor-pointer"
                title="Auto-enhance with cinematic modifiers"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>Enhance</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={activeScene?.prompt || ''}
              onChange={(e) => updateScene(activeSceneIndex, { prompt: e.target.value })}
              className="w-full bg-[#12151C] border border-white/[0.08] rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400/60 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Generate Button Footer */}
        <div className="pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleGenerateShot}
            disabled={isGeneratingVideo}
            className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-98 ring-1 ring-amber-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isGeneratingVideo ? 'Generating Video Shot...' : 'Generate Video Shot'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

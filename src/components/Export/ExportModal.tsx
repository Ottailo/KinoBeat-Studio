'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Film,
  Sparkles,
  HardDrive,
  Loader2,
  CheckCircle,
  Play,
  RotateCcw,
  FileCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudioStore } from '../../lib/store/studioStore';
import { VideoRenderer, RenderResult } from '../../lib/video/videoRenderer';
import { beatDetector } from '../../lib/audio/beatDetector';
import { synthesizeAudioTrack } from '../../lib/audio/audioSynthesizer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, duration }) => {
  const scenes = useStudioStore((s) => s.scenes);
  const bpm = useStudioStore((s) => s.bpm);
  const activeCameraCurveId = useStudioStore((s) => s.activeCameraCurveId);
  const captions = useStudioStore((s) => s.captions);
  const beats = useStudioStore((s) => s.beats);
  const aspectRatio = useStudioStore((s) => s.aspectRatio);
  const customAudioBuffer = useStudioStore((s) => s.customAudioBuffer);
  const activeTrackId = useStudioStore((s) => s.activeTrackId);

  const [resolution, setResolution] = useState<'1080p' | '4K-Cinema' | '720p'>('1080p');
  const [fps, setFps] = useState<30 | 60>(30);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [renderedResult, setRenderedResult] = useState<RenderResult | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const handleStartRender = async () => {
    setIsRendering(true);
    setProgress(0);
    setRenderedResult(null);
    setRenderError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Prepare audio buffer for render
      let audioBuffer = customAudioBuffer;
      if (!audioBuffer) {
        try {
          const ctx = beatDetector.getOrCreateContext();
          audioBuffer = await synthesizeAudioTrack(activeTrackId, ctx);
        } catch (e) {
          console.warn('Audio synthesis for render deferred:', e);
        }
      }

      const result = await VideoRenderer.renderToVideo({
        resolution,
        fps,
        scenes,
        captions,
        duration,
        aspectRatio,
        beats,
        audioBuffer,
        signal: abortController.signal,
        onProgress: (pct, frame, total, status) => {
          setProgress(pct);
          setCurrentStep(`${status} (${pct}%)`);
        },
      });

      setRenderedResult(result);
      setIsRendering(false);
      setProgress(100);
      setCurrentStep('Master 4K Video Compilation Complete!');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#34D399', '#F472B6', '#E4E4E7'],
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setCurrentStep('Render cancelled.');
      } else {
        console.error('Render failure:', err);
        setRenderError(err.message || 'Render failed unexpectedly');
      }
      setIsRendering(false);
    }
  };

  const handleCancelRender = () => {
    abortControllerRef.current?.abort();
    setIsRendering(false);
  };

  // Real Playable Video File Download
  const handleDownloadVideo = () => {
    if (!renderedResult) return;

    const ext = renderedResult.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const filename = `KinoBeat_Master_${resolution}_${fps}fps_${Date.now()}.${ext}`;

    const a = document.createElement('a');
    a.href = renderedResult.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // DaVinci / Premiere EDL Manifest Download
  const handleDownloadEdl = () => {
    const edlContent =
      `TITLE: KINOBEAT_STUDIO_MASTER\nFCM: NON-DROP FRAME\n\n` +
      scenes
        .map((sc, i) => {
          const startSec = sc.startAt;
          const endSec = sc.startAt + sc.duration;
          return `00${i + 1}  AX       V     C        00:00:${Math.floor(startSec)
            .toString()
            .padStart(2, '0')}:00 00:00:${Math.floor(endSec)
            .toString()
            .padStart(2, '0')}:00 00:00:${Math.floor(startSec)
            .toString()
            .padStart(2, '0')}:00 00:00:${Math.floor(endSec)
            .toString()
            .padStart(2, '0')}:00\n* FROM CLIP NAME: ${sc.title}\n* CAMERA PRESET: ${
            sc.cameraPresetId
          }\n* PROMPT: ${sc.prompt}\n`;
        })
        .join('\n');

    const blob = new Blob([edlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KinoBeat_Timeline_${Date.now()}.edl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#0D1117] border border-[#1A2130] shadow-2xl overflow-hidden text-zinc-100 font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A2130] bg-[#151B24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#080A0F] border border-[#1A2130] flex items-center justify-center text-cyan-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white font-display">
                Master Video Studio Export
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                Deterministic Canvas 2D + Web Audio Pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#1E2638] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* If render is complete, display embedded video player */}
          {renderedResult ? (
            <div className="space-y-3.5">
              <div className="rounded-lg overflow-hidden border border-[#1A2130] bg-black shadow-inner">
                <video
                  src={renderedResult.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-72 object-contain mx-auto"
                />
              </div>

              {/* Render Metadata */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#080A0F] border border-[#1A2130]">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Resolution</div>
                  <div className="font-bold text-cyan-400 mt-0.5">
                    {renderedResult.width}×{renderedResult.height}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080A0F] border border-[#1A2130]">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Duration</div>
                  <div className="font-bold text-zinc-200 mt-0.5">
                    {renderedResult.duration.toFixed(2)}s
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080A0F] border border-[#1A2130]">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">File Size</div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {(renderedResult.blob.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00E5FF] hover:from-cyan-300 hover:to-cyan-400 text-[#080A0F] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40 cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download Master Video ({renderedResult.mimeType.includes('mp4') ? '.mp4' : '.webm'})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadEdl}
                    className="flex-1 py-2 rounded-lg bg-[#151B24] hover:bg-[#1E2638] border border-[#222C40] text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Export EDL Manifest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenderedResult(null)}
                    className="py-2 px-3.5 rounded-lg bg-[#151B24] hover:bg-[#1E2638] border border-[#222C40] text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Configure & Re-render"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-render</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Configuration Panel */}
              <div className="space-y-3.5">
                {/* Resolution Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Target Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1080p', label: '1080p FHD', sub: '1920×1080 (30/60fps)' },
                      { id: '4K-Cinema', label: '4K Cinema', sub: '3840×2160 (Master)' },
                      { id: '720p', label: 'Fast Draft (720p)', sub: '1280×720 (Draft)' },
                    ].map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        disabled={isRendering}
                        onClick={() => setResolution(res.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          resolution === res.id
                            ? 'bg-[#151B24] border-cyan-400 text-white ring-1 ring-cyan-400/40 shadow-sm'
                            : 'bg-[#080A0F] border-[#1A2130] text-zinc-400 hover:text-zinc-200 hover:border-[#2A354C]'
                        }`}
                      >
                        <div className="text-xs font-bold">{res.label}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{res.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framerate Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Broadcast Framerate
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { fpsVal: 30, label: '30 FPS (Standard Cinematic)' },
                      { fpsVal: 60, label: '60 FPS (Ultra Smooth HFR)' },
                    ].map((f) => (
                      <button
                        key={f.fpsVal}
                        type="button"
                        disabled={isRendering}
                        onClick={() => setFps(f.fpsVal as any)}
                        className={`py-2 px-3 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                          fps === f.fpsVal
                            ? 'bg-[#151B24] border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-[#080A0F] border-[#1A2130] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Composition Summary */}
                <div className="p-3 rounded-lg bg-[#080A0F] border border-[#1A2130] text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-zinc-400">
                    <span>Scene Shots:</span>
                    <span className="text-zinc-200 font-bold">{scenes.length} Clips</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Kinetic Titles:</span>
                    <span className="text-pink-400 font-bold">{captions.length} Cues</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Timeline Duration:</span>
                    <span className="text-zinc-200 font-bold smpte-timecode">{duration.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Audio Master:</span>
                    <span className="text-emerald-400 font-bold">{bpm.toFixed(1)} BPM ({beats.length} Beats)</span>
                  </div>
                </div>

                {/* Error Banner */}
                {renderError && (
                  <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/80 text-red-200 text-xs">
                    {renderError}
                  </div>
                )}

                {/* Progress Bar during render */}
                {isRendering && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 flex items-center gap-1.5 font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{currentStep}</span>
                      </span>
                      <span className="text-white font-bold">{progress}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#080A0F] overflow-hidden border border-[#1A2130]">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2">
                  {isRendering ? (
                    <button
                      type="button"
                      onClick={handleCancelRender}
                      className="w-full py-2.5 rounded-lg bg-[#151B24] hover:bg-[#1E2638] text-zinc-300 font-semibold text-xs transition-colors border border-[#222C40] cursor-pointer"
                    >
                      Cancel Render
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartRender}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00E5FF] hover:from-cyan-300 hover:to-cyan-400 text-[#080A0F] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40 cursor-pointer"
                    >
                      <Film className="w-4 h-4 stroke-[2.5]" />
                      <span>Start Master 4K Video Render</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

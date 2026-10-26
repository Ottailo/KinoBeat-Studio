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
      <div className="w-full max-w-lg rounded-xl bg-[#12161F] border border-[#1E2638] shadow-2xl overflow-hidden text-zinc-100 font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2638] bg-[#161B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-cyan-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                Master Video Studio Export
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                Deterministic Canvas + Remotion Pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* If render is complete, display embedded video player */}
          {renderedResult ? (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden border border-[#1E2638] bg-black shadow-inner">
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
                <div className="p-2 rounded bg-[#0D1119] border border-[#1E2638]">
                  <div className="text-[10px] text-zinc-500 uppercase">Resolution</div>
                  <div className="font-semibold text-cyan-400">
                    {renderedResult.width}x{renderedResult.height}
                  </div>
                </div>
                <div className="p-2 rounded bg-[#0D1119] border border-[#1E2638]">
                  <div className="text-[10px] text-zinc-500 uppercase">Duration</div>
                  <div className="font-semibold text-zinc-200">
                    {renderedResult.duration.toFixed(2)}s
                  </div>
                </div>
                <div className="p-2 rounded bg-[#0D1119] border border-[#1E2638]">
                  <div className="text-[10px] text-zinc-500 uppercase">File Size</div>
                  <div className="font-semibold text-emerald-400">
                    {(renderedResult.blob.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  className="w-full py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-950/40"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Master Video ({renderedResult.mimeType.includes('mp4') ? '.mp4' : '.webm'})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadEdl}
                    className="flex-1 py-1.5 rounded-lg bg-[#161B26] hover:bg-zinc-800 border border-[#1E2638] text-zinc-300 hover:text-zinc-100 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Export EDL Manifest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenderedResult(null)}
                    className="py-1.5 px-3 rounded-lg bg-[#161B26] hover:bg-zinc-800 border border-[#1E2638] text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
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
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Target Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1080p', label: '1080p FHD', sub: '1920x1080 (30/60fps)' },
                      { id: '4K-Cinema', label: '4K Cinema', sub: '3840x2160 (Master)' },
                      { id: '720p', label: '720p Web', sub: '1280x720 (Draft)' },
                    ].map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        disabled={isRendering}
                        onClick={() => setResolution(res.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          resolution === res.id
                            ? 'bg-cyan-950/50 border-cyan-400 text-zinc-100 ring-1 ring-cyan-400/40'
                            : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-semibold">{res.label}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{res.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framerate Selector */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Framerate (FPS)
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
                        className={`py-2 px-3 rounded-lg border text-xs text-left transition-all ${
                          fps === f.fpsVal
                            ? 'bg-cyan-950/50 border-cyan-400 text-zinc-100 font-semibold'
                            : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Composition Summary */}
                <div className="p-3 rounded-lg bg-[#0D1119] border border-[#1E2638] text-xs font-mono space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Scene Shots:</span>
                    <span className="text-zinc-200 font-semibold">{scenes.length} Clips</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Kinetic Titles:</span>
                    <span className="text-pink-400 font-semibold">{captions.length} Cues</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Timeline Duration:</span>
                    <span className="text-zinc-200 font-semibold">{duration.toFixed(2)} seconds</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Audio Cadence:</span>
                    <span className="text-emerald-400 font-semibold">{bpm} BPM ({beats.length} Beats)</span>
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
                      <span className="text-cyan-400 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{currentStep}</span>
                      </span>
                      <span className="text-zinc-300 font-bold">{progress}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
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
                      className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors border border-zinc-700"
                    >
                      Cancel Render
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartRender}
                      className="w-full py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-950/30"
                    >
                      <Film className="w-4 h-4" />
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

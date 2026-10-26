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
      setCurrentStep('Master Video Compilation Complete');

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFFFFF', '#FF5500', '#21242E'],
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setCurrentStep('Render cancelled.');
      } else {
        console.error('Render pipeline failure:', err);
        setRenderError(err.message || 'Video compilation failed.');
      }
      setIsRendering(false);
    }
  };

  const handleCancelRender = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRendering(false);
    setProgress(0);
  };

  const handleDownloadVideo = () => {
    if (!renderedResult) return;
    const a = document.createElement('a');
    a.href = renderedResult.url;
    const ext = renderedResult.mimeType.includes('mp4') ? 'mp4' : 'webm';
    a.download = `kinobeat_master_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadEdl = () => {
    const edlContent = [
      'TITLE: KINOBEAT_STUDIO_EXPORT',
      'FCM: NON-DROP FRAME',
      '',
      ...scenes.map((s, idx) => {
        const shotNum = (idx + 1).toString().padStart(3, '0');
        const inSec = s.startAt.toFixed(2);
        const outSec = (s.startAt + s.duration).toFixed(2);
        return `${shotNum}  AX       V     C        00:00:00:00 00:00:${s.duration.toFixed(0).padStart(2, '0')}:00 00:00:${inSec.padStart(2, '0')}:00 00:00:${outSec.padStart(2, '0')}:00\n* FROM CLIP NAME: ${s.title}\n* CAMERA: ${s.cameraPresetId || 'orbital_drift'}\n`;
      }),
    ].join('\n');

    const blob = new Blob([edlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinobeat_timeline_${Date.now()}.edl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-lg rounded-xl bg-[#191B22] border border-white/[0.12] shadow-2xl overflow-hidden text-zinc-100 font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#21242E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D0E12] border border-white/[0.08] flex items-center justify-center text-[#FF5500]">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white font-display">
                Master Video Export & Timeline Compilation
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                Remotion 4.x Client-Side MediaRecorder Pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isRendering}
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {renderedResult ? (
            /* Export Success View with Embedded Video Player */
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#21242E] border border-white/[0.12] text-zinc-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-medium text-white text-xs">Master Video Render Complete</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Ready for broadcast, streaming, and editing software import.
                  </div>
                </div>
              </div>

              {/* Embedded Master Video Player */}
              <div className="relative rounded-lg overflow-hidden bg-black border border-white/[0.12] shadow-inner">
                <video
                  src={renderedResult.url}
                  controls
                  autoPlay
                  loop
                  className="w-full max-h-72 object-contain mx-auto"
                />
              </div>

              {/* Render Metadata */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0D0E12] border border-white/[0.08]">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Resolution</div>
                  <div className="font-medium text-zinc-200 mt-0.5">
                    {renderedResult.width}×{renderedResult.height}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0E12] border border-white/[0.08]">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Duration</div>
                  <div className="font-medium text-zinc-200 mt-0.5">
                    {renderedResult.duration.toFixed(2)}s
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0E12] border border-white/[0.08]">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">File Size</div>
                  <div className="font-medium text-[#FF5500] mt-0.5 font-bold">
                    {(renderedResult.blob.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  className="w-full py-2.5 rounded-md bg-[#FF5500] hover:bg-[#FF661A] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF5500]/20 cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4 stroke-[2]" />
                  <span>Download Master Video ({renderedResult.mimeType.includes('mp4') ? '.mp4' : '.webm'})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadEdl}
                    className="flex-1 py-2 rounded-md bg-[#21242E] hover:bg-[#2b2f3c] border border-white/[0.08] text-zinc-200 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Export EDL Manifest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenderedResult(null)}
                    className="py-2 px-3.5 rounded-md bg-[#21242E] hover:bg-[#2b2f3c] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                  <label className="block text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Target Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1080p', label: '1080p FHD', sub: '1920×1080 (30/60fps)' },
                      { id: '4K-Cinema', label: '4K Cinema', sub: '3840×2160 (Master)' },
                      { id: '720p', label: '720p Web', sub: '1280×720 (Fast Draft)' },
                    ].map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        disabled={isRendering}
                        onClick={() => setResolution(res.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          resolution === res.id
                            ? 'bg-[#21242E] border-[#FF5500] text-[#FF5500] font-bold shadow-sm'
                            : 'bg-[#0D0E12] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xs font-medium">{res.label}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{res.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framerate Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
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
                            ? 'bg-[#21242E] border-[#FF5500] text-[#FF5500] font-bold shadow-sm'
                            : 'bg-[#0D0E12] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Composition Summary */}
                <div className="p-3 rounded-lg bg-[#0D0E12] border border-white/[0.08] text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-zinc-400">
                    <span>Scene Shots:</span>
                    <span className="text-zinc-200 font-medium">{scenes.length} Clips</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Kinetic Titles:</span>
                    <span className="text-[#FF5500] font-medium">{captions.length} Cues</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Timeline Duration:</span>
                    <span className="text-zinc-200 font-medium smpte-timecode">{duration.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Audio Master:</span>
                    <span className="text-zinc-200 font-medium">{bpm.toFixed(1)} BPM ({beats.length} Beats)</span>
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
                      <span className="text-zinc-200 flex items-center gap-1.5 font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5500]" />
                        <span>{currentStep}</span>
                      </span>
                      <span className="text-[#FF5500] font-medium">{progress}%</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#0D0E12] overflow-hidden border border-white/[0.08]">
                      <div
                        className="h-full bg-[#FF5500] transition-all duration-150"
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
                      className="w-full py-2.5 rounded-md bg-[#21242E] hover:bg-[#2b2f3c] text-zinc-300 font-medium text-xs transition-colors border border-white/[0.08] cursor-pointer"
                    >
                      Cancel Render
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartRender}
                      className="w-full py-2.5 rounded-md bg-[#FF5500] hover:bg-[#FF661A] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-98"
                    >
                      <Film className="w-4 h-4 stroke-[2]" />
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

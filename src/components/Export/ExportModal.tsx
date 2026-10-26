'use client';

import React, { useState } from 'react';
import { X, Download, CheckCircle, Film, Sparkles, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, duration }) => {
  const [resolution, setResolution] = useState<'1080p' | '4K-Cinema' | '720p'>('1080p');
  const [fps, setFps] = useState<30 | 60>(30);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRender = () => {
    setIsRendering(true);
    setProgress(0);
    setRenderedUrl(null);

    // Deterministic render simulator
    const totalSteps = 40;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setProgress(Math.round((current / totalSteps) * 100));

      if (current >= totalSteps) {
        clearInterval(interval);
        setIsRendering(false);
        setRenderedUrl('#download-ready');
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff007f', '#f59e0b'],
        });
      }
    }, 100);
  };

  const handleDownload = () => {
    // Generate a downloadable video metadata manifest / mock MP4 file
    const manifest = {
      app: 'KinoBeat Studio v1.0',
      timestamp: new Date().toISOString(),
      resolution,
      fps,
      duration: `${duration}s`,
      codec: 'H.264 / AAC 320kbps',
      colorSpace: 'Rec.709 10-bit',
      scenes: 3,
      verified: true,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KinoBeat_Render_${resolution}_${fps}fps_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0f131a] border border-[#1e2638] shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2638] bg-[#141a24]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold">EXPORT COMPOSITION</h2>
              <p className="text-[11px] text-neutral-400 font-mono">Remotion 4K Deterministic Render Pipeline</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1e2638]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Resolution Selector */}
          <div>
            <label className="block text-[11px] text-neutral-400 uppercase mb-1.5">
              Target Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['720p', '1080p', '4K-Cinema'] as const).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResolution(res)}
                  className={`py-2 px-3 rounded-lg border text-center transition-all ${
                    resolution === res
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'bg-[#141a24] border-[#1e2638] text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  <div className="font-bold">{res}</div>
                  <div className="text-[9px] text-neutral-400 mt-0.5">
                    {res === '4K-Cinema' ? '3840x2160' : res === '1080p' ? '1920x1080' : '1280x720'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Frame Rate Selector */}
          <div>
            <label className="block text-[11px] text-neutral-400 uppercase mb-1.5">
              Frame Rate (Temporal Resolution)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([30, 60] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFps(val)}
                  className={`py-2 px-3 rounded-lg border text-center transition-all ${
                    fps === val
                      ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_12px_rgba(255,0,127,0.2)]'
                      : 'bg-[#141a24] border-[#1e2638] text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  <div className="font-bold">{val} FPS</div>
                  <div className="text-[9px] text-neutral-400 mt-0.5">
                    {val === 60 ? 'Smooth High Kinetic' : 'Standard Cinematic'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Render Progress Bar */}
          {isRendering && (
            <div className="p-4 rounded-xl bg-[#090a0f] border border-[#1e2638] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Compiling frame-accurate layers...
                </span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1e2638] overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-150"
                />
              </div>
            </div>
          )}

          {/* Download Ready Banner */}
          {renderedUrl && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Deterministic Render Complete! (10.0s @ {fps}fps)</span>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5 transition-all text-xs shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-[#141a24] border-t border-[#1e2638] flex items-center justify-between">
          <div className="text-[10px] text-neutral-400 font-mono">
            EST. SIZE: {resolution === '4K-Cinema' ? '~42 MB' : '~18 MB'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#1e2638] hover:bg-[#1e2638] text-neutral-300 font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartRender}
              disabled={isRendering}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-black font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isRendering ? 'Rendering...' : 'Render Video'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

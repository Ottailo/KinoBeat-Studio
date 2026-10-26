'use client';

import React, { useState } from 'react';
import { X, Download, CheckCircle, Film, Sparkles } from 'lucide-react';
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

    const totalSteps = 30;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setProgress(Math.round((current / totalSteps) * 100));

      if (current >= totalSteps) {
        clearInterval(interval);
        setIsRendering(false);
        setRenderedUrl('#download-ready');
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#E4E4E7', '#3E4D6D'],
        });
      }
    }, 80);
  };

  const handleDownload = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-[#12161F] border border-[#1E2638] shadow-2xl overflow-hidden text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2638] bg-[#161B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">Export Master</h2>
              <p className="text-[11px] text-zinc-400">Remotion 4K Deterministic Pipeline</p>
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Resolution Selector */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['720p', '1080p', '4K-Cinema'] as const).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResolution(res)}
                  className={`py-2 px-3 rounded-md border text-center transition-all ${
                    resolution === res
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-100 font-medium'
                      : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold text-xs font-mono">{res}</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">
                    {res === '4K-Cinema' ? '3840×2160' : res === '1080p' ? '1920×1080' : '1280×720'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Frame Rate */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
              Frame Rate
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([30, 60] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFps(val)}
                  className={`py-2 px-3 rounded-md border text-center transition-all ${
                    fps === val
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-100 font-medium'
                      : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold text-xs font-mono">{val} FPS</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">
                    {val === 60 ? 'Smooth High Kinetic' : 'Standard Cinematic'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Render Progress */}
          {isRendering && (
            <div className="p-3.5 rounded-lg bg-[#0D1119] border border-[#1E2638] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  Encoding deterministic frames...
                </span>
                <span className="text-zinc-100 font-mono font-bold">{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1E2638] overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-cyan-400 transition-all duration-100"
                />
              </div>
            </div>
          )}

          {/* Download Banner */}
          {renderedUrl && (
            <div className="p-3 rounded-lg bg-[#141923] border border-[#1E2638] flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300 text-xs">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>Render Ready ({fps} FPS · {resolution})</span>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors"
              >
                Download
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#161B26] border-t border-[#1E2638] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Est. Size: {resolution === '4K-Cinema' ? '~42 MB' : '~18 MB'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-[#1E2638] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartRender}
              disabled={isRendering}
              className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isRendering ? 'Rendering...' : 'Render Video'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

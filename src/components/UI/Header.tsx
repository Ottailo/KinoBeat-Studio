'use client';

import React from 'react';
import { Film, Download, Github, Key, Volume2, VolumeX, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenByok: () => void;
  onOpenGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenByok,
  onOpenGuide,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="h-12 bg-[#0B0E14] border-b border-[#1E2638] px-4 flex items-center justify-between text-zinc-100 select-none z-50">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#161B26] border border-[#1E2638] flex items-center justify-center text-zinc-300">
            <Film className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-tight text-zinc-100">
              KinoBeat Studio
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#12161F] text-zinc-400 rounded border border-[#1E2638]">
              v1.0
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-[#1E2638] text-[11px] font-mono text-zinc-500">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Local Engine Ready</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Guide / Walkthrough Button */}
        <button
          type="button"
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12161F] hover:bg-[#161B26] border border-[#1E2638] text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
          title="Open Setup Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Guide</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-1.5 rounded bg-[#12161F] hover:bg-[#161B26] border border-[#1E2638] text-zinc-400 hover:text-zinc-200 transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-400" /> : <Volume2 className="w-3.5 h-3.5 text-zinc-300" />}
        </button>

        {/* BYOK Keys Modal Button */}
        <button
          type="button"
          onClick={onOpenByok}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12161F] hover:bg-[#161B26] border border-[#1E2638] text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          <Key className="w-3.5 h-3.5 text-zinc-400" />
          <span>BYOK</span>
        </button>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/Ottailo/KinoBeat-Studio"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12161F] hover:bg-[#161B26] border border-[#1E2638] text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          <Github className="w-3.5 h-3.5 text-zinc-400" />
          <span>GitHub</span>
        </a>

        {/* Clean Export 4K Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export 4K</span>
        </button>
      </div>
    </header>
  );
};

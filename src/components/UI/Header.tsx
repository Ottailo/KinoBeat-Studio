'use client';

import React from 'react';
import { Film, Sparkles, Download, Github, Key, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenByok: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenByok,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="h-14 bg-[#090a0f] border-b border-[#1e2638] px-4 flex items-center justify-between text-white select-none z-50">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-pink-500 p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-[#090a0f] rounded-lg flex items-center justify-center">
              <Film className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm tracking-tight text-white">
                KINOBEAT<span className="text-cyan-400">.STUDIO</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                v1.0
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono tracking-wider">
              GENERATIVE AI VIDEO & INFINITE CANVAS
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[#1e2638] text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LOCAL ENGINE ONLINE
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Audio Mute Toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-[#141a24] hover:bg-[#1e2638] border border-[#1e2638] text-neutral-300 hover:text-white transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* BYOK Keys Modal Button */}
        <button
          type="button"
          onClick={onOpenByok}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141a24] hover:bg-[#1e2638] border border-[#1e2638] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>BYOK Keys</span>
        </button>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/Ottailo/KinoBeat-Studio"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141a24] hover:bg-[#1e2638] border border-[#1e2638] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub</span>
        </a>

        {/* Export 4K Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-black font-bold font-mono text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT 4K</span>
        </button>
      </div>
    </header>
  );
};

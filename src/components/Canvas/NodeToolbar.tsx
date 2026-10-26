'use client';

import React, { useState } from 'react';
import { Type, Video, Cpu, Music, Film, Layers, Sparkles, Maximize2 } from 'lucide-react';
import { useStudioStore } from '../../lib/store/studioStore';

interface NodeToolbarProps {
  onAddNode: (type: 'promptNode' | 'cameraNode' | 'modelNode' | 'audioNode' | 'timelineNode') => void;
  onLoadPreset: (presetKey: string) => void;
  onFitView?: () => void;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ onAddNode, onLoadPreset, onFitView }) => {
  const generateAutoStoryboard = useStudioStore((s) => s.generateAutoStoryboard);
  const [isAutoDirectorOpen, setIsAutoDirectorOpen] = useState(false);

  const handleQuickTheme = (theme: string) => {
    generateAutoStoryboard(theme);
    setIsAutoDirectorOpen(false);
  };

  return (
    <div className="absolute top-4 left-6 z-30 flex items-center gap-1.5 bg-[#191B22]/95 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/[0.08] shadow-2xl text-zinc-300">
      <div className="flex items-center gap-1 pl-1.5 pr-2 border-r border-white/[0.08]">
        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
          Nodes
        </span>
      </div>

      <button
        type="button"
        onClick={() => onAddNode('promptNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#21242E] hover:text-white text-xs font-medium text-zinc-300 transition-colors cursor-pointer group"
        title="Add Prompt Core Node"
      >
        <Type className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FF5500] transition-colors" />
        <span>Prompt</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('cameraNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#21242E] hover:text-white text-xs font-medium text-zinc-300 transition-colors cursor-pointer group"
        title="Add 6-DOF Camera Kinematics Node"
      >
        <Video className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FF5500] transition-colors" />
        <span>Camera</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('modelNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#21242E] hover:text-white text-xs font-medium text-zinc-300 transition-colors cursor-pointer group"
        title="Add DiT Model Inference Node"
      >
        <Cpu className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FF5500] transition-colors" />
        <span>Model</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('audioNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#21242E] hover:text-white text-xs font-medium text-zinc-300 transition-colors cursor-pointer group"
        title="Add Web Audio FFT Synthesizer Node"
      >
        <Music className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FF5500] transition-colors" />
        <span>Audio</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('timelineNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#21242E] hover:text-white text-xs font-medium text-zinc-300 transition-colors cursor-pointer group"
        title="Add Remotion Program Monitor Node"
      >
        <Film className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FF5500] transition-colors" />
        <span>Program</span>
      </button>

      <div className="h-4 w-[1px] bg-white/[0.08] mx-0.5" />

      {/* Auto-Director Storyboard Popover Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsAutoDirectorOpen(!isAutoDirectorOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#21242E] hover:bg-[#2a2e3a] text-zinc-200 hover:text-white text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
          title="Auto-Director AI Storyboard Generator"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Auto-Director</span>
        </button>

        {isAutoDirectorOpen && (
          <div className="absolute left-0 mt-2 w-72 bg-[#191B22] border border-white/[0.12] rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/[0.08]">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                Storyboard Synthesizer
              </span>
              <span className="text-[9px] font-mono text-zinc-400">3-Scene</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickTheme('Cyberpunk Blade Runner Neo-Tokyo')}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#21242E] text-zinc-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-medium text-white group-hover:text-zinc-100 transition-colors">
                  Cyberpunk Neo-Tokyo
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">120 BPM · 35mm Bleach Bypass</div>
              </div>
              <span className="text-[10px] text-[#FF5500] font-mono bg-[#0D0E12] px-1.5 py-0.5 rounded border border-white/[0.08]">
                FPV
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickTheme('Interstellar Deep Space Black Hole')}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#21242E] text-zinc-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-medium text-white group-hover:text-zinc-100 transition-colors">
                  Deep Space Event Horizon
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">140 BPM · 65mm IMAX Anamorphic</div>
              </div>
              <span className="text-[10px] text-[#FF5500] font-mono bg-[#0D0E12] px-1.5 py-0.5 rounded border border-white/[0.08]">
                ORBIT
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="h-4 w-[1px] bg-white/[0.08] mx-0.5" />

      {/* Preset Workflow Template Selector */}
      <div className="relative flex items-center">
        <Layers className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
        <select
          onChange={(e) => onLoadPreset(e.target.value)}
          defaultValue=""
          className="bg-[#0D0E12] border border-white/[0.08] rounded-md pl-7 pr-3 py-1 text-xs text-zinc-300 hover:text-white focus:outline-none focus:border-[#FF5500]/60 transition-colors appearance-none cursor-pointer font-medium"
        >
          <option value="" disabled>Workflow Presets</option>
          <option value="cyberpunk_reel">Kinetic Work Reel (120 BPM)</option>
          <option value="film_trailer">Anamorphic Film Trailer (35mm)</option>
          <option value="tiktok_speedrun">Dynamic Short (140 BPM)</option>
        </select>
      </div>

      {onFitView && (
        <button
          type="button"
          onClick={onFitView}
          className="p-1 rounded-md hover:bg-[#21242E] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Fit Graph to Viewport"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

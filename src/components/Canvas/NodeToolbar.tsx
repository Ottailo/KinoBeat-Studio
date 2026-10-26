'use client';

import React, { useState } from 'react';
import { Type, Video, Cpu, Music, Film, Layers, Sparkles, Maximize2, Compass } from 'lucide-react';
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
    <div className="absolute top-4 left-6 z-30 flex items-center gap-1.5 bg-[#0D1117]/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#1A2130] shadow-2xl text-zinc-300">
      <div className="flex items-center gap-1 pl-1 pr-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
          NODES
        </span>
      </div>

      <button
        type="button"
        onClick={() => onAddNode('promptNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#151B24] hover:text-white text-xs font-medium transition-colors cursor-pointer group"
        title="Add Prompt Core Node"
      >
        <Type className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span>Prompt</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('cameraNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#151B24] hover:text-white text-xs font-medium transition-colors cursor-pointer group"
        title="Add 6-DOF Camera Kinematics Node"
      >
        <Video className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span>Camera</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('modelNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#151B24] hover:text-white text-xs font-medium transition-colors cursor-pointer group"
        title="Add DiT Model Inference Node"
      >
        <Cpu className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span>Model</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('audioNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#151B24] hover:text-white text-xs font-medium transition-colors cursor-pointer group"
        title="Add Web Audio FFT Synthesizer Node"
      >
        <Music className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
        <span>Audio</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('timelineNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#151B24] hover:text-white text-xs font-medium transition-colors cursor-pointer group"
        title="Add Remotion Program Monitor Node"
      >
        <Film className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
        <span>Program</span>
      </button>

      <div className="h-4 w-[1px] bg-[#1A2130] mx-1" />

      {/* Auto-Director Storyboard Popover Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsAutoDirectorOpen(!isAutoDirectorOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#151B24] hover:bg-[#1E2638] text-cyan-300 hover:text-cyan-200 text-xs font-semibold border border-[#222C40] transition-colors cursor-pointer shadow-sm"
          title="Auto-Director AI Storyboard Generator"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Auto-Director</span>
        </button>

        {isAutoDirectorOpen && (
          <div className="absolute left-0 mt-2 w-72 bg-[#0D1117] border border-[#1E2638] rounded-xl shadow-2xl p-2.5 z-50 text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-2 py-1 border-b border-[#1A2130]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Cinematic Storyboard Synthesizer
              </span>
              <span className="text-[9px] font-mono text-cyan-400">3-Scene</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickTheme('Cyberpunk Blade Runner Neo-Tokyo')}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#151B24] text-zinc-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                  Cyberpunk Neo-Tokyo
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">120 BPM · 35mm Bleach Bypass</div>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono bg-[#080A0F] px-1.5 py-0.5 rounded border border-[#1A2130]">
                FPV
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickTheme('Interstellar Deep Space Black Hole')}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#151B24] text-zinc-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                  Deep Space Event Horizon
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">140 BPM · 65mm IMAX Anamorphic</div>
              </div>
              <span className="text-[10px] text-amber-400 font-mono bg-[#080A0F] px-1.5 py-0.5 rounded border border-[#1A2130]">
                ORBIT
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="h-4 w-[1px] bg-[#1A2130] mx-1" />

      {/* Preset Workflow Template Selector */}
      <div className="relative flex items-center">
        <Layers className="w-3.5 h-3.5 text-zinc-500 absolute left-2 pointer-events-none" />
        <select
          onChange={(e) => onLoadPreset(e.target.value)}
          defaultValue=""
          className="bg-[#080A0F] border border-[#1A2130] rounded-md pl-7 pr-3 py-1 text-xs text-zinc-300 hover:text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer font-medium"
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
          className="p-1 rounded-md hover:bg-[#151B24] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Fit Graph to Viewport"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

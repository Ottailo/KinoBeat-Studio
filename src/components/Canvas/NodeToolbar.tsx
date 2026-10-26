'use client';

import React, { useState } from 'react';
import { Type, Video, Cpu, Music, Film, Layers, Sparkles, Wand2, Maximize } from 'lucide-react';
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
    <div className="absolute top-4 left-6 z-30 flex items-center gap-1.5 bg-[#12161F]/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#1E2638] shadow-xl text-zinc-300">
      <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-1">
        Add Node
      </span>

      <button
        type="button"
        onClick={() => onAddNode('promptNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
        title="Add Prompt Node"
      >
        <Type className="w-3.5 h-3.5 text-zinc-400" />
        <span>Prompt</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('cameraNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
        title="Add Camera Node"
      >
        <Video className="w-3.5 h-3.5 text-zinc-400" />
        <span>Camera</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('modelNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
        title="Add Model Node"
      >
        <Cpu className="w-3.5 h-3.5 text-zinc-400" />
        <span>Model</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('audioNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
        title="Add Audio Node"
      >
        <Music className="w-3.5 h-3.5 text-zinc-400" />
        <span>Audio</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('timelineNode')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
        title="Add Sequencer Node"
      >
        <Film className="w-3.5 h-3.5 text-zinc-400" />
        <span>Sequencer</span>
      </button>

      <div className="h-4 w-[1px] bg-[#1E2638] mx-1" />

      {/* Auto-Director Storyboard Popover Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsAutoDirectorOpen(!isAutoDirectorOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-cyan-400 hover:text-cyan-300 text-xs font-medium border border-zinc-700 transition-colors"
          title="Auto-Director AI Storyboard Generator"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Auto-Director</span>
        </button>

        {isAutoDirectorOpen && (
          <div className="absolute left-0 mt-2 w-64 bg-[#12161F] border border-[#1E2638] rounded-lg shadow-2xl p-2.5 z-50 text-xs space-y-1.5">
            <div className="text-[11px] font-semibold text-zinc-400 px-1 uppercase tracking-wider">
              Generate 3-Scene Storyboard
            </div>
            <button
              type="button"
              onClick={() => handleQuickTheme('Cyberpunk Blade Runner Neo-Tokyo')}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-[#161B26] text-zinc-200 transition-colors flex items-center justify-between"
            >
              <span>Cyberpunk Runner (120 BPM)</span>
              <span className="text-[10px] text-zinc-500 font-mono">3 Shots</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickTheme('Interstellar Deep Space Black Hole')}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-[#161B26] text-zinc-200 transition-colors flex items-center justify-between"
            >
              <span>Deep Space Odyssey</span>
              <span className="text-[10px] text-zinc-500 font-mono">3 Shots</span>
            </button>
          </div>
        )}
      </div>

      <div className="h-4 w-[1px] bg-[#1E2638] mx-1" />

      {/* Preset Workflow Template Dropdown */}
      <div className="relative flex items-center">
        <Layers className="w-3.5 h-3.5 text-zinc-500 absolute left-2 pointer-events-none" />
        <select
          onChange={(e) => onLoadPreset(e.target.value)}
          defaultValue=""
          className="bg-[#0D1119] border border-[#1E2638] rounded-md pl-7 pr-3 py-1 text-xs text-zinc-300 hover:text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors appearance-none cursor-pointer"
        >
          <option value="" disabled>Workflow Templates</option>
          <option value="cyberpunk_reel">Kinetic Work Reel (120 BPM)</option>
          <option value="film_trailer">Anamorphic Film Trailer (35mm)</option>
          <option value="tiktok_speedrun">Dynamic Short (140 BPM)</option>
        </select>
      </div>

      {onFitView && (
        <button
          type="button"
          onClick={onFitView}
          className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          title="Fit Canvas to View"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

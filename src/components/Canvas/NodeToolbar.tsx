'use client';

import React from 'react';
import { Type, Video, Cpu, Music, Film, Layers, ChevronDown } from 'lucide-react';

interface NodeToolbarProps {
  onAddNode: (type: 'promptNode' | 'cameraNode' | 'modelNode' | 'audioNode' | 'timelineNode') => void;
  onLoadPreset: (presetKey: string) => void;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ onAddNode, onLoadPreset }) => {
  return (
    <div className="absolute top-4 left-6 z-30 flex items-center gap-1.5 bg-[#12161F]/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#1E2638] shadow-xl text-zinc-300">
      <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-1">
        Add
      </span>

      <button
        type="button"
        onClick={() => onAddNode('promptNode')}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
      >
        <Type className="w-3.5 h-3.5 text-zinc-400" />
        <span>Prompt</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('cameraNode')}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
      >
        <Video className="w-3.5 h-3.5 text-zinc-400" />
        <span>Camera</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('modelNode')}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
      >
        <Cpu className="w-3.5 h-3.5 text-zinc-400" />
        <span>Model</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('audioNode')}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
      >
        <Music className="w-3.5 h-3.5 text-zinc-400" />
        <span>Audio</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('timelineNode')}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-zinc-800 hover:text-zinc-100 text-xs font-medium transition-colors"
      >
        <Film className="w-3.5 h-3.5 text-zinc-400" />
        <span>Sequencer</span>
      </button>

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
          <option value="product_reveal">Commercial Product Reveal</option>
        </select>
      </div>
    </div>
  );
};

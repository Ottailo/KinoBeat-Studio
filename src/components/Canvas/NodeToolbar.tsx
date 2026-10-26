'use client';

import React from 'react';
import { Plus, Sparkles, Video, Cpu, Music, Film, LayoutTemplate } from 'lucide-react';

interface NodeToolbarProps {
  onAddNode: (type: 'promptNode' | 'cameraNode' | 'modelNode' | 'audioNode' | 'timelineNode') => void;
  onLoadPreset: (presetKey: string) => void;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ onAddNode, onLoadPreset }) => {
  return (
    <div className="absolute top-4 left-6 z-30 flex items-center gap-2 bg-[#0f131a]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#1e2638] shadow-2xl">
      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mr-1">
        Add Nodes:
      </span>

      <button
        type="button"
        onClick={() => onAddNode('promptNode')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141a24] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>+ Prompt</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('cameraNode')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141a24] hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-mono transition-colors"
      >
        <Video className="w-3.5 h-3.5" />
        <span>+ Camera</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('modelNode')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141a24] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-colors"
      >
        <Cpu className="w-3.5 h-3.5" />
        <span>+ Model</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('audioNode')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141a24] hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors"
      >
        <Music className="w-3.5 h-3.5" />
        <span>+ Audio</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode('timelineNode')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141a24] hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono transition-colors"
      >
        <Film className="w-3.5 h-3.5" />
        <span>+ Sequencer</span>
      </button>

      <div className="h-5 w-[1px] bg-[#1e2638] mx-1" />

      {/* Preset Workflow Template Selector */}
      <div className="flex items-center gap-1.5 text-xs font-mono">
        <LayoutTemplate className="w-3.5 h-3.5 text-neutral-400" />
        <select
          onChange={(e) => onLoadPreset(e.target.value)}
          defaultValue=""
          className="bg-[#141a24] border border-[#1e2638] rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-cyan-400"
        >
          <option value="" disabled>Load Workflow Preset...</option>
          <option value="cyberpunk_reel">Cyberpunk Kinetic Work Reel (120 BPM)</option>
          <option value="film_trailer">Cinematic Film Trailer (35mm Anamorphic)</option>
          <option value="tiktok_speedrun">Viral TikTok Kinetic Short (140 BPM)</option>
          <option value="product_reveal">Product Reveal Monolith (100 BPM)</option>
        </select>
      </div>
    </div>
  );
};

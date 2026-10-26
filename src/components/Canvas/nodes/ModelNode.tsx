'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu, Dna, Shuffle, Sparkles } from 'lucide-react';
import { VIDEO_MODELS } from '../../../lib/models/modelRegistry';

interface ModelNodeData {
  label: string;
  modelId: string;
  resolution: string;
  aspectRatio: string;
  fps: number;
  cfg: number;
  steps: number;
}

export const ModelNode: React.FC<{ data: ModelNodeData; isSelected?: boolean }> = ({
  data,
  isSelected,
}) => {
  const [modelId, setModelId] = useState(data.modelId || 'flux_video');
  const [resolution, setResolution] = useState(data.resolution || '1080p');
  const [cfg, setCfg] = useState(data.cfg || 4.5);
  const [steps, setSteps] = useState(data.steps || 35);
  const [seed, setSeed] = useState(4289104);

  const currentModel = VIDEO_MODELS[modelId] || VIDEO_MODELS.flux_video;

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 99999999));
  };

  return (
    <div
      className={`w-84 rounded-lg bg-[#12161F] border transition-all text-zinc-100 shadow-xl overflow-hidden ${
        isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400/40'
          : 'border-[#1E2638] hover:border-zinc-700'
      }`}
    >
      {/* Input Handles for Prompt and Camera */}
      <Handle
        type="target"
        position={Position.Left}
        id="prompt-in"
        style={{ top: '28%' }}
        className="!bg-zinc-400 hover:!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="camera-in"
        style={{ top: '72%' }}
        className="!bg-zinc-400 hover:!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B26] border-b border-[#1E2638]">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            DiT Inference Engine
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
          {currentModel.version}
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-3 text-xs">
        {/* Model Selector */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Generation Model
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-medium"
          >
            {Object.values(VIDEO_MODELS).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Quality Selector Pills */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
            Render Resolution
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['720p', '1080p', '4K-Cinema'].map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setResolution(res)}
                className={`py-1 text-center rounded border transition-colors text-[11px] font-mono ${
                  resolution === res
                    ? 'bg-zinc-800 border-zinc-500 text-zinc-100 font-medium'
                    : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Denoising Steps Slider */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-medium text-zinc-400 mb-1">
            <span>Denoising Steps</span>
            <span className="font-mono text-zinc-300 font-bold">{steps}</span>
          </div>
          <input
            type="range"
            min="20"
            max="60"
            step="5"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-[#0D1119] rounded h-1 cursor-pointer"
          />
        </div>

        {/* CFG Slider */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-medium text-zinc-400 mb-1">
            <span>Guidance Scale (CFG)</span>
            <span className="font-mono text-zinc-300 font-bold">{cfg.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="8.0"
            step="0.5"
            value={cfg}
            onChange={(e) => setCfg(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-[#0D1119] rounded h-1 cursor-pointer"
          />
        </div>

        {/* Seed Randomizer */}
        <div className="pt-1 border-t border-[#1E2638]">
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Dna className="w-3 h-3 text-zinc-500" />
              Inference Seed
            </span>
            <button
              type="button"
              onClick={handleRandomizeSeed}
              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-cyan-400 font-mono transition-colors"
            >
              <Shuffle className="w-3 h-3" />
              Randomize
            </button>
          </div>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Output Handle to Sequencer */}
      <Handle
        type="source"
        position={Position.Right}
        id="model-out"
        className="!bg-zinc-400 hover:!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
    </div>
  );
};

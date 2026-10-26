'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu, Dna, Shuffle, Sparkles, Loader2, Check } from 'lucide-react';
import { VIDEO_MODELS } from '../../../lib/models/modelRegistry';
import { useStudioStore } from '../../../lib/store/studioStore';

interface ModelNodeData {
  label: string;
  modelId: string;
  resolution: string;
  aspectRatio: string;
  fps: number;
  cfg: number;
  steps: number;
  seed?: number;
  isGenerating?: boolean;
  progress?: number;
}

export const ModelNode: React.FC<{
  id: string;
  data: ModelNodeData;
  selected?: boolean;
}> = ({ id, data, selected }) => {
  const updateNodeData = useStudioStore((s) => s.updateNodeData);
  const isGeneratingVideo = useStudioStore((s) => s.isGeneratingVideo);
  const generationProgress = useStudioStore((s) => s.generationProgress);
  const generateActiveScene = useStudioStore((s) => s.generateActiveScene);

  const [modelId, setModelId] = useState(data.modelId || 'flux_video');
  const [resolution, setResolution] = useState(data.resolution || '1080p');
  const [cfg, setCfg] = useState(data.cfg || 4.5);
  const [steps, setSteps] = useState(data.steps || 35);
  const [seed, setSeed] = useState(data.seed || 4289104);

  const currentModel = VIDEO_MODELS[modelId] || VIDEO_MODELS.flux_video;

  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 99999999);
    setSeed(newSeed);
    updateNodeData(id, { seed: newSeed });
  };

  const handleModelChange = (idVal: string) => {
    setModelId(idVal);
    updateNodeData(id, { modelId: idVal, resolution, cfg, steps, seed });
  };

  const handleResolutionChange = (res: string) => {
    setResolution(res);
    updateNodeData(id, { modelId, resolution: res, cfg, steps, seed });
  };

  const handleCfgChange = (val: number) => {
    setCfg(val);
    updateNodeData(id, { modelId, resolution, cfg: val, steps, seed });
  };

  const handleStepsChange = (val: number) => {
    setSteps(val);
    updateNodeData(id, { modelId, resolution, cfg, steps: val, seed });
  };

  return (
    <div
      className={`w-84 rounded-lg bg-[#12161F] border transition-all text-zinc-100 shadow-xl overflow-hidden ${
        selected
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
        className="!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="camera-in"
        style={{ top: '72%' }}
        className="!bg-amber-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B26] border-b border-[#1E2638]">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
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
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
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
                onClick={() => handleResolutionChange(res)}
                className={`py-1 text-[11px] font-mono rounded-md border text-center transition-colors ${
                  resolution === res
                    ? 'bg-zinc-700 border-emerald-400/80 text-zinc-100 font-semibold shadow-sm'
                    : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* CFG Guidance Scale Slider */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Dna className="w-3 h-3 text-zinc-500" />
              CFG Prompt Guidance
            </span>
            <span className="font-mono text-zinc-300">{cfg.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={12.0}
            step={0.5}
            value={cfg}
            onChange={(e) => handleCfgChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#0D1119] rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-[#1E2638]"
          />
        </div>

        {/* Denoise Steps Slider */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 mb-1">
            <span>Denoising Steps</span>
            <span className="font-mono text-zinc-300">{steps} iters</span>
          </div>
          <input
            type="range"
            min={20}
            max={60}
            step={5}
            value={steps}
            onChange={(e) => handleStepsChange(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-[#0D1119] rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-[#1E2638]"
          />
        </div>

        {/* Seed & Randomizer */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1E2638]/70">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <span>Seed:</span>
            <span className="text-zinc-300">{seed}</span>
          </div>
          <button
            type="button"
            onClick={handleRandomizeSeed}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 px-2 py-0.5 rounded transition-colors"
          >
            <Shuffle className="w-3 h-3 text-zinc-500" />
            <span>Randomize</span>
          </button>
        </div>

        {/* Real Generation Action Button */}
        <button
          type="button"
          onClick={() => generateActiveScene()}
          disabled={isGeneratingVideo}
          className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 disabled:opacity-50"
        >
          {isGeneratingVideo ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating DiT Latents ({generationProgress}%)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Video Shot</span>
            </>
          )}
        </button>
      </div>

      {/* Output Handle to Sequencer */}
      <Handle
        type="source"
        position={Position.Right}
        id="model-out"
        className="!bg-emerald-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu, Dna, Shuffle, Sparkles, Loader2 } from 'lucide-react';
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
      className={`w-84 rounded-xl bg-[#191B22] border transition-all text-zinc-100 shadow-2xl overflow-hidden ${
        selected
          ? 'border-[#FF5500]/80 ring-1 ring-[#FF5500]/30 shadow-black/90'
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Input Handles for Prompt and Camera */}
      <Handle
        type="target"
        position={Position.Left}
        id="prompt-in"
        style={{ top: '28%' }}
        className="!bg-zinc-500 !w-2.5 !h-2.5 !border-[#121317] hover:!bg-[#FF5500]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="camera-in"
        style={{ top: '72%' }}
        className="!bg-zinc-500 !w-2.5 !h-2.5 !border-[#121317] hover:!bg-[#FF5500]"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#21242E] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0D0E12] border border-white/[0.08] flex items-center justify-center">
            <Cpu className="w-3 h-3 text-[#FF5500]" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-white font-display">
            DiT Latent Engine
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#0D0E12] px-1.5 py-0.5 rounded border border-white/[0.08]">
          {currentModel.version}
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3 text-xs">
        {/* Model Selector */}
        <div>
          <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Diffusion Model Backbone
          </label>
          <select
            value={modelId}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full bg-[#0D0E12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#FF5500]/60 font-medium cursor-pointer"
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
          <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
            Raster Output Resolution
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['720p', '1080p', '4K-Cinema'].map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => handleResolutionChange(res)}
                className={`py-1 text-[11px] font-mono rounded-md border text-center transition-all cursor-pointer ${
                  resolution === res
                    ? 'bg-[#21242E] border-[#FF5500]/60 text-[#FF5500] font-bold shadow-sm'
                    : 'bg-[#0D0E12] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* CFG Guidance Scale Slider */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Dna className="w-3 h-3 text-zinc-400" />
              <span>CFG Guidance Scale</span>
            </span>
            <span className="font-mono text-zinc-200 font-medium">{cfg.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={12.0}
            step={0.5}
            value={cfg}
            onChange={(e) => handleCfgChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#0D0E12] rounded-lg appearance-none cursor-pointer accent-[#FF5500] border border-white/[0.08]"
          />
        </div>

        {/* Denoise Steps Slider */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
            <span>Denoising Iterations</span>
            <span className="font-mono text-zinc-200 font-medium">{steps} iters</span>
          </div>
          <input
            type="range"
            min={20}
            max={60}
            step={5}
            value={steps}
            onChange={(e) => handleStepsChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[#0D0E12] rounded-lg appearance-none cursor-pointer accent-[#FF5500] border border-white/[0.08]"
          />
        </div>

        {/* Seed & Randomizer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <span>Seed:</span>
            <span className="text-zinc-200 font-medium">{seed}</span>
          </div>
          <button
            type="button"
            onClick={handleRandomizeSeed}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-[#21242E] px-2 py-0.5 rounded border border-white/[0.08] transition-colors cursor-pointer"
          >
            <Shuffle className="w-3 h-3 text-zinc-400" />
            <span>Randomize</span>
          </button>
        </div>

        {/* Real Generation Action Button */}
        <button
          type="button"
          onClick={() => generateActiveScene()}
          disabled={isGeneratingVideo}
          className="w-full py-2.5 rounded-lg bg-[#FF5500] hover:bg-[#FF661A] text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer active:scale-98 font-mono"
        >
          {isGeneratingVideo ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              <span>Generating DiT Latents ({generationProgress}%)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
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
        className="!bg-zinc-500 !w-2.5 !h-2.5 !border-[#121317] hover:!bg-[#FF5500]"
      />
    </div>
  );
};

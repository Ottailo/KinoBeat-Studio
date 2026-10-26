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
      className={`w-84 rounded-xl bg-[#10141B] border transition-all text-zinc-100 shadow-2xl overflow-hidden ${
        selected
          ? 'border-zinc-400 ring-1 ring-zinc-500/30 shadow-black/80'
          : 'border-[#1E2535] hover:border-[#2C384E]'
      }`}
    >
      {/* Input Handles for Prompt and Camera */}
      <Handle
        type="target"
        position={Position.Left}
        id="prompt-in"
        style={{ top: '28%' }}
        className="!bg-[#475569] !w-2.5 !h-2.5 !border-[#090B0E] hover:!bg-zinc-200"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="camera-in"
        style={{ top: '72%' }}
        className="!bg-[#475569] !w-2.5 !h-2.5 !border-[#090B0E] hover:!bg-zinc-200"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141A24] border-b border-[#1C2331]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#090B0E] border border-[#1E2535] flex items-center justify-center">
            <Cpu className="w-3 h-3 text-zinc-300" />
          </div>
          <span className="text-xs font-medium tracking-tight text-zinc-100">
            DiT Latent Engine
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#090B0E] px-1.5 py-0.5 rounded border border-[#1C2331]">
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
            className="w-full bg-[#090B0E] border border-[#1E2535] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-300 font-medium cursor-pointer"
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
                    ? 'bg-[#182130] border-zinc-400 text-white font-medium shadow-sm'
                    : 'bg-[#090B0E] border-[#1C2331] text-zinc-400 hover:text-zinc-200 hover:border-[#2C384E]'
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
              <Dna className="w-3 h-3 text-zinc-500" />
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
            className="w-full h-1.5 bg-[#090B0E] rounded-lg appearance-none cursor-pointer accent-zinc-200 border border-[#1C2331]"
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
            className="w-full h-1.5 bg-[#090B0E] rounded-lg appearance-none cursor-pointer accent-zinc-200 border border-[#1C2331]"
          />
        </div>

        {/* Seed & Randomizer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1C2331]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <span>Seed:</span>
            <span className="text-zinc-200 font-medium">{seed}</span>
          </div>
          <button
            type="button"
            onClick={handleRandomizeSeed}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-[#161C26] px-2 py-0.5 rounded border border-[#1C2331] transition-colors cursor-pointer"
          >
            <Shuffle className="w-3 h-3 text-zinc-500" />
            <span>Randomize</span>
          </button>
        </div>

        {/* Real Generation Action Button (Impeccable High-Contrast Pro Studio Button) */}
        <button
          type="button"
          onClick={() => generateActiveScene()}
          disabled={isGeneratingVideo}
          className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
        >
          {isGeneratingVideo ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
              <span>Generating DiT Latents ({generationProgress}%)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
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
        className="!bg-[#475569] !w-2.5 !h-2.5 !border-[#090B0E] hover:!bg-zinc-200"
      />
    </div>
  );
};

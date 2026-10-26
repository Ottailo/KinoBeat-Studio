'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu, Layers, Sliders, Zap } from 'lucide-react';
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
  const [modelId, setModelId] = useState(data.modelId);
  const [resolution, setResolution] = useState(data.resolution);
  const [cfg, setCfg] = useState(data.cfg);
  const [steps, setSteps] = useState(data.steps);

  const currentModel = VIDEO_MODELS[modelId] || VIDEO_MODELS.flux_video;

  return (
    <div
      className={`w-88 rounded-xl bg-[#0f131a] border transition-all text-white shadow-2xl overflow-hidden ${
        isSelected
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
          : 'border-[#1e2638] hover:border-neutral-600'
      }`}
    >
      {/* Input Handles for Prompt and Camera */}
      <Handle
        type="target"
        position={Position.Left}
        id="prompt-in"
        style={{ top: '25%' }}
        className="!bg-cyan-400 !w-3 !h-3"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="camera-in"
        style={{ top: '75%' }}
        className="!bg-pink-500 !w-3 !h-3"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141a24] border-b border-[#1e2638]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xs font-bold text-neutral-200">
            DIT VIDEO CORE
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
          ORCHESTRATOR
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3 text-xs">
        {/* Model Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            Diffusion Transformer Model
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2638] rounded px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
          >
            {Object.values(VIDEO_MODELS).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Model Spec Badge */}
        <div className="p-2.5 rounded bg-[#090a0f] border border-[#1e2638] text-[11px] space-y-1">
          <div className="flex justify-between items-center text-neutral-400">
            <span>Context / Attention:</span>
            <span className="text-cyan-400 font-mono text-[10px]">{currentModel.contextWindow}</span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>Camera Guidance:</span>
            <span className="text-pink-400 font-mono text-[10px] uppercase">
              {currentModel.cameraPromptSupport}
            </span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>Native Frame Rate:</span>
            <span className="text-white font-mono text-[10px]">{currentModel.nativeFps} FPS</span>
          </div>
        </div>

        {/* Resolution & Aspect Ratio Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              Render Quality
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-[#090a0f] border border-[#1e2638] rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none"
            >
              {currentModel.supportedResolutions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              Frame Aspect
            </label>
            <select
              defaultValue={data.aspectRatio}
              className="w-full bg-[#090a0f] border border-[#1e2638] rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none"
            >
              {currentModel.supportedAspectRatios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CFG & Step Sliders */}
        <div className="space-y-2 pt-1">
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" />
                Classifier-Free Guidance (CFG)
              </span>
              <span className="text-cyan-400 font-bold">{cfg.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="9.0"
              step="0.5"
              value={cfg}
              onChange={(e) => setCfg(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-[#1e2638] rounded h-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Denoising Steps
              </span>
              <span className="text-amber-400 font-bold">{steps}</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              step="5"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
              className="w-full accent-amber-400 bg-[#1e2638] rounded h-1.5"
            />
          </div>
        </div>
      </div>

      {/* Output Handle to Sequencer */}
      <Handle
        type="source"
        position={Position.Right}
        id="model-out"
        className="!bg-cyan-400 !w-3 !h-3"
      />
    </div>
  );
};

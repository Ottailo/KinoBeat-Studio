'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Type, Sparkles, SlidersHorizontal } from 'lucide-react';
import { LOOK_PRESETS } from '../../../lib/models/promptEngine';
import { useStudioStore } from '../../../lib/store/studioStore';

interface PromptNodeData {
  label: string;
  subject: string;
  action: string;
  look: string;
  soulId: string;
  aspectRatio?: string;
  negativePrompt: string;
}

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '21:9'] as const;

export const PromptNode: React.FC<{
  id: string;
  data: PromptNodeData;
  selected?: boolean;
}> = ({ id, data, selected }) => {
  const updateNodeData = useStudioStore((s) => s.updateNodeData);
  const globalAspectRatio = useStudioStore((s) => s.aspectRatio);
  const setStoreAspectRatio = useStudioStore((s) => s.setAspectRatio);

  const [subject, setSubject] = useState(data.subject || '');
  const [action, setAction] = useState(data.action || '');
  const [look, setLook] = useState(data.look || LOOK_PRESETS[1].prompt);
  const [aspectRatio, setAspectRatio] = useState(globalAspectRatio || data.aspectRatio || '16:9');
  const [showNegative, setShowNegative] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState(data.negativePrompt || '');

  // Synchronize internal state if data props change externally
  useEffect(() => {
    if (data.subject !== undefined) setSubject(data.subject);
  }, [data.subject]);

  useEffect(() => {
    if (data.action !== undefined) setAction(data.action);
  }, [data.action]);

  useEffect(() => {
    if (globalAspectRatio) setAspectRatio(globalAspectRatio);
  }, [globalAspectRatio]);

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    updateNodeData(id, { subject: val, action, look, aspectRatio });
  };

  const handleActionChange = (val: string) => {
    setAction(val);
    updateNodeData(id, { subject, action: val, look, aspectRatio });
  };

  const handleLookChange = (val: string) => {
    setLook(val);
    updateNodeData(id, { subject, action, look: val, aspectRatio });
  };

  const handleAspectRatioChange = (ratio: '16:9' | '9:16' | '1:1' | '21:9') => {
    setAspectRatio(ratio);
    setStoreAspectRatio(ratio);
    updateNodeData(id, { aspectRatio: ratio });
  };

  // MCSLA Prompt Enhancer
  const handleEnhancePrompt = () => {
    const enhancedSubject = subject.includes('volumetric')
      ? subject
      : `${subject.trim()}, volumetric atmospheric haze, hyper-detailed subsurface scattering`;
    const enhancedAction = action.includes('cinematic')
      ? action
      : `${action.trim()}, cinematic shutter timing, continuous fluid motion`;

    setSubject(enhancedSubject);
    setAction(enhancedAction);
    updateNodeData(id, { subject: enhancedSubject, action: enhancedAction });
  };

  const fullPromptText = `${subject} ${action} ${look}`;
  const estimatedTokens = Math.max(1, Math.round(fullPromptText.split(/\s+/).length * 1.3));

  return (
    <div
      className={`w-84 rounded-xl bg-[#10141B] border transition-all text-zinc-100 shadow-2xl overflow-hidden ${
        selected
          ? 'border-zinc-400 ring-1 ring-zinc-500/30 shadow-black/80'
          : 'border-[#1E2535] hover:border-[#2C384E]'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141A24] border-b border-[#1C2331]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#090B0E] border border-[#1E2535] flex items-center justify-center">
            <Type className="w-3 h-3 text-zinc-300" />
          </div>
          <span className="text-xs font-medium tracking-tight text-zinc-100">
            Prompt Core
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleEnhancePrompt}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#18202F] hover:bg-[#202C40] text-[10px] text-zinc-200 font-mono transition-colors border border-[#2B3B54] cursor-pointer"
            title="Auto-enhance with cinematic modifiers"
          >
            <Sparkles className="w-2.5 h-2.5 text-zinc-300" />
            <span>Enhance</span>
          </button>
          <span className="text-[10px] font-mono text-zinc-400 bg-[#090B0E] px-1.5 py-0.5 rounded border border-[#1C2331]">
            {estimatedTokens} tkn
          </span>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3 text-xs">
        {/* Subject & Scene */}
        <div>
          <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Subject & Visual Focus
          </label>
          <textarea
            rows={2}
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="Describe subject, wardrobe, and primary elements..."
            className="w-full bg-[#090B0E] border border-[#1E2535] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-300 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Dynamic Action */}
        <div>
          <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Motion & Choreography
          </label>
          <textarea
            rows={2}
            value={action}
            onChange={(e) => handleActionChange(e.target.value)}
            placeholder="Describe kinetic movements and physical actions..."
            className="w-full bg-[#090B0E] border border-[#1E2535] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-300 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Cinematic Look / Film Stock */}
        <div>
          <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Optics & Color Grade
          </label>
          <select
            value={look}
            onChange={(e) => handleLookChange(e.target.value)}
            className="w-full bg-[#090B0E] border border-[#1E2535] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-300 cursor-pointer font-medium"
          >
            {LOOK_PRESETS.map((p) => (
              <option key={p.id} value={p.prompt}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
              Anamorphic Aspect Ratio
            </span>
            <span className="text-[10px] text-zinc-300 font-mono font-medium">{aspectRatio}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => handleAspectRatioChange(ratio)}
                className={`py-1 text-[11px] font-mono rounded-md border text-center transition-all cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-[#182130] border-zinc-400 text-white font-medium shadow-sm'
                    : 'bg-[#090B0E] border-[#1C2331] text-zinc-400 hover:text-zinc-200 hover:border-[#2C384E]'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Negative Prompt Filter */}
        <div className="pt-2 border-t border-[#1C2331]">
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="flex items-center justify-between w-full text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
              <span>Negative Prompt Filter</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {showNegative ? '− Collapse' : '+ Expand'}
            </span>
          </button>
          {showNegative && (
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => {
                setNegativePrompt(e.target.value);
                updateNodeData(id, { negativePrompt: e.target.value });
              }}
              placeholder="Elements to avoid (e.g. blurry, watermarks, morphing)..."
              className="mt-2 w-full bg-[#090B0E] border border-[#1E2535] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-300 resize-none leading-relaxed"
            />
          )}
        </div>
      </div>

      {/* Output Handle to Model */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!bg-[#475569] !w-2.5 !h-2.5 !border-[#090B0E] hover:!bg-zinc-200"
      />
    </div>
  );
};

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
      className={`w-84 rounded-xl bg-[#191B22] border transition-all text-zinc-100 shadow-2xl overflow-hidden ${
        selected
          ? 'border-[#FF5500]/80 ring-1 ring-[#FF5500]/30 shadow-black/90'
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#21242E] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0D0E12] border border-white/[0.08] flex items-center justify-center">
            <Type className="w-3 h-3 text-[#FF5500]" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-white font-display">
            Prompt Core
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleEnhancePrompt}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2a2e3c] hover:bg-[#34394a] text-[10px] text-[#FF5500] font-mono transition-colors border border-[#FF5500]/30 cursor-pointer"
            title="Auto-enhance with cinematic modifiers"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#FF5500]" />
            <span>Enhance</span>
          </button>
          <span className="text-[10px] font-mono text-zinc-400 bg-[#0D0E12] px-1.5 py-0.5 rounded border border-white/[0.08]">
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
            className="w-full bg-[#0D0E12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#FF5500]/60 transition-colors resize-none leading-relaxed"
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
            className="w-full bg-[#0D0E12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#FF5500]/60 transition-colors resize-none leading-relaxed"
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
            className="w-full bg-[#0D0E12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#FF5500]/60 cursor-pointer font-medium"
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
            <span className="text-[10px] text-[#FF5500] font-mono font-semibold">{aspectRatio}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => handleAspectRatioChange(ratio)}
                className={`py-1 text-[11px] font-mono rounded-md border text-center transition-all cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-[#21242E] border-[#FF5500]/60 text-[#FF5500] font-bold shadow-sm'
                    : 'bg-[#0D0E12] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Negative Prompt Filter */}
        <div className="pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="flex items-center justify-between w-full text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
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
              className="mt-2 w-full bg-[#0D0E12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#FF5500]/60 resize-none leading-relaxed"
            />
          )}
        </div>
      </div>

      {/* Output Handle to Model */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!bg-zinc-500 !w-2.5 !h-2.5 !border-[#121317] hover:!bg-[#FF5500]"
      />
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Type, Sparkles, SlidersHorizontal, Ratio } from 'lucide-react';
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
  const activeSceneIndex = useStudioStore((s) => s.activeSceneIndex);
  const globalAspectRatio = useStudioStore((s) => s.aspectRatio);
  const setStoreAspectRatio = useStudioStore((s) => s.setAspectRatio);

  const [subject, setSubject] = useState(data.subject || '');
  const [action, setAction] = useState(data.action || '');
  const [look, setLook] = useState(data.look || LOOK_PRESETS[1].prompt);
  const [aspectRatio, setAspectRatio] = useState(globalAspectRatio || data.aspectRatio || '16:9');
  const [showNegative, setShowNegative] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState(data.negativePrompt || '');

  // Synchronize internal state if data props change externally (e.g. via timeline scene selection)
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
      className={`w-84 rounded-lg bg-[#12161F] border transition-all text-zinc-100 shadow-xl overflow-hidden ${
        selected
          ? 'border-cyan-400 ring-1 ring-cyan-400/40'
          : 'border-[#1E2638] hover:border-zinc-700'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B26] border-b border-[#1E2638]">
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            Prompt Core
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleEnhancePrompt}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-cyan-300 font-mono transition-colors border border-zinc-700"
            title="Auto-enhance with cinematic modifiers"
          >
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>Enhance</span>
          </button>
          <span className="text-[10px] font-mono text-zinc-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
            {estimatedTokens} / 250 tkn
          </span>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2.5 text-xs">
        {/* Subject & Scene */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Subject & Visual Focus
          </label>
          <textarea
            rows={2}
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="Describe subject, wardrobe, and primary elements..."
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Dynamic Action */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Motion & Choreography
          </label>
          <textarea
            rows={2}
            value={action}
            onChange={(e) => handleActionChange(e.target.value)}
            placeholder="Describe kinetic movements and physical actions..."
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Cinematic Look / Film Stock */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Optics & Color Grade
          </label>
          <select
            value={look}
            onChange={(e) => handleLookChange(e.target.value)}
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
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
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 flex items-center justify-between">
            <span>Aspect Ratio</span>
            <span className="text-[10px] text-zinc-500 font-mono">Format</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => handleAspectRatioChange(ratio)}
                className={`py-1 text-[11px] font-mono rounded-md border text-center transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-zinc-700 border-cyan-400/80 text-zinc-100 font-semibold shadow-sm'
                    : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Negative Prompt Toggle */}
        <div className="pt-1 border-t border-[#1E2638]/70">
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="flex items-center justify-between w-full text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
              Negative Prompt Filter
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {showNegative ? '− Hide' : '+ Edit'}
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
              className="mt-2 w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-400 placeholder-zinc-700 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          )}
        </div>
      </div>

      {/* Output Handle to Model */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
    </div>
  );
};

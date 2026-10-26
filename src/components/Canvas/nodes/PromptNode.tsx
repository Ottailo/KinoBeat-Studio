'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Type, Shield, SlidersHorizontal } from 'lucide-react';
import { LOOK_PRESETS } from '../../../lib/models/promptEngine';

interface PromptNodeData {
  label: string;
  subject: string;
  action: string;
  look: string;
  soulId: string;
  negativePrompt: string;
}

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '21:9'];

export const PromptNode: React.FC<{ data: PromptNodeData; isSelected?: boolean }> = ({
  data,
  isSelected,
}) => {
  const [subject, setSubject] = useState(data.subject);
  const [action, setAction] = useState(data.action);
  const [look, setLook] = useState(data.look);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [showNegative, setShowNegative] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState(data.negativePrompt);

  const fullPromptText = `${subject} ${action} ${look}`;
  const estimatedTokens = Math.max(1, Math.round(fullPromptText.split(/\s+/).length * 1.3));

  return (
    <div
      className={`w-84 rounded-lg bg-[#12161F] border transition-all text-zinc-100 shadow-xl overflow-hidden ${
        isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400/40'
          : 'border-[#1E2638] hover:border-zinc-700'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B26] border-b border-[#1E2638]">
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            Prompt Core
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
          {estimatedTokens} / 250 tokens
        </span>
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
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Describe subject, wardrobe, and primary elements..."
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none leading-relaxed"
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
            onChange={(e) => setAction(e.target.value)}
            placeholder="Describe kinetic movements and physical actions..."
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Cinematic Look / Film Stock */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Optics & Color Grade
          </label>
          <select
            value={look}
            onChange={(e) => setLook(e.target.value)}
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
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
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
            Aspect Ratio
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-zinc-800 border-zinc-500 text-zinc-100 font-medium'
                    : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Negative Prompt Collapsible */}
        <div className="pt-1 border-t border-[#1E2638]">
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="flex items-center justify-between w-full text-[11px] text-zinc-400 hover:text-zinc-200 py-0.5"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-zinc-500" />
              Negative Prompt
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              {showNegative ? 'Hide' : 'Configure'}
            </span>
          </button>
          {showNegative && (
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="mt-1.5 w-full bg-[#0D1119] border border-[#1E2638] rounded-md p-2 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!bg-zinc-400 hover:!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
    </div>
  );
};

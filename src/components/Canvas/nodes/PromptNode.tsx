'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, UserCheck, ShieldAlert } from 'lucide-react';
import { LOOK_PRESETS } from '../../../lib/models/promptEngine';

interface PromptNodeData {
  label: string;
  subject: string;
  action: string;
  look: string;
  soulId: string;
  negativePrompt: string;
}

export const PromptNode: React.FC<{ data: PromptNodeData; isSelected?: boolean }> = ({
  data,
  isSelected,
}) => {
  const [subject, setSubject] = useState(data.subject);
  const [action, setAction] = useState(data.action);
  const [look, setLook] = useState(data.look);
  const [soulId, setSoulId] = useState(data.soulId);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`w-80 rounded-xl bg-[#0f131a] border transition-all text-white shadow-2xl overflow-hidden ${
        isSelected
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
          : 'border-[#1e2638] hover:border-neutral-600'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141a24] border-b border-[#1e2638]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xs font-bold text-neutral-200">MCSLA PROMPT</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
          CORE
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3 text-xs">
        {/* Character / Soul Lock */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-cyan-400" />
              Soul ID (Character Consistency)
            </label>
            <span className="text-[9px] text-cyan-400 font-mono">LOCKED</span>
          </div>
          <input
            type="text"
            value={soulId}
            onChange={(e) => setSoulId(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2638] rounded px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
            placeholder="e.g. OP-V2088"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
            Subject & Wardrobe
          </label>
          <textarea
            rows={2}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2638] rounded p-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-400 resize-none"
          />
        </div>

        {/* Action & Choreography */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
            Action & Kinetic Dynamics
          </label>
          <textarea
            rows={2}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2638] rounded p-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-400 resize-none"
          />
        </div>

        {/* Look & Lighting Preset */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
            Look & Film Color Science
          </label>
          <select
            value={look}
            onChange={(e) => setLook(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2638] rounded px-2 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-cyan-400"
          >
            {LOOK_PRESETS.map((p) => (
              <option key={p.id} value={p.prompt}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Collapsible Negative Prompt */}
        <div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 hover:text-neutral-200"
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>{isExpanded ? 'Hide Negative Invariants' : 'Show Negative Invariants'}</span>
          </button>
          {isExpanded && (
            <textarea
              rows={2}
              defaultValue={data.negativePrompt}
              className="mt-1.5 w-full bg-[#090a0f] border border-[#1e2638] rounded p-1.5 text-[11px] text-neutral-400 focus:outline-none resize-none"
            />
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!bg-cyan-400 !w-3 !h-3"
      />
    </div>
  );
};

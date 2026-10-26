'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Video, Gauge, Compass } from 'lucide-react';

interface CameraNodeData {
  label: string;
  presetId: string;
  name: string;
  category: string;
  speedRamp: number;
  focalLength: string;
}

const CINEMA_PRESETS = [
  { id: 'orbital_drift', name: '360° Orbital Drift', type: 'Arc / Orbit', desc: 'Smooth horizontal circular arc with center focal lock' },
  { id: 'fpv_dive', name: 'FPV Dive & Acro', type: 'High Kinetic', desc: 'Agile dynamic aerial descent with horizon banking' },
  { id: 'dolly_zoom_vertigo', name: 'Dolly Zoom (Vertigo)', type: 'Optical', desc: 'Counter-zoom warping background scale around subject' },
  { id: 'roll_540', name: '540° Dynamic Roll', type: 'Kinetic', desc: 'Fast continuous roll axis barrel rotation' },
  { id: 'crane_shot', name: 'Overhead Crane Shot', type: 'Vertical', desc: 'Sweeping top-down vertical reveal' },
  { id: 'rack_focus_push', name: 'Rack Focus & Push', type: 'Focus', desc: 'Depth plane transition from foreground texture to subject' },
];

const FOCAL_LENGTHS = [
  { mm: '24mm', label: 'Wide' },
  { mm: '35mm', label: 'Standard' },
  { mm: '50mm', label: 'Cinematic' },
  { mm: '85mm', label: 'Portrait' },
];

const EASING_CURVES = ['Smoothstep (Ease In/Out)', 'Exponential Ramp', 'Linear Constant', 'Elastic Snap'];

export const CameraNode: React.FC<{ data: CameraNodeData; isSelected?: boolean }> = ({
  data,
  isSelected,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(data.presetId || 'orbital_drift');
  const [focalLength, setFocalLength] = useState('35mm');
  const [speedRamp, setSpeedRamp] = useState(data.speedRamp || 1.0);
  const [easing, setEasing] = useState('Smoothstep (Ease In/Out)');

  const activePresetInfo = CINEMA_PRESETS.find((p) => p.id === selectedPreset) || CINEMA_PRESETS[0];

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
          <Video className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            Cinematic Camera
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
          6-DOF
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-3 text-xs">
        {/* Motion Trajectory Preset */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center justify-between">
            <span>Motion Trajectory</span>
            <span className="text-[10px] text-zinc-500 font-mono">{activePresetInfo.type}</span>
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-medium"
          >
            {CINEMA_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
            {activePresetInfo.desc}
          </p>
        </div>

        {/* Focal Length Selector Pills */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
            Lens Focal Length
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {FOCAL_LENGTHS.map((f) => (
              <button
                key={f.mm}
                type="button"
                onClick={() => setFocalLength(f.mm)}
                className={`py-1.5 text-center rounded border transition-colors ${
                  focalLength === f.mm
                    ? 'bg-zinc-800 border-zinc-500 text-zinc-100 font-medium'
                    : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-[11px] font-mono">{f.mm}</div>
                <div className="text-[9px] text-zinc-500">{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Speed Ramping */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-medium text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-zinc-500" />
              Dynamic Speed Ramp
            </span>
            <span className="font-mono text-zinc-300 font-bold">{speedRamp.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={speedRamp}
            onChange={(e) => setSpeedRamp(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-[#0D1119] rounded h-1 cursor-pointer"
          />
        </div>

        {/* Transition Easing */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Transition Easing Curve
          </label>
          <select
            value={easing}
            onChange={(e) => setEasing(e.target.value)}
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
          >
            {EASING_CURVES.map((curve) => (
              <option key={curve} value={curve}>
                {curve}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="camera-out"
        className="!bg-zinc-400 hover:!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
    </div>
  );
};

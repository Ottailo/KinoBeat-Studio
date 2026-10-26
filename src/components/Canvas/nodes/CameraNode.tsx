'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Video, Compass, Activity } from 'lucide-react';
import { CAMERA_CURVES } from '../../../lib/camera/cameraMath';

interface CameraNodeData {
  label: string;
  presetId: string;
  name: string;
  category: string;
  speedRamp: number;
  focalLength: string;
}

export const CameraNode: React.FC<{ data: CameraNodeData; isSelected?: boolean }> = ({
  data,
  isSelected,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(data.presetId);
  const [speedRamp, setSpeedRamp] = useState(data.speedRamp);

  const currentCurve = CAMERA_CURVES[selectedPreset] || CAMERA_CURVES.orbital_drift;

  return (
    <div
      className={`w-80 rounded-xl bg-[#0f131a] border transition-all text-white shadow-2xl overflow-hidden ${
        isSelected
          ? 'border-pink-500 shadow-[0_0_20px_rgba(255,0,127,0.3)]'
          : 'border-[#1e2638] hover:border-neutral-600'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141a24] border-b border-[#1e2638]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-pink-500/20 text-pink-400">
            <Video className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xs font-bold text-neutral-200">CAMERA KINETICS</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800/40">
          MCSLA [C]
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3 text-xs">
        {/* Preset Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-pink-400" />
            Motion Trajectory Preset
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2638] rounded px-2.5 py-1.5 text-xs text-pink-300 font-mono focus:outline-none focus:border-pink-400"
          >
            {Object.values(CAMERA_CURVES).map((curve) => (
              <option key={curve.id} value={curve.id}>
                {curve.name} ({curve.category})
              </option>
            ))}
          </select>
        </div>

        {/* Mathematical Formula Preview */}
        <div className="p-2.5 rounded bg-[#090a0f] border border-[#1e2638] font-mono text-[11px]">
          <div className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 flex items-center justify-between">
            <span>Vector Easing Formula</span>
            <Activity className="w-3 h-3 text-pink-400" />
          </div>
          <div className="text-pink-300 overflow-x-auto py-1">
            {currentCurve.formulaLaTeX}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            {currentCurve.description}
          </div>
        </div>

        {/* Speed Ramping Slider */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mb-1">
            <span>Dynamic Speed Ramp</span>
            <span className="text-pink-400 font-bold">{speedRamp.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={speedRamp}
            onChange={(e) => setSpeedRamp(parseFloat(e.target.value))}
            className="w-full accent-pink-500 bg-[#1e2638] rounded h-1.5"
          />
        </div>

        {/* Lens / Anamorphic Spec */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1e2638] text-[10px] font-mono text-neutral-400">
          <span>OPTICS: 35mm Prime Anamorphic</span>
          <span className="text-cyan-400">T/1.4</span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="camera-out"
        className="!bg-pink-500 !w-3 !h-3"
      />
    </div>
  );
};

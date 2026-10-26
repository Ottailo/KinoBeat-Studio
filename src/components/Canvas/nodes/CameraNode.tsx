'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Video, Gauge, Compass, Play } from 'lucide-react';
import { useStudioStore } from '../../../lib/store/studioStore';
import { CAMERA_CURVES } from '../../../lib/camera/cameraMath';

interface CameraNodeData {
  label: string;
  presetId: string;
  name: string;
  category: string;
  speedRamp: number;
  focalLength: string;
  easing?: string;
}

export const CINEMA_PRESETS = [
  { id: 'orbital_drift', name: '360° Orbital Drift', type: 'Arc / Orbit', desc: 'Smooth horizontal circular arc with center focal lock' },
  { id: 'fpv_dive', name: 'FPV Dive & Acro', type: 'High Kinetic', desc: 'Agile dynamic aerial descent with horizon banking' },
  { id: 'dolly_zoom_vertigo', name: 'Dolly Zoom (Vertigo)', type: 'Optical', desc: 'Counter-zoom warping background scale around subject' },
  { id: 'roll_540', name: '540° Dynamic Roll', type: 'Kinetic', desc: 'Fast continuous roll axis barrel rotation' },
  { id: 'crane_shot', name: 'Overhead Crane Shot', type: 'Vertical', desc: 'Sweeping top-down vertical reveal' },
  { id: 'rack_focus_push', name: 'Rack Focus & Push', type: 'Focus', desc: 'Depth plane transition from foreground texture to subject' },
];

export const FOCAL_LENGTHS = [
  { mm: '24mm', label: 'Wide' },
  { mm: '35mm', label: 'Standard' },
  { mm: '50mm', label: 'Cinematic' },
  { mm: '85mm', label: 'Portrait' },
];

export const EASING_CURVES = [
  'Smoothstep (Ease In/Out)',
  'Exponential Ramp',
  'Linear Constant',
  'Elastic Snap',
];

export const CameraNode: React.FC<{
  id: string;
  data: CameraNodeData;
  selected?: boolean;
}> = ({ id, data, selected }) => {
  const updateNodeData = useStudioStore((s) => s.updateNodeData);
  const setCameraOptions = useStudioStore((s) => s.setCameraOptions);
  const currentTime = useStudioStore((s) => s.currentTime);
  const duration = useStudioStore((s) => s.duration);
  const seekTo = useStudioStore((s) => s.seekTo);

  const [selectedPreset, setSelectedPreset] = useState(data.presetId || 'orbital_drift');
  const [focalLength, setFocalLength] = useState(data.focalLength || '35mm');
  const [speedRamp, setSpeedRamp] = useState(data.speedRamp || 1.25);
  const [easing, setEasing] = useState(data.easing || 'Smoothstep (Ease In/Out)');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (data.presetId && data.presetId !== selectedPreset) {
      setSelectedPreset(data.presetId);
    }
  }, [data.presetId, selectedPreset]);

  useEffect(() => {
    if (data.focalLength && data.focalLength !== focalLength) {
      setFocalLength(data.focalLength);
    }
  }, [data.focalLength, focalLength]);

  useEffect(() => {
    if (data.speedRamp && data.speedRamp !== speedRamp) {
      setSpeedRamp(data.speedRamp);
    }
  }, [data.speedRamp, speedRamp]);

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    setCameraOptions({ presetId, focalLength, speedRamp, easing });
    updateNodeData(id, { presetId, focalLength, speedRamp, easing });
  };

  const handleFocalLengthChange = (mm: string) => {
    setFocalLength(mm);
    setCameraOptions({ presetId: selectedPreset, focalLength: mm, speedRamp, easing });
    updateNodeData(id, { presetId: selectedPreset, focalLength: mm, speedRamp, easing });
  };

  const handleSpeedRampChange = (val: number) => {
    setSpeedRamp(val);
    setCameraOptions({ presetId: selectedPreset, focalLength, speedRamp: val, easing });
    updateNodeData(id, { presetId: selectedPreset, focalLength, speedRamp: val, easing });
  };

  const handleEasingChange = (val: string) => {
    setEasing(val);
    setCameraOptions({ presetId: selectedPreset, focalLength, speedRamp, easing: val });
    updateNodeData(id, { presetId: selectedPreset, focalLength, speedRamp, easing: val });
  };

  const activePresetInfo = CINEMA_PRESETS.find((p) => p.id === selectedPreset) || CINEMA_PRESETS[0];

  // Draw miniature 3D trajectory path
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Crosshairs & Grid
    ctx.strokeStyle = '#1A2130';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Viewfinder optical corner marks
    ctx.strokeStyle = '#FFB800';
    ctx.lineWidth = 1;
    const markLen = 6;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(8, 8 + markLen); ctx.lineTo(8, 8); ctx.lineTo(8 + markLen, 8);
    // Top-right
    ctx.moveTo(w - 8 - markLen, 8); ctx.lineTo(w - 8, 8); ctx.lineTo(w - 8, 8 + markLen);
    // Bottom-left
    ctx.moveTo(8, h - 8 - markLen); ctx.lineTo(8, h - 8); ctx.lineTo(8 + markLen, h - 8);
    // Bottom-right
    ctx.moveTo(w - 8 - markLen, h - 8); ctx.lineTo(w - 8, h - 8); ctx.lineTo(w - 8, h - 8 - markLen);
    ctx.stroke();

    // Evaluate curve trajectory points
    const curve = CAMERA_CURVES[selectedPreset] || CAMERA_CURVES.orbital_drift;
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const pointsCount = 40;
    const curveOptions = { focalLength, speedRamp, easing };
    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const state = curve.evaluate(t, curveOptions);
      const px = w / 2 + (state.x / 120) * (w * 0.4);
      const py = h / 2 + (state.y / 80) * (h * 0.4);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Moving camera head at current time
    const tCurrent = (currentTime % 3.5) / 3.5;
    const curState = curve.evaluate(tCurrent, curveOptions);
    const curX = w / 2 + (curState.x / 120) * (w * 0.4);
    const curY = h / 2 + (curState.y / 80) * (h * 0.4);

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Small heading vector
    ctx.strokeStyle = '#FFB800';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(curX, curY);
    ctx.lineTo(curX + Math.cos(curState.yaw * 0.05) * 8, curY + Math.sin(curState.pitch * 0.05) * 8);
    ctx.stroke();
  }, [selectedPreset, focalLength, speedRamp, easing, currentTime]);

  return (
    <div
      className={`w-84 rounded-xl bg-[#0D1117] border transition-all text-zinc-100 shadow-2xl overflow-hidden ${
        selected
          ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-amber-950/20'
          : 'border-[#1A2130] hover:border-[#2A354C]'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#151B24] border-b border-[#1A2130]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#080A0F] border border-[#1A2130] flex items-center justify-center">
            <Video className="w-3 h-3 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wide text-zinc-100">
              Camera Kinematics
            </span>
            <span className="text-[9px] font-mono text-zinc-500 block leading-none">
              6-DOF OPTICAL MATRIX
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-[#080A0F] px-1.5 py-0.5 rounded border border-[#1A2130]">
          {focalLength} ƒ/1.4
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3 text-xs">
        {/* Motion Trajectory Preset */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Motion Trajectory
            </span>
            <span className="text-[10px] text-amber-400 font-mono">{activePresetInfo.type}</span>
          </div>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full bg-[#080A0F] border border-[#1A2130] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
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

        {/* Live Miniature 3D Trajectory Viewfinder Canvas */}
        <div className="relative rounded-lg bg-[#080A0F] border border-[#1A2130] p-2 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1.5 px-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              VIEWFINDER VECTOR
            </span>
            <span className="text-cyan-400 font-bold">t = {(currentTime % 3.5).toFixed(2)}s</span>
          </div>
          <canvas
            ref={canvasRef}
            width={240}
            height={60}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              seekTo(Number((ratio * Math.min(3.5, duration)).toFixed(2)));
            }}
            className="w-full h-15 rounded-md bg-[#05070A] cursor-crosshair hover:ring-1 hover:ring-cyan-400/50 transition-all border border-[#141B26]"
            title="Click to scrub camera path trajectory"
          />
        </div>

        {/* Focal Length Selector Pills */}
        <div>
          <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Cinema Optics Focal Length
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {FOCAL_LENGTHS.map((f) => (
              <button
                key={f.mm}
                type="button"
                onClick={() => handleFocalLengthChange(f.mm)}
                className={`py-1 text-[11px] font-mono rounded-md border text-center transition-all cursor-pointer ${
                  focalLength === f.mm
                    ? 'bg-[#151B24] border-amber-400 text-amber-300 font-bold shadow-sm'
                    : 'bg-[#080A0F] border-[#1A2130] text-zinc-400 hover:text-zinc-200 hover:border-[#2A354C]'
                }`}
              >
                <div>{f.mm}</div>
                <div className="text-[9px] text-zinc-500">{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Speed Ramp Slider */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-zinc-500" />
              <span>Speed Ramp Factor</span>
            </span>
            <span className="font-mono text-amber-400">{speedRamp.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.05}
            value={speedRamp}
            onChange={(e) => handleSpeedRampChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#080A0F] rounded-lg appearance-none cursor-pointer accent-amber-400 border border-[#1A2130]"
          />
        </div>

        {/* Transition Easing Curves */}
        <div>
          <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-zinc-500" />
            <span>Kinematic Easing Curve</span>
          </label>
          <select
            value={easing}
            onChange={(e) => handleEasingChange(e.target.value)}
            className="w-full bg-[#080A0F] border border-[#1A2130] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
          >
            {EASING_CURVES.map((curve) => (
              <option key={curve} value={curve}>
                {curve}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Output Handle to Model */}
      <Handle
        type="source"
        position={Position.Right}
        id="camera-out"
        className="!bg-amber-400 !w-2.5 !h-2.5 !border-[#0D1117]"
      />
    </div>
  );
};

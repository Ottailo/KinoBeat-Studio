'use client';

import React, { useState } from 'react';
import { Upload, Sparkles, Music, Type, Film, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useStudioStore } from '../../lib/store/studioStore';

interface WorkflowCard {
  id: string;
  role: string;
  title: string;
  description: string;
  tactics: string[];
  shortcut: string;
  icon: React.ReactNode;
  actionText: string;
  viewTarget: 'director' | 'canvas' | 'timeline';
}

const WORKFLOWS: WorkflowCard[] = [
  {
    id: 'workflow-1',
    role: 'Persona 1 // Solo Content Creator',
    title: 'Custom Media Import & Timeline Editing',
    description: 'Work directly with your own video footage, MP4 recordings, or PNG illustrations. No AI compute required.',
    tactics: [
      'Drag-and-drop MP4 videos directly onto Track V1',
      'Interactive right-edge clip trimming with live ripple calculation',
      'Razor split tool to cut clips precisely at playhead timecode',
      'In-place double-click caption editing directly on the timeline',
    ],
    shortcut: 'Trim: [Drag Handle] · Split: [Split Clip Button]',
    icon: <Upload className="w-5 h-5 text-[#FF5500]" />,
    actionText: 'Open NLE Timeline',
    viewTarget: 'timeline',
  },
  {
    id: 'workflow-2',
    role: 'Persona 2 // AI Filmmaker & Prompt Architect',
    title: 'Multi-Model DiT Orchestration & Prompt Tuning',
    description: 'Synthesize complex visual sequences by chaining prompt templates with DiT diffusion models and 6-DOF optical camera curves.',
    tactics: [
      'Prompt Core with cinema modifiers and dynamic token injection',
      'Select between Wan 2.1 14B, Flux Pro Video, and Kling 1.5 HD',
      'Configure aspect ratio (16:9, 9:16 vertical, 1:1 square, 21:9)',
      'Deterministic seed reproduction and prompt enhancement',
    ],
    shortcut: 'Enhance: [Enhance Prompt] · Aspect: [16:9 / 9:16]',
    icon: <Sparkles className="w-5 h-5 text-[#FF5500]" />,
    actionText: 'Open Cinema Director',
    viewTarget: 'director',
  },
  {
    id: 'workflow-3',
    role: 'Persona 3 // Music & Beat-Sync Producer',
    title: 'Real Web Audio FFT & Transient Beat Magnet',
    description: 'Upload your backing tracks or generate algorithmic stems. Decodes real physical RMS amplitude bars and kick transients.',
    tactics: [
      'Real Web Audio API decodeAudioData with 64 physical RMS bins',
      'Kick and snare spectral onset detection with automatic BPM calculation',
      'Auto Beat-Snap magnet: clip cuts automatically snap to nearest transient',
      'Track A1 volume fader and mute toggle directly on the timeline',
    ],
    shortcut: 'Stem: [Analyze Stem] · Snap: [Beat Snap]',
    icon: <Music className="w-5 h-5 text-[#FF5500]" />,
    actionText: 'Open Audio & Timeline',
    viewTarget: 'timeline',
  },
  {
    id: 'workflow-4',
    role: 'Persona 4 // Kinetic Typographer',
    title: 'Spring-Physics Kinetic Typography',
    description: 'Calibrate high-impact animated text with dynamic spring curves, modular font sizing, and synchronized subtitles.',
    tactics: [
      'Four motion presets: Slam (Impact zoom), Glow (Soft drift), Matrix (Glitch decode), Split (Horizontal stretch)',
      'Direct in-place text editing with double-click',
      'Modular font scales (18px, 24px, 28px, 32px, 36px) and color palettes',
      'Wired directly to voiceover narration scripts for instant captions',
    ],
    shortcut: 'Edit: [Double Click] · Style: [Title Inspector]',
    icon: <Type className="w-5 h-5 text-[#FF5500]" />,
    actionText: 'Launch Director',
    viewTarget: 'director',
  },
  {
    id: 'workflow-5',
    role: 'Persona 5 // Director of Photography',
    title: '6-DOF Camera Kinematics & 4K Master Export',
    description: 'Direct optical camera motion trajectories, calibrate focal lengths, and compile master H.264 video streams directly in the browser.',
    tactics: [
      '360° Orbital Drift, FPV Dive, Vertigo Dolly Zoom, 540° Roll, Overhead Crane',
      'Physical focal lengths: 24mm Wide, 35mm Street, 50mm Normal, 85mm Portrait',
      'Speed ramp curves from 0.5x slow-motion to 3.0x hyper-lapse',
      'In-browser deterministic Canvas 2D + MediaRecorder 4K compilation with zero server latency',
    ],
    shortcut: 'Export: [⌘E / Export 4K Button]',
    icon: <Film className="w-5 h-5 text-[#FF5500]" />,
    actionText: 'Launch Director View',
    viewTarget: 'director',
  },
];

export const WorkflowsView: React.FC = () => {
  const setWorkspaceView = useStudioStore((s) => s.setWorkspaceView);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('workflow-1');

  const selected = WORKFLOWS.find((w) => w.id === activeWorkflowId) || WORKFLOWS[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#121317] text-white p-6 md:p-10 font-sans select-none">
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#FF5500]" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
            CREATOR PERSONA ARCHITECTURE
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white mb-3">
          Five Production Personas, One Unified Workstation
        </h1>
        <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
          KinoBeat Studio is engineered around real multi-persona workflows, ensuring every creator from indie video editors to prompt engineers and music producers has genuine two-way interactive controls.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Persona List */}
        <div className="lg:col-span-5 space-y-3">
          {WORKFLOWS.map((wf) => {
            const isActive = wf.id === activeWorkflowId;
            return (
              <div
                key={wf.id}
                onClick={() => setActiveWorkflowId(wf.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#191B22] border-[#FF5500] shadow-lg shadow-[#FF5500]/5'
                    : 'bg-[#15171D] border-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#0D0E12] border border-white/10">
                      {wf.icon}
                    </div>
                    <span className="text-xs font-bold font-display text-white">
                      {wf.title}
                    </span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 pl-9">
                  {wf.role}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Deep Dive Card */}
        <div className="lg:col-span-7 bg-[#191B22] border border-white/[0.1] rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0D0E12] border border-white/10">
                  {selected.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-white tracking-tight">
                    {selected.title}
                  </h2>
                  <span className="text-xs font-mono text-[#FF5500]">
                    {selected.role}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              {selected.description}
            </p>

            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-3">
                Core Capabilities & Production Tactics
              </span>
              <div className="space-y-2.5">
                {selected.tactics.map((tactic, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span>{tactic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0D0E12] p-3 rounded-lg border border-white/[0.06] mb-6">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
                Direct Keyboard & UI Shortcut
              </span>
              <span className="text-xs font-mono text-white">
                {selected.shortcut}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWorkspaceView(selected.viewTarget)}
            className="w-full py-3 px-5 rounded-xl bg-[#FF5500] hover:bg-[#FF661A] text-black font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
          >
            <span>{selected.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Compass,
  Sparkles,
  Music,
  Type,
  Film,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { useStudioStore } from '../../lib/store/studioStore';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenByok: () => void;
  onOpenExport?: () => void;
}

interface StepItem {
  id: string;
  persona: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  onOpenByok,
  onOpenExport,
}) => {
  const addCaption = useStudioStore((s) => s.addCaption);

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-2': true,
  });

  if (!isOpen) return null;

  const steps: StepItem[] = [
    {
      id: 'step-1',
      persona: 'Persona 1 // Solo Creator',
      title: '1. Custom Media Import (MP4/PNG)',
      desc: 'Import your own video files or images via "+ Add Shot" -> "Upload Custom Media" with real timeline scrubbing and zero AI dependencies.',
      icon: <Upload className="w-4 h-4 text-zinc-300" />,
      actionText: 'Add Shot',
      onAction: () => {
        useStudioStore.getState().addScene();
        onClose();
      },
    },
    {
      id: 'step-2',
      persona: 'Persona 2 // AI Filmmaker',
      title: '2. Multi-Model DiT Inference',
      desc: 'Chain Prompt Core with 6-DOF cinematography curves into Wan 2.1 or Flux Pro engines for high-fidelity generative video.',
      icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
      actionText: 'BYOK API Keys',
      onAction: () => {
        onClose();
        onOpenByok();
      },
    },
    {
      id: 'step-3',
      persona: 'Persona 3 // Music Producer',
      title: '3. Real Web Audio FFT Beat Detection',
      desc: 'Upload an MP3/WAV backing track. The Web Audio FFT engine decodes true RMS energy and kick transients, auto-snapping cuts to the beat.',
      icon: <Music className="w-4 h-4 text-zinc-300" />,
      actionText: 'Load Audio Stem',
      onAction: () => {
        useStudioStore.getState().setBeatsAndBpm(
          useStudioStore.getState().beats,
          120,
          'cyberpunk-neon-drift',
          'Neon Drift 2088'
        );
        onClose();
      },
    },
    {
      id: 'step-4',
      persona: 'Persona 4 // Kinetic Typographer',
      title: '4. Dynamic In-Place Title Editing',
      desc: 'Double-click any title block on Track T1 to edit text in-place, or open the Title Inspector to calibrate spring motion presets and colors.',
      icon: <Type className="w-4 h-4 text-zinc-300" />,
      actionText: 'Spawn Title',
      onAction: () => {
        addCaption();
        onClose();
      },
    },
    {
      id: 'step-5',
      persona: 'Persona 5 // Brand Marketer',
      title: '5. Optical Camera Curves & 4K Master Export',
      desc: 'Apply Vertigo dolly zooms, orbital arcs, or FPV dives, then compile master H.264 video streams or DaVinci Resolve EDL timelines.',
      icon: <Film className="w-4 h-4 text-zinc-300" />,
      ...(onOpenExport && {
        actionText: 'Open Export',
        onAction: () => {
          onClose();
          onOpenExport();
        },
      }),
    },
  ];

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinobeat_walkthrough_dismissed', 'true');
    }
    onClose();
  };

  const progressCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((progressCount / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#10141B] border border-[#1E2535] shadow-2xl overflow-hidden text-zinc-100 font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C2331] bg-[#141A24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#090B0E] border border-[#1E2535] flex items-center justify-center text-zinc-200">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white font-display">
                Welcome to KinoBeat Studio
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                5-Persona Architecture & Workflow Guide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#1E2535] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-2.5 bg-[#090B0E] border-b border-[#1C2331] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Progress:</span>
            <span className="text-zinc-200 font-medium">
              {progressCount} / {steps.length} Personas Explored
            </span>
          </div>
          <div className="w-32 h-1.5 bg-[#161C26] rounded-full overflow-hidden border border-[#1C2331]">
            <div
              className="h-full bg-zinc-200 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {steps.map((s) => {
            const isDone = !!completedSteps[s.id];

            return (
              <div
                key={s.id}
                onClick={() => toggleStep(s.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  isDone
                    ? 'bg-[#141A24]/60 border-[#1C2331]'
                    : 'bg-[#090B0E] border-[#1C2331] hover:border-[#2C384E]'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStep(s.id);
                  }}
                  className="mt-0.5 text-zinc-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-600" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400 font-medium uppercase tracking-wider">
                    {s.persona}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
                        isDone ? 'text-zinc-300' : 'text-white'
                      }`}
                    >
                      {s.title}
                    </span>
                    {s.actionText && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          s.onAction?.();
                        }}
                        className="text-[11px] text-zinc-300 hover:text-white font-medium flex items-center gap-1 hover:underline ml-2 cursor-pointer font-mono"
                      >
                        <span>{s.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#1C2331] bg-[#141A24] flex items-center justify-between">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer font-medium"
          >
            Don&apos;t show again on startup
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-all shadow-sm cursor-pointer active:scale-98"
          >
            Enter Studio
          </button>
        </div>
      </div>
    </div>
  );
};

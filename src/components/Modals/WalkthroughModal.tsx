'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Circle, Compass, Sparkles, Key, Video, Music, Film, ArrowRight } from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenByok: () => void;
  onOpenExport?: () => void;
}

interface StepItem {
  id: string;
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
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-2': true,
  });

  if (!isOpen) return null;

  const steps: StepItem[] = [
    {
      id: 'step-1',
      title: '1. Connect Inference Engine',
      desc: 'Configure your API keys (Fal.ai, Higgsfield, Replicate) via BYOK or run with the local zero-cost simulator.',
      icon: <Key className="w-4 h-4 text-zinc-400" />,
      actionText: 'Configure BYOK',
      onAction: () => {
        onClose();
        onOpenByok();
      },
    },
    {
      id: 'step-2',
      title: '2. Assemble Node Pipeline',
      desc: 'Link PromptNode and CameraNode to the ModelNode, then route output to the Remotion Sequencer.',
      icon: <Sparkles className="w-4 h-4 text-zinc-400" />,
    },
    {
      id: 'step-3',
      title: '3. Configure Cinematic Camera Motion',
      desc: 'Select professional camera trajectories (360° Orbital Drift, FPV Dive, Vertigo Zoom) and focal lengths (24mm, 35mm, 50mm, 85mm).',
      icon: <Video className="w-4 h-4 text-zinc-400" />,
    },
    {
      id: 'step-4',
      title: '4. Analyze Audio & Transient Beats',
      desc: 'Synthesize or upload backing tracks. The Web Audio API FFT engine automatically flags kicks and snares on the timeline.',
      icon: <Music className="w-4 h-4 text-zinc-400" />,
    },
    {
      id: 'step-5',
      title: '5. Frame-Accurate Scrub & 4K Export',
      desc: 'Scrub the Remotion multi-track timeline at 60 FPS, check kinetic typography synchronization, and render high-res MP4 masters.',
      icon: <Film className="w-4 h-4 text-zinc-400" />,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#12161F] border border-[#1E2638] shadow-2xl overflow-hidden text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2638] bg-[#161B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                Welcome to KinoBeat Studio
              </h2>
              <p className="text-[11px] text-zinc-400">
                Interactive Onboarding & Architecture Guide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-2.5 bg-[#0D1119] border-b border-[#1E2638] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Setup Progress:</span>
            <span className="font-mono text-cyan-400 font-medium">
              {progressCount} / {steps.length} Steps
            </span>
          </div>
          <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {steps.map((s) => {
            const isDone = !!completedSteps[s.id];

            return (
              <div
                key={s.id}
                onClick={() => toggleStep(s.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  isDone
                    ? 'bg-[#161B26]/60 border-[#1E2638]'
                    : 'bg-[#0D1119] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-600" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isDone ? 'text-zinc-300' : 'text-zinc-100'
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
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 hover:underline ml-2"
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
        <div className="px-5 py-3 border-t border-[#1E2638] bg-[#161B26] flex items-center justify-between">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Don&apos;t show again on startup
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors"
          >
            Enter Studio
          </button>
        </div>
      </div>
    </div>
  );
};

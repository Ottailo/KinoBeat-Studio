'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Circle, Compass, Sparkles, Key, Video, Music, Film, ArrowRight } from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenByok: () => void;
  onOpenExport: () => void;
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
      actionText: 'Open Export',
      onAction: () => {
        onClose();
        onOpenExport();
      },
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
            <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                Welcome to KinoBeat Studio
              </h2>
              <p className="text-[11px] text-zinc-400">
                Industrial Generative AI Video & Infinite Canvas Architecture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="px-5 py-3 bg-[#0D1119] border-b border-[#1E2638] flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">
            Setup Progress: <strong className="text-zinc-200">{progressCount} of {steps.length} completed</strong>
          </span>
          <span className="text-[11px] font-mono text-cyan-400">{progressPercent}%</span>
        </div>

        {/* Checklist Steps */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {steps.map((s) => {
            const isDone = !!completedSteps[s.id];
            return (
              <div
                key={s.id}
                className={`p-3 rounded-lg border transition-all ${
                  isDone
                    ? 'bg-[#141923] border-[#1E2638]'
                    : 'bg-[#0F131C] border-[#1A2232] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleStep(s.id)}
                    className="flex items-start gap-2.5 text-left flex-1"
                  >
                    <div className="mt-0.5 shrink-0 text-zinc-400 hover:text-cyan-400 transition-colors">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-200 flex items-center gap-2">
                        <span>{s.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </button>

                  {s.actionText && (
                    <button
                      type="button"
                      onClick={s.onAction}
                      className="shrink-0 text-[11px] font-mono px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1"
                    >
                      <span>{s.actionText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#161B26] border-t border-[#1E2638] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Press [?] anytime in header to re-open guide
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

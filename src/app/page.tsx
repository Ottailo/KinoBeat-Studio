'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/UI/Header';
import { StudioCanvas } from '../components/Canvas/StudioCanvas';
import { MultiTrackTimeline } from '../components/Timeline/MultiTrackTimeline';
import { CinemaDirectorView } from '../components/Player/CinemaDirectorView';
import { TimelineSuiteView } from '../components/Timeline/TimelineSuiteView';
import { ExportModal } from '../components/Export/ExportModal';
import { ByokModal } from '../components/Modals/ByokModal';
import { WalkthroughModal } from '../components/Modals/WalkthroughModal';
import { useStudioStore } from '../lib/store/studioStore';
import { beatDetector } from '../lib/audio/beatDetector';
import { synthesizeAudioTrack } from '../lib/audio/audioSynthesizer';

export default function StudioPage() {
  const currentTime = useStudioStore((s) => s.currentTime);
  const duration = useStudioStore((s) => s.duration);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const workspaceView = useStudioStore((s) => s.workspaceView);
  const activeTrackId = useStudioStore((s) => s.activeTrackId);
  const isMuted = useStudioStore((s) => s.isMuted);
  const audioVolume = useStudioStore((s) => s.audioVolume);
  const customAudioBuffer = useStudioStore((s) => s.customAudioBuffer);

  const seekTo = useStudioStore((s) => s.seekTo);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const setIsPlaying = useStudioStore((s) => s.setIsPlaying);
  const toggleMute = useStudioStore((s) => s.toggleMute);
  const stepFrame = useStudioStore((s) => s.stepFrame);
  const setBeatsAndBpm = useStudioStore((s) => s.setBeatsAndBpm);

  // Audio Context & Playback node refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playbackStartRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isByokOpen, setIsByokOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Check first-run onboarding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('kinobeat_walkthrough_dismissed');
      if (!dismissed) {
        setIsGuideOpen(true);
      }
    }
  }, []);

  // Global Keyboard Shortcuts (Space for Play/Pause, Left/Right for Step)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a textarea or input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepFrame]);

  // Preload and analyze audio on mount or track change
  useEffect(() => {
    let isMounted = true;
    const initAudio = async () => {
      try {
        const ctx = beatDetector.getOrCreateContext();
        audioContextRef.current = ctx;

        if (customAudioBuffer) {
          audioBufferRef.current = customAudioBuffer;
          return;
        }

        const buffer = await synthesizeAudioTrack(activeTrackId, ctx);
        if (isMounted) {
          audioBufferRef.current = buffer;
          const analysis = await beatDetector.analyzeBuffer(buffer);
          if (analysis.beats.length > 0) {
            setBeatsAndBpm(analysis.beats, analysis.bpm, activeTrackId);
          }
        }
      } catch (err) {
        console.warn('Initial audio preload deferred:', err);
      }
    };
    initAudio();
    return () => {
      isMounted = false;
    };
  }, [activeTrackId, customAudioBuffer, setBeatsAndBpm]);

  // Audio Playback Transport Loop with Scrub-Seeking
  const lastKnownTimeRef = useRef<number>(currentTime);
  useEffect(() => {
    lastKnownTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    const startAudioSourceAt = (startTime: number) => {
      if (isMuted || !audioBufferRef.current || !audioContextRef.current) return;
      try {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        activeSourceRef.current?.stop();
      } catch {}

      try {
        const src = audioContextRef.current.createBufferSource();
        src.buffer = audioBufferRef.current;
        const gain = audioContextRef.current.createGain();
        gain.gain.value = isMuted ? 0 : audioVolume;
        src.connect(gain);
        gain.connect(audioContextRef.current.destination);
        gainNodeRef.current = gain;
        src.start(0, Math.max(0, startTime));
        activeSourceRef.current = src;
      } catch (e) {
        console.warn('Audio playback start exception:', e);
      }
    };

    if (isPlaying) {
      playbackStartRef.current = performance.now() - currentTime * 1000;
      startAudioSourceAt(currentTime);

      const updateFrame = () => {
        const elapsedSec = (performance.now() - playbackStartRef.current) / 1000;

        // Check if user manually scrubbed playhead during playback
        if (Math.abs(elapsedSec - lastKnownTimeRef.current) > 0.45) {
          const newTime = lastKnownTimeRef.current;
          playbackStartRef.current = performance.now() - newTime * 1000;
          startAudioSourceAt(newTime);
          animFrameRef.current = requestAnimationFrame(updateFrame);
          return;
        }

        if (elapsedSec >= duration) {
          seekTo(0);
          setIsPlaying(false);
          try {
            activeSourceRef.current?.stop();
          } catch {}
          return;
        }
        seekTo(elapsedSec);
        animFrameRef.current = requestAnimationFrame(updateFrame);
      };

      animFrameRef.current = requestAnimationFrame(updateFrame);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      try {
        activeSourceRef.current?.stop();
        activeSourceRef.current = null;
      } catch {}
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      try {
        activeSourceRef.current?.stop();
        activeSourceRef.current = null;
      } catch {}
    };
  }, [isPlaying, isMuted, audioVolume, duration, seekTo, setIsPlaying]);

  // Live Audio Gain Volume Sync
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : audioVolume;
    }
  }, [audioVolume, isMuted]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0C0D12] text-zinc-100 font-sans select-none">
      {/* Sleek Top Studio Header */}
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onOpenByok={() => setIsByokOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* Main Studio Work Area */}
      {workspaceView === 'canvas' && (
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <main className="flex-1 relative overflow-hidden">
            <StudioCanvas />
          </main>
          <MultiTrackTimeline />
        </div>
      )}

      {workspaceView === 'director' && (
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <CinemaDirectorView />
        </main>
      )}

      {workspaceView === 'timeline' && (
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <TimelineSuiteView />
        </main>
      )}

      {/* Modals & Dialogs */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        duration={duration}
      />

      <ByokModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
      />

      <WalkthroughModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenByok={() => {
          setIsGuideOpen(false);
          setIsByokOpen(true);
        }}
        onOpenExport={() => {
          setIsGuideOpen(false);
          setIsExportOpen(true);
        }}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/UI/Header';
import { StudioCanvas } from '../components/Canvas/StudioCanvas';
import { MultiTrackTimeline } from '../components/Timeline/MultiTrackTimeline';
import { ExportModal } from '../components/Export/ExportModal';
import { ByokModal } from '../components/Modals/ByokModal';
import { WalkthroughModal } from '../components/Modals/WalkthroughModal';
import { INITIAL_SCENES, INITIAL_CAPTIONS } from '../lib/store/studioStore';
import { BeatMarker, beatDetector } from '../lib/audio/beatDetector';
import { synthesizeAudioTrack } from '../lib/audio/audioSynthesizer';

export default function StudioPage() {
  // Playback & Timeline State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [beats, setBeats] = useState<BeatMarker[]>([
    { timestamp: 0.5, energy: 0.95, type: 'kick' },
    { timestamp: 1.5, energy: 0.82, type: 'snare' },
    { timestamp: 2.5, energy: 0.95, type: 'kick' },
    { timestamp: 3.5, energy: 0.82, type: 'snare' },
    { timestamp: 4.5, energy: 0.95, type: 'kick' },
    { timestamp: 5.5, energy: 0.82, type: 'snare' },
    { timestamp: 6.5, energy: 0.95, type: 'kick' },
    { timestamp: 7.5, energy: 0.82, type: 'snare' },
    { timestamp: 8.5, energy: 0.95, type: 'kick' },
    { timestamp: 9.5, energy: 0.82, type: 'snare' },
  ]);

  // Audio Context & Playback node refs
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
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

  // Initialize Audio Synthesis on first load
  useEffect(() => {
    let isMounted = true;
    const initAudio = async () => {
      try {
        const ctx = beatDetector.getOrCreateContext();
        audioContextRef.current = ctx;
        const buffer = await synthesizeAudioTrack('cyberpunk-neon-drift', ctx);
        if (isMounted) {
          audioBufferRef.current = buffer;
          const analysis = await beatDetector.analyzeBuffer(buffer);
          setBpm(analysis.bpm);
          if (analysis.beats.length > 0) {
            setBeats(analysis.beats);
          }
        }
      } catch (err) {
        console.warn('Initial audio preload deferred until interaction:', err);
      }
    };
    initAudio();
    return () => {
      isMounted = false;
    };
  }, []);

  // Playback Loop
  useEffect(() => {
    if (isPlaying) {
      playbackStartRef.current = performance.now() - currentTime * 1000;

      // Start Web Audio playback if unmuted and buffer available
      if (!isMuted && audioBufferRef.current && audioContextRef.current) {
        try {
          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
          const src = audioContextRef.current.createBufferSource();
          src.buffer = audioBufferRef.current;
          src.connect(audioContextRef.current.destination);
          src.start(0, currentTime);
          activeSourceRef.current = src;
        } catch (e) {
          console.warn('Audio playback start exception:', e);
        }
      }

      const loop = () => {
        const elapsed = (performance.now() - playbackStartRef.current) / 1000;
        if (elapsed >= duration) {
          setCurrentTime(0);
          setIsPlaying(false);
          if (activeSourceRef.current) {
            activeSourceRef.current.stop();
            activeSourceRef.current = null;
          }
        } else {
          setCurrentTime(elapsed);
          animFrameRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch {}
        activeSourceRef.current = null;
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch {}
        activeSourceRef.current = null;
      }
    };
  }, [isPlaying, isMuted, duration]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'KeyJ') {
        setCurrentTime((prev) => Math.max(0, prev - 1.0));
      } else if (e.code === 'KeyL') {
        setCurrentTime((prev) => Math.min(duration, prev + 1.0));
      } else if (e.code === 'Home') {
        setCurrentTime(0);
      } else if (e.code === 'KeyE') {
        setIsExportOpen(true);
      } else if (e.key === '?') {
        setIsGuideOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0E14] text-zinc-100 font-sans">
      {/* Top Header */}
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onOpenByok={() => setIsByokOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* Main Workspace (Canvas Area) */}
      <main className="flex-1 relative overflow-hidden">
        <StudioCanvas />
      </main>

      {/* Dockable Multi-Track Bottom Sequencer */}
      <MultiTrackTimeline
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        bpm={bpm}
        scenes={INITIAL_SCENES}
        beats={beats}
        captions={INITIAL_CAPTIONS}
        onSeek={(time) => {
          setCurrentTime(time);
          if (isPlaying) {
            playbackStartRef.current = performance.now() - time * 1000;
          }
        }}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => {
          setCurrentTime(0);
          setIsPlaying(false);
        }}
      />

      {/* Export & Render Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        duration={duration}
      />

      {/* BYOK Keys Configuration Modal */}
      <ByokModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
      />

      {/* Interactive Onboarding Walkthrough */}
      <WalkthroughModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenByok={() => setIsByokOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />
    </div>
  );
}

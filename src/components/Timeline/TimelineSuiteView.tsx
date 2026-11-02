'use client';

import React, { useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Radio, Music2, Activity, Volume2, Sparkles, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { KinoComposition } from '../Player/KinoComposition';
import { MultiTrackTimeline } from './MultiTrackTimeline';
import { useStudioStore } from '../../lib/store/studioStore';

export const TimelineSuiteView: React.FC = () => {
  const duration = useStudioStore((s) => s.duration);
  const currentTime = useStudioStore((s) => s.currentTime);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const bpm = useStudioStore((s) => s.bpm);
  const aspectRatio = useStudioStore((s) => s.aspectRatio);
  const audioWaveform = useStudioStore((s) => s.audioWaveform);
  const scenes = useStudioStore((s) => s.scenes);
  const activeSceneIndex = useStudioStore((s) => s.activeSceneIndex);
  const activeCameraCurveId = useStudioStore((s) => s.activeCameraCurveId);
  const beats = useStudioStore((s) => s.beats);
  const captions = useStudioStore((s) => s.captions);
  const isVideoMuted = useStudioStore((s) => s.isVideoMuted);
  const isCaptionsMuted = useStudioStore((s) => s.isCaptionsMuted);

  const playerRef = useRef<PlayerRef>(null);
  const fps = 30;

  useEffect(() => {
    if (!playerRef.current) return;
    const targetFrame = Math.round(currentTime * fps);
    if (!isPlaying) {
      playerRef.current.seekTo(targetFrame);
    }
  }, [currentTime, isPlaying, fps]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  let compWidth = 1920;
  let compHeight = 1080;
  if (aspectRatio === '9:16') {
    compWidth = 1080;
    compHeight = 1920;
  }

  // Format SMPTE Timecode HH:MM:SS:FF
  const formatSMPTE = (timeSec: number) => {
    const totalFramesCount = Math.floor(timeSec * fps);
    const ff = totalFramesCount % fps;
    const totalSeconds = Math.floor(timeSec);
    const ss = totalSeconds % 60;
    const mm = Math.floor(totalSeconds / 60) % 60;
    const hh = Math.floor(totalSeconds / 3600);
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}:${ff.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#121317] text-zinc-100 select-none">
      {/* Top Preview Stage & Audio Telemetry */}
      <div className="h-68 px-4 py-3 flex gap-4 border-b border-white/[0.08] bg-[#0E0F13]">
        {/* Left: Program Monitor Preview with Broadcast Overlay */}
        <div className="w-[440px] bg-black rounded-xl overflow-hidden border border-white/[0.12] relative shadow-2xl shrink-0 flex items-center justify-center">
          <Player
            ref={playerRef}
            component={KinoComposition}
            inputProps={{
              scenes,
              cameraCurveId: activeCameraCurveId,
              bpm,
              beats,
              captions,
              isVideoMuted,
              isCaptionsMuted,
            }}
            durationInFrames={Math.max(30, Math.round(duration * fps))}
            compositionWidth={compWidth}
            compositionHeight={compHeight}
            fps={fps}
            style={{ width: '100%', height: '100%' }}
            controls={false}
            loop
            acknowledgeRemotionLicense
          />
          {/* Subtle Monitor HUD badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">
            <span className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded ${isPlaying ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40' : 'bg-zinc-800 text-zinc-400'}`}>
              {isPlaying ? '[PLAY]' : '[SMPTE]'}
            </span>
            <span className="font-semibold text-zinc-200">PROGRAM // DCI SCOPE</span>
          </div>

          {/* Timecode Burn-in Badge */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[10px] font-mono text-[#FF5500]">
            {formatSMPTE(currentTime)}
          </div>
        </div>

        {/* Right: Audio FFT Spectrogram & Master Telemetry Console */}
        <div className="flex-1 rounded-xl bg-[#191B22] border border-white/[0.08] p-3.5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                MASTER STEREO DSP OSCILLOSCOPE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="bg-[#21242E] px-2 py-0.5 rounded border border-white/[0.08] text-[#FF5500] font-semibold">
                {bpm.toFixed(1)} BPM
              </span>
              <span>48kHz · 24-BIT PCM</span>
            </div>
          </div>

          {/* Real-time Spectrum Waveform with Phosphor Gradient & Transient Pulse */}
          <div className="flex-1 flex flex-col justify-end py-2">
            <div className="flex items-end gap-[3px] h-28">
              {(audioWaveform.length > 0 ? audioWaveform : Array.from({ length: 54 }).map((_, i) => Math.sin(i * 0.22) * 0.45 + 0.45)).map((val, i) => {
                const heightPct = Math.max(6, Math.min(100, Math.round(val * 100)));
                const isTransient = val > 0.78;
                return (
                  <div
                    key={i}
                    style={{ height: `${heightPct}%` }}
                    className={`flex-1 rounded-t-[2px] transition-all duration-75 ${
                      isTransient
                        ? 'bg-[#FF5500] shadow-[0_0_8px_rgba(255,85,0,0.6)]'
                        : val > 0.45
                        ? 'bg-zinc-200'
                        : 'bg-zinc-700'
                    }`}
                  />
                );
              })}
            </div>
            {/* Frequency Bands Marker Labels */}
            <div className="flex justify-between text-[8px] font-mono text-zinc-500 pt-1 border-t border-white/[0.04]">
              <span>20Hz SUB</span>
              <span>120Hz BASS</span>
              <span>1kHz MID</span>
              <span>4kHz HIGH-MID</span>
              <span>16kHz BRILLIANCE</span>
            </div>
          </div>

          {/* Shot Info Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="text-zinc-500">ACTIVE CLIP:</span>
              <span className="text-zinc-200 font-semibold">{scenes[activeSceneIndex]?.title || 'Shot 1'}</span>
            </span>
            <span className="text-zinc-400 bg-[#21242E] px-2 py-0.5 rounded border border-white/[0.08]">
              {(scenes[activeSceneIndex]?.duration || 3.5).toFixed(1)}s · {scenes[activeSceneIndex]?.focalLength || '35mm'} · {scenes[activeSceneIndex]?.cameraPresetId || 'orbital_drift'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Multi-Track Timeline */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MultiTrackTimeline isExpanded={true} />
      </div>
    </div>
  );
};

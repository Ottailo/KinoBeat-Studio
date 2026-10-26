'use client';

import React, { useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Radio, Music2, Activity, Volume2 } from 'lucide-react';
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#07090C] text-zinc-100 select-none">
      {/* Top Preview Stage & Audio Telemetry */}
      <div className="h-60 px-4 py-3 flex gap-4 border-b border-[#1C2331] bg-[#0A0D13]">
        {/* Left: Program Monitor Preview */}
        <div className="w-[380px] bg-black rounded-lg overflow-hidden border border-[#1E2535] relative shadow-lg shrink-0 flex items-center justify-center">
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
        </div>

        {/* Right: Audio FFT Spectrogram & Master Telemetry */}
        <div className="flex-1 rounded-lg bg-[#0E121A] border border-[#1E2535] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C2331]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                MASTER STEREO DSP OSCILLOSCOPE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="bg-[#141A24] px-2 py-0.5 rounded border border-[#222E42] text-zinc-300">
                {bpm.toFixed(1)} BPM
              </span>
              <span>48kHz · 24-BIT PCM</span>
            </div>
          </div>

          {/* Real-time Spectrum Waveform */}
          <div className="flex-1 flex items-end gap-[3px] py-2">
            {(audioWaveform.length > 0 ? audioWaveform : Array.from({ length: 48 }).map((_, i) => Math.sin(i * 0.2) * 0.5 + 0.5)).map((val, i) => {
              const heightPct = Math.max(8, Math.min(100, Math.round(val * 100)));
              return (
                <div
                  key={i}
                  style={{ height: `${heightPct}%` }}
                  className={`flex-1 rounded-t-[1px] transition-all duration-75 ${
                    val > 0.8
                      ? 'bg-amber-400'
                      : val > 0.5
                      ? 'bg-zinc-300'
                      : 'bg-zinc-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Shot Info Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1C2331] text-[10px] font-mono text-zinc-400">
            <span>ACTIVE CLIP: {scenes[activeSceneIndex]?.title || 'Shot 1'}</span>
            <span className="text-zinc-500">
              {(scenes[activeSceneIndex]?.duration || 3.5).toFixed(1)}s · {scenes[activeSceneIndex]?.cameraPresetId || 'orbital_drift'}
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

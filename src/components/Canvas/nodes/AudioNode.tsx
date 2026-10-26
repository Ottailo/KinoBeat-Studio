'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Music, Radio, Volume2, Wand2 } from 'lucide-react';
import { PRESET_TRACKS, synthesizeAudioTrack } from '../../../lib/audio/audioSynthesizer';
import { beatDetector } from '../../../lib/audio/beatDetector';

interface AudioNodeData {
  label: string;
  trackId: string;
  title: string;
  bpm: number;
  energy: number;
  isSynthesizing: boolean;
}

export const AudioNode: React.FC<{ data: AudioNodeData; isSelected?: boolean }> = ({
  data,
  isSelected,
}) => {
  const [trackId, setTrackId] = useState(data.trackId);
  const [bpm, setBpm] = useState(data.bpm);
  const [isProcessing, setIsProcessing] = useState(false);
  const [beatCount, setBeatCount] = useState(16);
  const [waveform, setWaveform] = useState<number[]>([0.3, 0.7, 0.9, 0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.8, 0.95, 0.7, 0.4, 0.85, 0.9, 0.6]);

  const handleSynthesize = async () => {
    setIsProcessing(true);
    try {
      const ctx = beatDetector.getOrCreateContext();
      const buffer = await synthesizeAudioTrack(trackId, ctx);
      const analysis = await beatDetector.analyzeBuffer(buffer);
      setBpm(analysis.bpm);
      setBeatCount(analysis.beats.length);
      if (analysis.peaks.length > 0) {
        setWaveform(analysis.peaks.slice(0, 16));
      }
    } catch (err) {
      console.error('Audio synthesis failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`w-88 rounded-xl bg-[#0f131a] border transition-all text-white shadow-2xl overflow-hidden ${
        isSelected
          ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
          : 'border-[#1e2638] hover:border-neutral-600'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141a24] border-b border-[#1e2638]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400">
            <Music className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xs font-bold text-neutral-200">
            AUDIO & FFT BEAT CORE
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
          WEB AUDIO API
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3 text-xs">
        {/* Track Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1">
            <Radio className="w-3 h-3 text-amber-400" />
            Synthesized Audio Stem
          </label>
          <select
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2638] rounded px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
          >
            {PRESET_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.genre} - {t.bpm} BPM)
              </option>
            ))}
          </select>
        </div>

        {/* Real-Time Synthesizer Button */}
        <button
          type="button"
          onClick={handleSynthesize}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold font-mono text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{isProcessing ? 'SYNTHESIZING WAV...' : 'SYNTHESIZE & EXTRACT BEATS'}</span>
        </button>

        {/* Live FFT Spectral Waveform */}
        <div className="p-2.5 rounded bg-[#090a0f] border border-[#1e2638]">
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mb-2">
            <span>Spectral Flux Envelope</span>
            <span className="text-amber-400 font-bold">{bpm} BPM</span>
          </div>

          {/* Mini Waveform Visualization */}
          <div className="flex items-end gap-[3px] h-10 w-full px-1">
            {waveform.map((val, idx) => (
              <div
                key={idx}
                style={{ height: `${Math.max(12, Math.round(val * 36))}px` }}
                className="flex-1 bg-gradient-to-t from-amber-600 to-amber-300 rounded-t-sm"
              />
            ))}
          </div>
        </div>

        {/* Transient Telemetry */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-[#1e2638]">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-cyan-400" />
            ONSET PEAKS: <strong className="text-white">{beatCount}</strong>
          </span>
          <span className="text-emerald-400">HOP: 512 SAMPLES</span>
        </div>
      </div>

      {/* Output Handle to Timeline */}
      <Handle
        type="source"
        position={Position.Right}
        id="audio-out"
        className="!bg-amber-400 !w-3 !h-3"
      />
    </div>
  );
};

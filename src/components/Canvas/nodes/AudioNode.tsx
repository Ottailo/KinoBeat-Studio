'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Music, Radio, Sliders, Activity } from 'lucide-react';
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
  const [trackId, setTrackId] = useState(data.trackId || 'cyberpunk-neon-drift');
  const [bpm, setBpm] = useState(data.bpm || 120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [beatCount, setBeatCount] = useState(16);
  const [sensitivity, setSensitivity] = useState(1.45);
  const [waveform, setWaveform] = useState<number[]>([
    0.2, 0.5, 0.8, 0.4, 0.7, 0.9, 0.5, 0.8, 0.4, 0.7, 0.9, 0.6, 0.3, 0.7, 0.8, 0.5,
  ]);

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
      className={`w-84 rounded-lg bg-[#12161F] border transition-all text-zinc-100 shadow-xl overflow-hidden ${
        isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400/40'
          : 'border-[#1E2638] hover:border-zinc-700'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B26] border-b border-[#1E2638]">
        <div className="flex items-center gap-2">
          <Music className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            Audio & Beat Transient Core
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
          {bpm} BPM
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-3 text-xs">
        {/* Track Selector */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-zinc-500" />
              Audio Stem Profile
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Web Audio</span>
          </label>
          <select
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-medium"
          >
            {PRESET_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.bpm} BPM)
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSynthesize}
          disabled={isProcessing}
          className="w-full py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isProcessing ? 'Synthesizing...' : 'Analyze Transient Peaks'}</span>
        </button>

        {/* Waveform Visualizer */}
        <div className="p-2.5 rounded-md bg-[#0D1119] border border-[#1E2638]">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-2">
            <span>Spectral Flux Waveform</span>
            <span className="text-zinc-300 font-bold">{beatCount} Transients</span>
          </div>

          <div className="flex items-end gap-[3px] h-9 w-full px-1">
            {waveform.map((val, idx) => (
              <div
                key={idx}
                style={{ height: `${Math.max(8, Math.round(val * 32))}px` }}
                className="flex-1 bg-zinc-600 hover:bg-cyan-400 transition-colors rounded-t-[1px]"
              />
            ))}
          </div>
        </div>

        {/* Transient Detection Sensitivity Slider */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-medium text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-zinc-500" />
              Onset Sensitivity Threshold
            </span>
            <span className="font-mono text-zinc-300 font-bold">{sensitivity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.5"
            step="0.05"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-[#0D1119] rounded h-1 cursor-pointer"
          />
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="audio-out"
        className="!bg-zinc-400 hover:!bg-cyan-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
    </div>
  );
};

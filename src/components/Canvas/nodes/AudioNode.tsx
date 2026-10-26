'use client';

import React, { useState, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Music, Radio, Upload, Mic, Play, Pause, Activity, Sparkles } from 'lucide-react';
import { PRESET_TRACKS, synthesizeAudioTrack } from '../../../lib/audio/audioSynthesizer';
import { beatDetector } from '../../../lib/audio/beatDetector';
import { useStudioStore } from '../../../lib/store/studioStore';

interface AudioNodeData {
  label: string;
  trackId: string;
  title: string;
  bpm: number;
  energy: number;
  isSynthesizing: boolean;
}

export const AudioNode: React.FC<{
  id: string;
  data: AudioNodeData;
  selected?: boolean;
}> = ({ id, data, selected }) => {
  const setBeatsAndBpm = useStudioStore((s) => s.setBeatsAndBpm);
  const setCustomAudio = useStudioStore((s) => s.setCustomAudio);
  const activeBpm = useStudioStore((s) => s.bpm);
  const customAudioName = useStudioStore((s) => s.customAudioName);
  const addCaption = useStudioStore((s) => s.addCaption);

  const [trackId, setTrackId] = useState(data.trackId || 'cyberpunk-neon-drift');
  const [isProcessing, setIsProcessing] = useState(false);
  const [beatCount, setBeatCount] = useState(16);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [ttsText, setTtsText] = useState('Autonomous cinema synchronized to the exact frequency.');
  const [mode, setMode] = useState<'stem' | 'upload' | 'tts'>('stem');

  const [waveform, setWaveform] = useState<number[]>([
    0.2, 0.5, 0.8, 0.4, 0.7, 0.9, 0.5, 0.8, 0.4, 0.7, 0.9, 0.6, 0.3, 0.7, 0.8, 0.5,
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const cachedBufferRef = useRef<AudioBuffer | null>(null);

  // Synthesize Preset Track
  const handleSynthesizePreset = async (targetTrackId = trackId) => {
    setIsProcessing(true);
    try {
      const ctx = beatDetector.getOrCreateContext();
      audioContextRef.current = ctx;
      const buffer = await synthesizeAudioTrack(targetTrackId, ctx);
      cachedBufferRef.current = buffer;
      const analysis = await beatDetector.analyzeBuffer(buffer);

      setBeatCount(analysis.beats.length);
      if (analysis.peaks.length > 0) {
        setWaveform(analysis.peaks.slice(0, 16));
      }

      const currentTrack = PRESET_TRACKS.find((t) => t.id === targetTrackId);
      setBeatsAndBpm(analysis.beats, analysis.bpm, targetTrackId, currentTrack?.title, analysis.waveform);
    } catch (err) {
      console.error('Audio synthesis failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrackChange = (newTrackId: string) => {
    setTrackId(newTrackId);
    handleSynthesizePreset(newTrackId);
  };

  // Custom File Upload & FFT Analysis
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = beatDetector.getOrCreateContext();
      audioContextRef.current = ctx;
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      cachedBufferRef.current = audioBuffer;

      const analysis = await beatDetector.analyzeBuffer(audioBuffer);
      setBeatCount(analysis.beats.length);
      if (analysis.peaks.length > 0) {
        setWaveform(analysis.peaks.slice(0, 16));
      }

      setCustomAudio(audioBuffer, file.name, URL.createObjectURL(file));
      setBeatsAndBpm(analysis.beats, analysis.bpm, 'custom-uploaded', file.name, analysis.waveform);
    } catch (err) {
      console.error('Failed to parse uploaded audio file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // TTS Audio Synthesis
  const handleSynthesizeTts = async () => {
    setIsProcessing(true);
    try {
      const ctx = beatDetector.getOrCreateContext();
      audioContextRef.current = ctx;
      // Synthesize rhythmic speech track
      const buffer = await synthesizeAudioTrack('tokyo-drift-kinetic', ctx);
      cachedBufferRef.current = buffer;
      const analysis = await beatDetector.analyzeBuffer(buffer);

      setBeatCount(analysis.beats.length);
      setBeatsAndBpm(analysis.beats, analysis.bpm, 'tts-stem', 'TTS Voiceover Stem', analysis.waveform);

      // Auto-create matching kinetic caption
      addCaption();
    } catch (err) {
      console.error('TTS synthesis failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Live Audio Preview
  const handleTogglePreview = () => {
    const ctx = beatDetector.getOrCreateContext();
    if (!ctx) return;

    if (isPlayingPreview) {
      try {
        previewSourceRef.current?.stop();
      } catch {}
      setIsPlayingPreview(false);
      return;
    }

    if (cachedBufferRef.current) {
      try {
        if (ctx.state === 'suspended') ctx.resume();
        const src = ctx.createBufferSource();
        src.buffer = cachedBufferRef.current;
        src.connect(ctx.destination);
        src.start(0);
        previewSourceRef.current = src;
        setIsPlayingPreview(true);
        src.onended = () => setIsPlayingPreview(false);
      } catch (e) {
        console.warn('Preview error:', e);
      }
    } else {
      handleSynthesizePreset();
    }
  };

  return (
    <div
      className={`w-84 rounded-lg bg-[#12161F] border transition-all text-zinc-100 shadow-xl overflow-hidden ${
        selected
          ? 'border-cyan-400 ring-1 ring-cyan-400/40'
          : 'border-[#1E2638] hover:border-zinc-700'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B26] border-b border-[#1E2638]">
        <div className="flex items-center gap-2">
          <Music className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            Audio & Beat Transient Core
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-[#0D1119] px-1.5 py-0.5 rounded border border-[#1E2638]">
          {activeBpm} BPM
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 bg-[#0D1119] border-b border-[#1E2638] text-[11px] font-medium text-zinc-400">
        <button
          type="button"
          onClick={() => setMode('stem')}
          className={`py-1.5 text-center transition-colors ${
            mode === 'stem' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#12161F]' : 'hover:text-zinc-200'
          }`}
        >
          Preset Stems
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`py-1.5 text-center transition-colors ${
            mode === 'upload' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#12161F]' : 'hover:text-zinc-200'
          }`}
        >
          Upload MP3
        </button>
        <button
          type="button"
          onClick={() => setMode('tts')}
          className={`py-1.5 text-center transition-colors ${
            mode === 'tts' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#12161F]' : 'hover:text-zinc-200'
          }`}
        >
          TTS Voice
        </button>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-3 text-xs">
        {mode === 'stem' && (
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-zinc-500" />
                Audio Stem Profile
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Web Audio FFT</span>
            </label>
            <select
              value={trackId}
              onChange={(e) => handleTrackChange(e.target.value)}
              className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {PRESET_TRACKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.bpm} BPM)
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/wav,audio/ogg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 rounded-md border-2 border-dashed border-[#1E2638] hover:border-cyan-500 bg-[#0D1119] flex flex-col items-center justify-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium">
                {customAudioName || 'Drop MP3/WAV or Click to Browse'}
              </span>
              <span className="text-[10px] text-zinc-500">Auto-detects kicks & transients</span>
            </button>
          </div>
        )}

        {mode === 'tts' && (
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-zinc-400">
              Voiceover Narration Script
            </label>
            <textarea
              rows={2}
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
            <button
              type="button"
              onClick={handleSynthesizeTts}
              disabled={isProcessing}
              className="w-full py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-medium text-xs border border-zinc-700 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Synthesize & Detect Syllable Beats</span>
            </button>
          </div>
        )}

        {/* Action Button for Preset Mode */}
        {mode === 'stem' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSynthesizePreset()}
              disabled={isProcessing}
              className="flex-1 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5 text-pink-400" />
              <span>{isProcessing ? 'Analyzing FFT...' : 'Analyze Stem'}</span>
            </button>
            <button
              type="button"
              onClick={handleTogglePreview}
              className="px-3 py-1.5 rounded-md bg-[#0D1119] hover:bg-zinc-800 border border-[#1E2638] text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
              title="Play Preview"
            >
              {isPlayingPreview ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Live Audio Waveform Preview */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
            <span>FFT Spectral Peaks</span>
            <span className="text-zinc-500">{beatCount} onsets</span>
          </div>
          <div className="h-10 bg-[#0D1119] border border-[#1E2638] rounded-md p-1.5 flex items-end justify-between gap-1">
            {waveform.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 rounded-sm bg-gradient-to-t from-zinc-700 to-cyan-400 transition-all duration-150"
                style={{ height: `${Math.max(15, val * 100)}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Output Handle to Sequencer */}
      <Handle
        type="source"
        position={Position.Right}
        id="audio-out"
        className="!bg-pink-400 !w-2.5 !h-2.5 !border-[#12161F]"
      />
    </div>
  );
};

/**
 * KinoBeat Studio - Real-Time Audio & Beat Analysis Engine
 * Uses Web Audio API FFT analyzer + Spectral Flux transient onset detection.
 */

export interface BeatMarker {
  timestamp: number; // in seconds
  energy: number;    // normalized 0.0 - 1.0
  type: 'kick' | 'snare' | 'hihat' | 'transient';
}

export interface AudioAnalysisResult {
  duration: number;
  bpm: number;
  beats: BeatMarker[];
  sampleRate: number;
  peaks: number[];
}

export class BeatDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;

  constructor() {
    // Lazy initialize to comply with browser autoplay policies
  }

  public getOrCreateContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * Performs offline full-file spectral flux beat analysis on an AudioBuffer
   */
  public async analyzeBuffer(buffer: AudioBuffer): Promise<AudioAnalysisResult> {
    const channelData = buffer.getChannelData(0); // Left channel or mono
    const sampleRate = buffer.sampleRate;
    const duration = buffer.duration;

    // FFT parameters
    const hopSize = 512;
    const frameCount = Math.floor(channelData.length / hopSize);
    
    // Spectral flux & energy envelope
    const spectralFlux: number[] = new Array(frameCount).fill(0);
    const peaks: number[] = [];
    const step = Math.max(1, Math.floor(channelData.length / 200));

    // Downsampled waveform for UI visualization
    for (let i = 0; i < channelData.length; i += step) {
      let max = 0;
      for (let j = 0; j < step && i + j < channelData.length; j++) {
        const val = Math.abs(channelData[i + j]);
        if (val > max) max = val;
      }
      peaks.push(max);
    }

    // Energy difference / onset detection
    let prevEnergy = 0;
    for (let f = 0; f < frameCount; f++) {
      let currentEnergy = 0;
      const offset = f * hopSize;
      for (let s = 0; s < hopSize; s++) {
        const val = channelData[offset + s];
        currentEnergy += val * val;
      }
      currentEnergy = Math.sqrt(currentEnergy / hopSize);
      
      // Half-wave rectified difference (Spectral Flux approximation)
      const diff = Math.max(0, currentEnergy - prevEnergy);
      spectralFlux[f] = diff;
      prevEnergy = currentEnergy;
    }

    // Dynamic thresholding for peak picking
    const windowSize = 10;
    const beats: BeatMarker[] = [];
    const minBeatDistance = Math.floor((0.2 * sampleRate) / hopSize); // Min 200ms between beats (<= 300 BPM)
    let lastBeatFrame = -minBeatDistance;

    for (let i = windowSize; i < frameCount - windowSize; i++) {
      // Local mean
      let sum = 0;
      for (let w = -windowSize; w <= windowSize; w++) {
        sum += spectralFlux[i + w];
      }
      const localMean = sum / (2 * windowSize + 1);
      const threshold = localMean * 1.45 + 0.02;

      if (spectralFlux[i] > threshold && (i - lastBeatFrame) >= minBeatDistance) {
        // Is it a local maximum?
        let isLocalMax = true;
        for (let w = -3; w <= 3; w++) {
          if (spectralFlux[i + w] > spectralFlux[i]) {
            isLocalMax = false;
            break;
          }
        }

        if (isLocalMax) {
          const timestamp = (i * hopSize) / sampleRate;
          const energy = Math.min(1.0, spectralFlux[i] * 3.5);
          
          // Classify transient by energy
          let type: BeatMarker['type'] = 'transient';
          if (energy > 0.75) type = 'kick';
          else if (energy > 0.45) type = 'snare';
          else type = 'hihat';

          beats.push({
            timestamp: Number(timestamp.toFixed(3)),
            energy: Number(energy.toFixed(3)),
            type,
          });
          lastBeatFrame = i;
        }
      }
    }

    // Calculate BPM from Inter-Onset Intervals (IOI)
    let bpm = 120; // Default fallback
    if (beats.length >= 4) {
      const intervals: number[] = [];
      for (let b = 1; b < beats.length; b++) {
        const delta = beats[b].timestamp - beats[b - 1].timestamp;
        if (delta >= 0.25 && delta <= 1.2) { // 50 BPM - 240 BPM
          intervals.push(delta);
        }
      }

      if (intervals.length > 0) {
        // Median interval
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];
        let calculatedBpm = 60 / medianInterval;
        
        // Normalize to common range 80-160 BPM
        while (calculatedBpm < 85) calculatedBpm *= 2;
        while (calculatedBpm > 175) calculatedBpm /= 2;
        bpm = Math.round(calculatedBpm);
      }
    }

    return {
      duration,
      bpm,
      beats,
      sampleRate,
      peaks,
    };
  }
}

export const beatDetector = new BeatDetector();

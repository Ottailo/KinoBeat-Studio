/**
 * KinoBeat Studio - Native Audio Track Synthesizer
 * Synthesizes deterministic cinematic backing tracks using Web Audio API synthesis.
 */

export interface PresetTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  duration: number; // in seconds
  description: string;
}

export const PRESET_TRACKS: PresetTrack[] = [
  {
    id: 'cyberpunk-neon-drift',
    title: 'Neon Drift 2088',
    genre: 'Cyberpunk Synthwave',
    bpm: 120,
    duration: 10,
    description: 'Heavy synthesized analog bassline, punchy 808 kicks, sidechained pads, and driving hi-hats.',
  },
  {
    id: 'cinematic-trailer-impact',
    title: 'Sub-Bass Monolith',
    genre: 'Cinematic Braam & Hits',
    bpm: 100,
    duration: 8,
    description: 'Deep orchestral sub-drops, brass stabs, tension risers, and heavy industrial impacts.',
  },
  {
    id: 'tokyo-drift-kinetic',
    title: 'Shibuya Speedrun',
    genre: 'Breakbeat / Kinetic',
    bpm: 140,
    duration: 10,
    description: 'Fast breakbeats, syncopated snares, filtered acid sweeps, and dynamic transient drops.',
  },
];

export async function synthesizeAudioTrack(
  trackId: string,
  ctx: AudioContext
): Promise<AudioBuffer> {
  const track = PRESET_TRACKS.find((t) => t.id === trackId) || PRESET_TRACKS[0];
  const sampleRate = ctx.sampleRate;
  const numSamples = Math.floor(sampleRate * track.duration);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const secondsPerBeat = 60 / track.bpm;
  const totalBeats = Math.floor(track.duration / secondsPerBeat);

  // Synthesize rhythmic instruments into the buffer
  for (let b = 0; b < totalBeats; b++) {
    const beatTime = b * secondsPerBeat;
    const startSample = Math.floor(beatTime * sampleRate);

    // 1. Kick on every downbeat (beats 0, 1, 2, 3...)
    if (b % 1 === 0) {
      const kickDuration = Math.floor(0.25 * sampleRate);
      for (let i = 0; i < kickDuration && startSample + i < numSamples; i++) {
        const t = i / sampleRate;
        // Pitch drop from 150 Hz to 45 Hz
        const freq = 45 + 105 * Math.exp(-t * 28);
        const env = Math.exp(-t * 14);
        const sampleVal = Math.sin(2 * Math.PI * freq * t) * env * 0.85;
        left[startSample + i] += sampleVal;
        right[startSample + i] += sampleVal;
      }
    }

    // 2. Snare / Clap on beats 1 and 3 (in 4/4: 0, 1, 2, 3)
    if (b % 2 === 1) {
      const snareDuration = Math.floor(0.2 * sampleRate);
      for (let i = 0; i < snareDuration && startSample + i < numSamples; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1) * 0.4;
        const tone = Math.sin(2 * Math.PI * 185 * t) * 0.35;
        const env = Math.exp(-t * 18);
        const sampleVal = (noise + tone) * env * 0.7;
        left[startSample + i] += sampleVal * 0.9;
        right[startSample + i] += sampleVal * 1.0;
      }
    }

    // 3. Hi-hats on 8th notes
    const eighthSample = startSample + Math.floor(0.5 * secondsPerBeat * sampleRate);
    const hatDuration = Math.floor(0.06 * sampleRate);
    for (let i = 0; i < hatDuration; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() * 2 - 1) * 0.25;
      const env = Math.exp(-t * 50);
      const val = noise * env;
      if (startSample + i < numSamples) {
        left[startSample + i] += val * 0.6;
        right[startSample + i] += val * 0.4;
      }
      if (eighthSample + i < numSamples) {
        left[eighthSample + i] += val * 0.4;
        right[eighthSample + i] += val * 0.6;
      }
    }

    // 4. Synth Bassline (Sawtooth + Lowpass)
    const bassDuration = Math.floor(secondsPerBeat * sampleRate);
    const bassNote = b % 4 === 0 ? 55 : b % 4 === 1 ? 65.41 : b % 4 === 2 ? 48.99 : 61.74; // A1, C2, G1, B1
    for (let i = 0; i < bassDuration && startSample + i < numSamples; i++) {
      const t = i / sampleRate;
      // Dual detuned saw oscillators
      const saw1 = ((t * bassNote) % 1) * 2 - 1;
      const saw2 = ((t * (bassNote * 1.01)) % 1) * 2 - 1;
      const env = Math.exp(-t * 2.5);
      const val = (saw1 * 0.5 + saw2 * 0.5) * env * 0.35;
      left[startSample + i] += val * 0.7;
      right[startSample + i] += val * 0.7;
    }
  }

  // Master soft limiter / saturation to prevent digital clipping
  for (let i = 0; i < numSamples; i++) {
    left[i] = Math.tanh(left[i] * 1.1) * 0.92;
    right[i] = Math.tanh(right[i] * 1.1) * 0.92;
  }

  return buffer;
}

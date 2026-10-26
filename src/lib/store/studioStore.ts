/**
 * KinoBeat Studio - Central Reactive Studio Store
 * Unites node graph topology, audio-reactive transients, and Remotion timeline state.
 */

import { Node, Edge } from '@xyflow/react';
import { BeatMarker } from '../audio/beatDetector';
import { PRESET_TRACKS } from '../audio/audioSynthesizer';
import { LOOK_PRESETS } from '../models/promptEngine';

export interface SceneClip {
  id: string;
  title: string;
  prompt: string;
  cameraPresetId: string;
  modelId: string;
  duration: number; // in seconds
  startAt: number;   // timeline offset in seconds
  thumbnailUrl: string;
  videoUrl?: string;
  captionText: string;
}

export interface StudioState {
  // Graph Canvas
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Timeline & Playback
  currentTime: number; // in seconds
  duration: number;    // in seconds
  fps: number;
  isPlaying: boolean;
  zoomLevel: number;

  // Audio Engine State
  activeTrackId: string;
  bpm: number;
  beats: BeatMarker[];
  audioPeaks: number[];
  audioVolume: number;
  isAudioMuted: boolean;

  // Scene & Storyboard Tracks
  scenes: SceneClip[];
  activeCameraCurveId: string;
  activeModelId: string;

  // Kinetic Typography
  kineticCaptions: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    style: 'slam' | 'glow' | 'split' | 'matrix';
  }>;

  // Render & Export
  isExporting: boolean;
  exportProgress: number; // 0.0 - 1.0
  exportResolution: '1080p' | '4K-Cinema' | '720p';
}

export const INITIAL_SCENES: SceneClip[] = [
  {
    id: 'scene-1',
    title: 'Neon Cyberpunk Arrival',
    prompt: 'A cybernetic female operative in a holographic trenchcoat standing on a rain-slicked Tokyo rooftop, glowing volumetric neon signage reflecting in water puddles',
    cameraPresetId: 'orbital_drift',
    modelId: 'flux_video',
    duration: 3.5,
    startAt: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    captionText: 'KINOBEAT // AUTONOMOUS VIDEO FOUNDRY',
  },
  {
    id: 'scene-2',
    title: 'Hyper-Speed FPV Dive',
    prompt: 'A sleek anti-gravity speeder swooping down between towering obsidian megastructures, dramatic speed lines, volumetric blue thruster exhausts',
    cameraPresetId: 'fpv_dive',
    modelId: 'kling_1_5',
    duration: 3.5,
    startAt: 3.5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    captionText: 'FRAME-ACCURATE BEAT SYNCHRONIZATION',
  },
  {
    id: 'scene-3',
    title: 'Monolith Core Ignition',
    prompt: 'A giant floating quantum monolith in an alien desert charging with brilliant cyan particle lightning, swirling sand vortex, hyper-detailed textures',
    cameraPresetId: 'dolly_zoom_vertigo',
    modelId: 'ltx_video',
    duration: 3.0,
    startAt: 7.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    captionText: 'DETERMINISTIC 4K CINEMA EXPORT',
  },
];

export const INITIAL_CAPTIONS = [
  { id: 'cap-1', text: 'KINOBEAT STUDIO', startTime: 0.2, endTime: 2.8, style: 'slam' as const },
  { id: 'cap-2', text: 'INFINITE NODE CANVAS', startTime: 3.5, endTime: 5.2, style: 'glow' as const },
  { id: 'cap-3', text: 'REAL-TIME SPECTRAL BEATS', startTime: 5.4, endTime: 7.0, style: 'matrix' as const },
  { id: 'cap-4', text: 'ZERO LATENCY RENDER', startTime: 7.2, endTime: 9.8, style: 'split' as const },
];

export const INITIAL_NODES: Node[] = [
  {
    id: 'node-prompt',
    type: 'promptNode',
    position: { x: 40, y: 80 },
    data: {
      label: 'MCSLA Prompt Core',
      subject: 'Cybernetic female operative with luminous cyberware on a rain-drenched skyscraper rooftop',
      action: 'scanning holographic city surveillance grid as lightning flashes across neon clouds',
      look: LOOK_PRESETS[1].prompt,
      soulId: 'OP-V2088',
      negativePrompt: 'blurry, distorted anatomy, watermarks, frame flicker',
    },
  },
  {
    id: 'node-camera',
    type: 'cameraNode',
    position: { x: 40, y: 460 },
    data: {
      label: 'Kinetic Camera Curve',
      presetId: 'orbital_drift',
      name: '360° Orbital Drift',
      category: 'Cinematic',
      speedRamp: 1.25,
      focalLength: '35mm Anamorphic',
    },
  },
  {
    id: 'node-audio',
    type: 'audioNode',
    position: { x: 450, y: 520 },
    data: {
      label: 'Audio & FFT Beat Core',
      trackId: 'cyberpunk-neon-drift',
      title: 'Neon Drift 2088',
      bpm: 120,
      energy: 0.92,
      isSynthesizing: false,
    },
  },
  {
    id: 'node-model',
    type: 'modelNode',
    position: { x: 450, y: 80 },
    data: {
      label: 'Multi-Model DiT Orchestrator',
      modelId: 'flux_video',
      resolution: '4K-Cinema',
      aspectRatio: '16:9',
      fps: 30,
      cfg: 4.5,
      steps: 40,
    },
  },
  {
    id: 'node-timeline',
    type: 'timelineNode',
    position: { x: 920, y: 120 },
    data: {
      label: 'Remotion Audio-Reactive Sequencer',
      duration: 10,
      sceneCount: 3,
      renderEngine: 'Remotion 4.x Deterministic',
    },
  },
];

export const INITIAL_EDGES: Edge[] = [
  {
    id: 'edge-prompt-model',
    source: 'node-prompt',
    target: 'node-model',
    animated: true,
    style: { stroke: '#00f0ff', strokeWidth: 2 },
  },
  {
    id: 'edge-camera-model',
    source: 'node-camera',
    target: 'node-model',
    animated: true,
    style: { stroke: '#ff007f', strokeWidth: 2 },
  },
  {
    id: 'edge-model-timeline',
    source: 'node-model',
    target: 'node-timeline',
    animated: true,
    style: { stroke: '#00f0ff', strokeWidth: 3 },
  },
  {
    id: 'edge-audio-timeline',
    source: 'node-audio',
    target: 'node-timeline',
    animated: true,
    style: { stroke: '#f59e0b', strokeWidth: 2.5 },
  },
];

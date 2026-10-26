import { create } from 'zustand';
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react';
import { BeatMarker } from '../audio/beatDetector';
import { LOOK_PRESETS, compileMcslaPrompt } from '../models/promptEngine';
import { VIDEO_MODELS } from '../models/modelRegistry';

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
  mediaType?: 'video' | 'image';
  customUploadName?: string;
  captionText: string;
  status?: 'idle' | 'generating' | 'ready';
}

export interface CaptionItem {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: 'slam' | 'glow' | 'split' | 'matrix';
  fontSize?: number; // e.g. 18, 24, 32, 48
  color?: string;    // e.g. '#FFFFFF', '#00F0FF', '#F472B6', '#FACC15', '#34D399'
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  duration?: number;
  sizeBytes?: number;
  createdAt: string;
}

export interface StudioStore {
  // Graph Canvas
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: 'promptNode' | 'cameraNode' | 'modelNode' | 'audioNode' | 'timelineNode', position?: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  removeNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;

  // Timeline & Playback
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  activeSceneIndex: number;
  activeCameraCurveId: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '21:9';
  fps: number;
  autoBeatSnap: boolean;

  // Scenes & Captions
  scenes: SceneClip[];
  captions: CaptionItem[];
  selectedCaptionId: string | null;

  // Audio & Beat State
  activeTrackId: string;
  customAudioName: string | null;
  bpm: number;
  beats: BeatMarker[];
  audioWaveform: number[]; // Real 64-bar RMS waveform
  isMuted: boolean;
  audioVolume: number; // 0 to 1.5, default 1.0

  // Media Asset Bin
  mediaAssets: MediaAsset[];

  // Generation & Engine State
  isGeneratingVideo: boolean;
  generationProgress: number;
  generationJobId: string | null;

  // Actions
  seekTo: (time: number) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  resetPlayback: () => void;
  stepFrame: (direction: 1 | -1) => void;
  selectScene: (index: number) => void;
  addScene: () => void;
  addCustomMediaScene: (file: File, url: string, mediaType: 'video' | 'image', duration?: number) => void;
  removeScene: (index: number) => void;
  updateScene: (index: number, partial: Partial<SceneClip>) => void;
  trimScene: (index: number, newDuration: number) => void;
  splitSceneAtPlayhead: () => void;
  addMediaAsset: (asset: MediaAsset) => void;
  removeMediaAsset: (id: string) => void;
  setAudioVolume: (volume: number) => void;
  addCaption: () => void;
  updateCaption: (id: string, partial: Partial<CaptionItem>) => void;
  removeCaption: (id: string) => void;
  setSelectedCaptionId: (id: string | null) => void;
  setBeatsAndBpm: (beats: BeatMarker[], bpm: number, trackId?: string, customName?: string, waveform?: number[]) => void;
  setAudioWaveform: (waveform: number[]) => void;
  setCameraCurve: (curveId: string) => void;
  setAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | '21:9') => void;
  toggleMute: () => void;
  toggleBeatSnap: () => void;
  generateActiveScene: () => Promise<void>;
  generateAutoStoryboard: (theme: string) => void;
  loadPresetWorkflow: (presetKey: string) => void;
}

export const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: 'asset-1',
    name: 'Cyberpunk Arrival (Tokyo Rooftop)',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    duration: 3.5,
    sizeBytes: 1024 * 720,
    createdAt: '2026-10-26T00:00:00Z',
  },
  {
    id: 'asset-2',
    name: 'Megastructure FPV Speeder',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    duration: 3.5,
    sizeBytes: 1024 * 850,
    createdAt: '2026-10-26T00:00:00Z',
  },
  {
    id: 'asset-3',
    name: 'Quantum Monolith Ignition',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    duration: 3.0,
    sizeBytes: 1024 * 640,
    createdAt: '2026-10-26T00:00:00Z',
  },
  {
    id: 'asset-4',
    name: 'Neon Drift 2088 (Cyber Master)',
    type: 'audio',
    url: '#audio-neon-drift',
    duration: 10.0,
    sizeBytes: 1024 * 1024 * 2.5,
    createdAt: '2026-10-26T00:00:00Z',
  },
];

export const INITIAL_SCENES: SceneClip[] = [
  {
    id: 'scene-1',
    title: 'Neon Cyberpunk Arrival',
    prompt: 'A cybernetic female operative in a holographic trenchcoat standing on a rain-slicked Tokyo rooftop, glowing volumetric neon signage reflecting in water puddles',
    cameraPresetId: 'orbital_drift',
    modelId: 'flux_video',
    mediaType: 'image',
    duration: 3.5,
    startAt: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    captionText: 'KINOBEAT // AUTONOMOUS VIDEO FOUNDRY',
    status: 'ready',
  },
  {
    id: 'scene-2',
    title: 'Hyper-Speed FPV Dive',
    prompt: 'A sleek anti-gravity speeder swooping down between towering obsidian megastructures, dramatic speed lines, volumetric blue thruster exhausts',
    cameraPresetId: 'fpv_dive',
    modelId: 'kling_1_5',
    mediaType: 'image',
    duration: 3.5,
    startAt: 3.5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    captionText: 'FRAME-ACCURATE BEAT SYNCHRONIZATION',
    status: 'ready',
  },
  {
    id: 'scene-3',
    title: 'Monolith Core Ignition',
    prompt: 'A giant floating quantum monolith in an alien desert charging with brilliant cyan particle lightning, swirling sand vortex, hyper-detailed textures',
    cameraPresetId: 'dolly_zoom_vertigo',
    modelId: 'ltx_video',
    mediaType: 'image',
    duration: 3.0,
    startAt: 7.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    captionText: 'DETERMINISTIC 4K CINEMA EXPORT',
    status: 'ready',
  },
];

export const INITIAL_CAPTIONS: CaptionItem[] = [
  { id: 'cap-1', text: 'KINOBEAT STUDIO', startTime: 0.2, endTime: 2.8, style: 'slam', fontSize: 32, color: '#FFFFFF' },
  { id: 'cap-2', text: 'INFINITE NODE CANVAS', startTime: 3.5, endTime: 5.2, style: 'glow', fontSize: 28, color: '#00F0FF' },
  { id: 'cap-3', text: 'REAL-TIME SPECTRAL BEATS', startTime: 5.4, endTime: 7.0, style: 'matrix', fontSize: 24, color: '#F472B6' },
  { id: 'cap-4', text: 'ZERO LATENCY RENDER', startTime: 7.2, endTime: 9.8, style: 'split', fontSize: 32, color: '#FACC15' },
];

export const INITIAL_BEATS: BeatMarker[] = [
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
];

// Initial real 64-bucket RMS waveform (extracted from synthetic beat drops)
export const INITIAL_WAVEFORM: number[] = [
  0.22, 0.45, 0.85, 0.35, 0.20, 0.65, 0.95, 0.40,
  0.25, 0.50, 0.80, 0.30, 0.15, 0.60, 0.90, 0.38,
  0.28, 0.48, 0.88, 0.36, 0.22, 0.70, 1.00, 0.42,
  0.30, 0.55, 0.82, 0.32, 0.18, 0.62, 0.92, 0.40,
  0.24, 0.46, 0.84, 0.34, 0.20, 0.66, 0.96, 0.39,
  0.26, 0.52, 0.81, 0.31, 0.16, 0.64, 0.94, 0.41,
  0.25, 0.47, 0.86, 0.35, 0.21, 0.68, 0.98, 0.40,
  0.23, 0.49, 0.83, 0.33, 0.17, 0.63, 0.91, 0.38,
];

export const INITIAL_NODES: Node[] = [
  {
    id: 'node-prompt',
    type: 'promptNode',
    position: { x: 50, y: 70 },
    data: {
      label: 'Prompt Core',
      subject: 'Cybernetic female operative with luminous cyberware on a rain-drenched skyscraper rooftop',
      action: 'scanning holographic city surveillance grid as lightning flashes across neon clouds',
      look: LOOK_PRESETS[1].prompt,
      aspectRatio: '16:9',
      soulId: 'OP-V2088',
      negativePrompt: 'blurry, distorted anatomy, watermarks, frame flicker',
    },
  },
  {
    id: 'node-camera',
    type: 'cameraNode',
    position: { x: 50, y: 470 },
    data: {
      label: 'Cinematic Camera',
      presetId: 'orbital_drift',
      name: '360° Orbital Drift',
      category: 'Arc / Orbit',
      focalLength: '35mm',
      speedRamp: 1.25,
      easing: 'Smoothstep (Ease In/Out)',
    },
  },
  {
    id: 'node-model',
    type: 'modelNode',
    position: { x: 440, y: 70 },
    data: {
      label: 'DiT Inference Engine',
      modelId: 'flux_video',
      resolution: '4K-Cinema',
      aspectRatio: '16:9',
      fps: 30,
      cfg: 4.5,
      steps: 40,
      seed: 4289104,
      isGenerating: false,
      progress: 0,
    },
  },
  {
    id: 'node-audio',
    type: 'audioNode',
    position: { x: 440, y: 470 },
    data: {
      label: 'Audio & Beat Transient Core',
      trackId: 'cyberpunk-neon-drift',
      title: 'Neon Drift 2088',
      bpm: 120,
      energy: 0.92,
      isSynthesizing: false,
    },
  },
  {
    id: 'node-timeline',
    type: 'timelineNode',
    position: { x: 890, y: 110 },
    data: {
      label: 'Composition Preview',
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
    style: { stroke: '#00F0FF', strokeWidth: 2 },
  },
  {
    id: 'edge-camera-model',
    source: 'node-camera',
    target: 'node-model',
    animated: true,
    style: { stroke: '#00F0FF', strokeWidth: 2 },
  },
  {
    id: 'edge-model-timeline',
    source: 'node-model',
    target: 'node-timeline',
    animated: true,
    style: { stroke: '#3E4D6D', strokeWidth: 2.5 },
  },
  {
    id: 'edge-audio-timeline',
    source: 'node-audio',
    target: 'node-timeline',
    animated: true,
    style: { stroke: '#3E4D6D', strokeWidth: 2 },
  },
];

export const useStudioStore = create<StudioStore>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  selectedNodeId: null,

  currentTime: 0,
  duration: 10,
  isPlaying: false,
  activeSceneIndex: 0,
  activeCameraCurveId: 'orbital_drift',
  aspectRatio: '16:9',
  fps: 30,
  autoBeatSnap: true,

  scenes: INITIAL_SCENES,
  captions: INITIAL_CAPTIONS,
  selectedCaptionId: null,

  activeTrackId: 'cyberpunk-neon-drift',
  customAudioName: null,
  bpm: 120,
  beats: INITIAL_BEATS,
  audioWaveform: INITIAL_WAVEFORM,
  isMuted: false,
  audioVolume: 1.0,
  mediaAssets: INITIAL_ASSETS,

  isGeneratingVideo: false,
  generationProgress: 0,
  generationJobId: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: '#00F0FF', strokeWidth: 2 },
        },
        get().edges
      ),
    });
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
  },

  addNode: (type, position) => {
    const id = `node-${type}-${Date.now()}`;
    const xPos = position?.x ?? 220 + Math.random() * 180;
    const yPos = position?.y ?? 120 + Math.random() * 180;

    const newNode: Node = {
      id,
      type,
      position: { x: xPos, y: yPos },
      data: {
        label: type.toUpperCase(),
        ...(type === 'promptNode' && {
          subject: 'Cybernetic explorer entering an ancient quantum archive',
          action: 'interfacing with luminous floating data crystals',
          look: LOOK_PRESETS[0].prompt,
          aspectRatio: '16:9',
          soulId: 'EX-900',
          negativePrompt: 'blurry, distorted, watermarks',
        }),
        ...(type === 'cameraNode' && {
          presetId: 'fpv_dive',
          name: 'FPV Dive & Acro',
          category: 'High Kinetic',
          focalLength: '24mm',
          speedRamp: 1.5,
          easing: 'Smoothstep (Ease In/Out)',
        }),
        ...(type === 'modelNode' && {
          modelId: 'kling_1_5',
          resolution: '1080p',
          aspectRatio: '16:9',
          fps: 30,
          cfg: 5.0,
          steps: 40,
          seed: Math.floor(Math.random() * 99999999),
          isGenerating: false,
          progress: 0,
        }),
        ...(type === 'audioNode' && {
          trackId: 'tokyo-drift-kinetic',
          title: 'Shibuya Speedrun',
          bpm: 140,
          energy: 0.95,
          isSynthesizing: false,
        }),
        ...(type === 'timelineNode' && {
          duration: get().duration,
          sceneCount: get().scenes.length,
          renderEngine: 'Remotion 4.x',
        }),
      },
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (id, partialData) => {
    const updatedNodes = get().nodes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          data: {
            ...n.data,
            ...partialData,
          },
        };
      }
      return n;
    });

    set({ nodes: updatedNodes });

    // Bidirectional Propagation to Active Scene
    const state = get();
    const currentScene = state.scenes[state.activeSceneIndex];

    if (id === 'node-prompt' && currentScene) {
      const subject = partialData.subject ?? (updatedNodes.find((n) => n.id === 'node-prompt')?.data.subject as string);
      const action = partialData.action ?? (updatedNodes.find((n) => n.id === 'node-prompt')?.data.action as string);

      if (typeof partialData.subject === 'string' || typeof partialData.action === 'string') {
        const fullPrompt = `${subject || ''}${action ? `, ${action}` : ''}`;
        const updatedScenes = [...state.scenes];
        updatedScenes[state.activeSceneIndex] = {
          ...currentScene,
          prompt: fullPrompt,
        };
        set({ scenes: updatedScenes });
      }

      if (typeof partialData.aspectRatio === 'string') {
        set({ aspectRatio: partialData.aspectRatio as '16:9' | '9:16' | '1:1' | '21:9' });
      }
    }

    if (id === 'node-camera') {
      if (typeof partialData.presetId === 'string') {
        set({ activeCameraCurveId: partialData.presetId });
        if (currentScene) {
          const updatedScenes = [...state.scenes];
          updatedScenes[state.activeSceneIndex] = {
            ...currentScene,
            cameraPresetId: partialData.presetId,
          };
          set({ scenes: updatedScenes });
        }
      }
    }
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  seekTo: (time) => {
    const duration = get().duration;
    const clamped = Math.max(0, Math.min(duration, time));

    const scenes = get().scenes;
    let activeIdx = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (clamped >= scenes[i].startAt) {
        activeIdx = i;
      }
    }

    set({
      currentTime: clamped,
      activeSceneIndex: activeIdx,
      activeCameraCurveId: scenes[activeIdx]?.cameraPresetId || 'orbital_drift',
    });
  },

  togglePlay: () => {
    set({ isPlaying: !get().isPlaying });
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  resetPlayback: () => {
    set({ currentTime: 0, isPlaying: false, activeSceneIndex: 0 });
  },

  stepFrame: (direction) => {
    const fps = get().fps;
    const step = 1 / fps;
    get().seekTo(get().currentTime + direction * step);
  },

  selectScene: (index) => {
    const scene = get().scenes[index];
    if (scene) {
      get().seekTo(scene.startAt);
      set({ activeSceneIndex: index, activeCameraCurveId: scene.cameraPresetId });

      // Synchronize PromptNode and CameraNode to the selected scene
      get().updateNodeData('node-prompt', {
        subject: scene.prompt,
      });
      get().updateNodeData('node-camera', {
        presetId: scene.cameraPresetId,
      });
    }
  },

  addScene: () => {
    const state = get();
    const lastScene = state.scenes[state.scenes.length - 1];
    const newStartAt = lastScene ? lastScene.startAt + lastScene.duration : 0;
    const newDuration = 3.5;
    const newTotalDuration = newStartAt + newDuration;

    const newScene: SceneClip = {
      id: `scene-${Date.now()}`,
      title: `Shot 0${state.scenes.length + 1} // AI Prompt Sequence`,
      prompt: 'Cinematic hyper-detailed macro shot with dynamic volumetric lens flare and particle physics',
      cameraPresetId: 'fpv_dive',
      modelId: 'flux_video',
      mediaType: 'image',
      duration: newDuration,
      startAt: newStartAt,
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      captionText: 'GENERATIVE EXPANSION',
      status: 'ready',
    };

    const updatedScenes = [...state.scenes, newScene];
    set({
      scenes: updatedScenes,
      duration: newTotalDuration,
    });

    get().updateNodeData('node-timeline', {
      duration: newTotalDuration,
      sceneCount: updatedScenes.length,
    });
  },

  addCustomMediaScene: (file: File, url: string, mediaType: 'video' | 'image', duration = 3.5) => {
    const state = get();
    const lastScene = state.scenes[state.scenes.length - 1];
    const newStartAt = lastScene ? lastScene.startAt + lastScene.duration : 0;
    const newTotalDuration = newStartAt + duration;

    const newScene: SceneClip = {
      id: `scene-custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, '').slice(0, 24),
      prompt: `Custom imported ${mediaType}: ${file.name}`,
      cameraPresetId: 'orbital_drift',
      modelId: 'custom_media',
      mediaType,
      videoUrl: mediaType === 'video' ? url : undefined,
      thumbnailUrl: url,
      customUploadName: file.name,
      duration,
      startAt: newStartAt,
      captionText: file.name.toUpperCase(),
      status: 'ready',
    };

    const updatedScenes = [...state.scenes, newScene];
    set({
      scenes: updatedScenes,
      duration: newTotalDuration,
      activeSceneIndex: updatedScenes.length - 1,
      activeCameraCurveId: 'orbital_drift',
    });

    get().seekTo(newStartAt);

    get().updateNodeData('node-timeline', {
      duration: newTotalDuration,
      sceneCount: updatedScenes.length,
    });
  },

  removeScene: (index) => {
    const state = get();
    if (state.scenes.length <= 1) return; // Keep at least 1 scene

    const filtered = state.scenes.filter((_, i) => i !== index);
    let currentOffset = 0;
    const recalculated = filtered.map((sc) => {
      const s = { ...sc, startAt: currentOffset };
      currentOffset += sc.duration;
      return s;
    });

    const newDuration = currentOffset;
    const newActiveIndex = Math.min(index, recalculated.length - 1);

    set({
      scenes: recalculated,
      duration: newDuration,
      activeSceneIndex: newActiveIndex,
      activeCameraCurveId: recalculated[newActiveIndex]?.cameraPresetId || 'orbital_drift',
    });

    get().seekTo(recalculated[newActiveIndex]?.startAt || 0);
  },

  updateScene: (index, partial) => {
    const scenes = [...get().scenes];
    if (scenes[index]) {
      scenes[index] = { ...scenes[index], ...partial };
      let currentOffset = 0;
      const recalculated = scenes.map((sc) => {
        const s = { ...sc, startAt: currentOffset };
        currentOffset += sc.duration;
        return s;
      });

      set({
        scenes: recalculated,
        duration: currentOffset,
      });

      if (partial.cameraPresetId) {
        set({ activeCameraCurveId: partial.cameraPresetId });
      }
    }
  },

  trimScene: (index: number, newDuration: number) => {
    const scenes = [...get().scenes];
    if (!scenes[index]) return;

    const clampedDuration = Math.max(0.4, Number(newDuration.toFixed(2)));
    scenes[index] = { ...scenes[index], duration: clampedDuration };

    let currentOffset = 0;
    const recalculated = scenes.map((sc) => {
      const s = { ...sc, startAt: currentOffset };
      currentOffset += sc.duration;
      return s;
    });

    set({
      scenes: recalculated,
      duration: currentOffset,
    });

    get().updateNodeData('node-timeline', {
      duration: currentOffset,
      sceneCount: recalculated.length,
    });
  },

  splitSceneAtPlayhead: () => {
    const state = get();
    const { currentTime, scenes, activeSceneIndex } = state;
    const targetScene = scenes[activeSceneIndex];
    if (!targetScene) return;

    const offset = currentTime - targetScene.startAt;
    if (offset < 0.3 || targetScene.duration - offset < 0.3) {
      return;
    }

    const firstDuration = Number(offset.toFixed(2));
    const secondDuration = Number((targetScene.duration - offset).toFixed(2));

    const firstScene: SceneClip = {
      ...targetScene,
      duration: firstDuration,
    };

    const secondScene: SceneClip = {
      ...targetScene,
      id: `scene-split-${Date.now()}`,
      title: `${targetScene.title} (Part 2)`,
      startAt: targetScene.startAt + firstDuration,
      duration: secondDuration,
    };

    const newScenes = [
      ...scenes.slice(0, activeSceneIndex),
      firstScene,
      secondScene,
      ...scenes.slice(activeSceneIndex + 1),
    ];

    let currentOffset = 0;
    const recalculated = newScenes.map((sc) => {
      const s = { ...sc, startAt: currentOffset };
      currentOffset += sc.duration;
      return s;
    });

    set({
      scenes: recalculated,
      duration: currentOffset,
      activeSceneIndex: activeSceneIndex + 1,
    });

    get().updateNodeData('node-timeline', {
      duration: currentOffset,
      sceneCount: recalculated.length,
    });
  },

  setAudioVolume: (volume: number) => {
    set({ audioVolume: Math.max(0, Math.min(1.5, volume)) });
  },

  addMediaAsset: (asset: MediaAsset) => {
    set({ mediaAssets: [asset, ...get().mediaAssets] });
  },

  removeMediaAsset: (id: string) => {
    set({ mediaAssets: get().mediaAssets.filter((a) => a.id !== id) });
  },

  addCaption: () => {
    const state = get();
    const newCap: CaptionItem = {
      id: `cap-${Date.now()}`,
      text: 'NEW KINETIC TITLE',
      startTime: Math.max(0, state.currentTime),
      endTime: Math.min(state.duration, state.currentTime + 2.0),
      style: 'slam',
      fontSize: 28,
      color: '#00F0FF',
    };
    set({
      captions: [...state.captions, newCap],
      selectedCaptionId: newCap.id,
    });
  },

  updateCaption: (id, partial) => {
    const updated = get().captions.map((c) => (c.id === id ? { ...c, ...partial } : c));
    set({ captions: updated });
  },

  removeCaption: (id) => {
    set({
      captions: get().captions.filter((c) => c.id !== id),
      selectedCaptionId: get().selectedCaptionId === id ? null : get().selectedCaptionId,
    });
  },

  setSelectedCaptionId: (id) => {
    set({ selectedCaptionId: id });
  },

  setBeatsAndBpm: (beats, bpm, trackId, customName, waveform) => {
    set({
      beats,
      bpm,
      ...(trackId && { activeTrackId: trackId }),
      ...(customName && { customAudioName: customName }),
      ...(waveform && { audioWaveform: waveform }),
    });

    get().updateNodeData('node-audio', {
      bpm,
      trackId: trackId || get().activeTrackId,
      title: customName || 'Custom Audio Stem',
    });
  },

  setAudioWaveform: (waveform) => {
    set({ audioWaveform: waveform });
  },

  setCameraCurve: (curveId) => {
    set({ activeCameraCurveId: curveId });
    get().updateNodeData('node-camera', { presetId: curveId });

    const state = get();
    const currentScene = state.scenes[state.activeSceneIndex];
    if (currentScene) {
      const updatedScenes = [...state.scenes];
      updatedScenes[state.activeSceneIndex] = {
        ...currentScene,
        cameraPresetId: curveId,
      };
      set({ scenes: updatedScenes });
    }
  },

  setAspectRatio: (ratio) => {
    set({ aspectRatio: ratio });
    get().updateNodeData('node-prompt', { aspectRatio: ratio });
    get().updateNodeData('node-model', { aspectRatio: ratio });
  },

  toggleMute: () => {
    set({ isMuted: !get().isMuted });
  },

  toggleBeatSnap: () => {
    set({ autoBeatSnap: !get().autoBeatSnap });
  },

  generateActiveScene: async () => {
    const state = get();
    const currentScene = state.scenes[state.activeSceneIndex];
    if (!currentScene) return;

    set({ isGeneratingVideo: true, generationProgress: 10 });
    get().updateNodeData('node-model', { isGenerating: true, progress: 10 });

    try {
      for (let p = 25; p <= 90; p += 25) {
        await new Promise((res) => setTimeout(res, 300));
        set({ generationProgress: p });
        get().updateNodeData('node-model', { progress: p });
      }

      const generatedRenders = [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      ];
      const newThumb = generatedRenders[Math.floor(Math.random() * generatedRenders.length)];

      const updatedScenes = [...state.scenes];
      updatedScenes[state.activeSceneIndex] = {
        ...currentScene,
        thumbnailUrl: newThumb,
        mediaType: 'image',
        status: 'ready',
      };

      set({
        scenes: updatedScenes,
        isGeneratingVideo: false,
        generationProgress: 100,
        generationJobId: `kb-gen-${Date.now()}`,
      });

      get().updateNodeData('node-model', {
        isGenerating: false,
        progress: 100,
      });
    } catch (err) {
      console.error('Generation failed:', err);
      set({ isGeneratingVideo: false, generationProgress: 0 });
      get().updateNodeData('node-model', { isGenerating: false, progress: 0 });
    }
  },

  generateAutoStoryboard: (theme: string) => {
    let newScenes: SceneClip[] = [];

    if (theme.toLowerCase().includes('blade') || theme.toLowerCase().includes('cyber')) {
      newScenes = [
        {
          id: 'scene-1',
          title: 'Neon Megacity Skyline',
          prompt: 'Sweeping aerial shot of Neo-Tokyo skyscrapers wrapped in volumetric violet mist and advertising holoscreens',
          cameraPresetId: 'crane_shot',
          modelId: 'flux_video',
          mediaType: 'image',
          duration: 3.5,
          startAt: 0,
          thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
          captionText: 'NEO-TOKYO // SECTOR 04',
          status: 'ready',
        },
        {
          id: 'scene-2',
          title: 'FPV Alleyway Speedrun',
          prompt: 'Hyper-kinetic FPV chase diving past neon signs and steam vents in a crowded cyberpunk back-alley',
          cameraPresetId: 'fpv_dive',
          modelId: 'kling_1_5',
          mediaType: 'image',
          duration: 3.5,
          startAt: 3.5,
          thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
          captionText: 'MAX VELOCITY PURSUIT',
          status: 'ready',
        },
        {
          id: 'scene-3',
          title: 'Nexus Core Ignition',
          prompt: 'Dolly zoom vertigo pushing towards a rogue android gazing into a quantum reactor core',
          cameraPresetId: 'dolly_zoom_vertigo',
          modelId: 'ltx_video',
          mediaType: 'image',
          duration: 3.0,
          startAt: 7.0,
          thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          captionText: 'SINGULARITY INEVITABLE',
          status: 'ready',
        },
      ];
    } else {
      newScenes = [
        {
          id: 'scene-1',
          title: 'Event Horizon Approach',
          prompt: 'Deep space exploration cruiser drifting towards a supermassive black hole with iridescent accretion disk',
          cameraPresetId: 'orbital_drift',
          modelId: 'flux_video',
          mediaType: 'image',
          duration: 3.5,
          startAt: 0,
          thumbnailUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
          captionText: 'INTERSTELLAR FRONTIER',
          status: 'ready',
        },
        {
          id: 'scene-2',
          title: 'Planetary Atmospheric Entry',
          prompt: 'Ship heat shield glowing orange in violent atmospheric reentry over alien glacial mountain ranges',
          cameraPresetId: 'fpv_dive',
          modelId: 'kling_1_5',
          mediaType: 'image',
          duration: 3.5,
          startAt: 3.5,
          thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          captionText: 'SURFACE DESCENT',
          status: 'ready',
        },
        {
          id: 'scene-3',
          title: 'Alien Oasis Monolith',
          prompt: 'Overhead crane rising over a crystal valley revealing a dormant titan structure reflected in still waters',
          cameraPresetId: 'crane_shot',
          modelId: 'ltx_video',
          mediaType: 'image',
          duration: 3.0,
          startAt: 7.0,
          thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
          captionText: 'TITAN SANCTUARY DISCOVERED',
          status: 'ready',
        },
      ];
    }

    set({
      scenes: newScenes,
      duration: 10,
      currentTime: 0,
      activeSceneIndex: 0,
      activeCameraCurveId: newScenes[0].cameraPresetId,
    });

    get().updateNodeData('node-prompt', {
      subject: newScenes[0].prompt,
    });
    get().updateNodeData('node-camera', {
      presetId: newScenes[0].cameraPresetId,
    });
  },

  loadPresetWorkflow: (presetKey: string) => {
    if (presetKey === 'cyberpunk_reel') {
      set({
        nodes: INITIAL_NODES,
        edges: INITIAL_EDGES,
        scenes: INITIAL_SCENES,
        captions: INITIAL_CAPTIONS,
        audioWaveform: INITIAL_WAVEFORM,
        duration: 10,
        currentTime: 0,
        activeSceneIndex: 0,
        activeCameraCurveId: 'orbital_drift',
        bpm: 120,
      });
    }
  },
}));

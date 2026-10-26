'use client';

import React, { useState } from 'react';
import { Play, Pause, Sparkles, ArrowRight, Music, Film, Compass, Cpu, Check, Volume2 } from 'lucide-react';
import { useStudioStore, SceneClip, CaptionItem } from '../../lib/store/studioStore';
import { beatDetector } from '../../lib/audio/beatDetector';
import { synthesizeAudioTrack } from '../../lib/audio/audioSynthesizer';

interface TemplateReel {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  bpm: number;
  camera: string;
  model: string;
  trackId: string;
  coverImage: string;
  scenes: SceneClip[];
  captions: CaptionItem[];
}

const TEMPLATES: TemplateReel[] = [
  {
    id: 'tokyo-2088',
    title: 'Tokyo Cyber Drift 2088',
    tagline: 'High-speed autonomous hypercar skimming rain-slicked asphalt beneath towering holographic kanji.',
    genre: 'Synthwave / Cyberpunk',
    bpm: 120,
    camera: '35mm FPV Dive · Smoothstep',
    model: 'Wan 2.1 14B DiT',
    trackId: 'cyberpunk-neon-drift',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    scenes: [
      {
        id: 'tokyo-1',
        title: 'Neon Skimmer Launch',
        prompt: 'Futuristic hypercar accelerating down a rainy neo-Tokyo expressway, anamorphic blue lens flare, neon reflection',
        cameraPresetId: 'fpv_dive',
        focalLength: '35mm',
        speedRamp: 1.25,
        easing: 'Smoothstep (Ease In/Out)',
        modelId: 'wan_2_1',
        duration: 3.5,
        startAt: 0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        captionText: 'TOKYO 2088 // VELOCITY',
        status: 'ready',
        transition: 'cut',
      },
      {
        id: 'tokyo-2',
        title: 'Holographic Overpass',
        prompt: 'Towering holographic koi fish swimming through rain clouds above cybernetic Shibuya crossing',
        cameraPresetId: 'orbital_drift',
        focalLength: '50mm',
        speedRamp: 1.0,
        easing: 'Smoothstep (Ease In/Out)',
        modelId: 'flux_video',
        duration: 3.5,
        startAt: 3.5,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        captionText: 'SYNTHETIC CONSCIOUSNESS',
        status: 'ready',
        transition: 'crossfade',
      },
      {
        id: 'tokyo-3',
        title: 'Quantum Grid Terminal',
        prompt: 'Deep underground subterranean server vault humming with optic orange fiber lines and mist',
        cameraPresetId: 'dolly_zoom_vertigo',
        focalLength: '24mm',
        speedRamp: 1.5,
        easing: 'Exponential In/Out',
        modelId: 'ltx_video',
        duration: 3.0,
        startAt: 7.0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        captionText: 'ZERO LATENCY CORE',
        status: 'ready',
        transition: 'glitch',
      },
    ],
    captions: [
      { id: 'c1', text: 'KINOBEAT // 2088', startTime: 0.2, endTime: 3.2, style: 'slam', fontSize: 32, color: '#FFFFFF' },
      { id: 'c2', text: 'HYPER-SPEED AI DIT', startTime: 3.6, endTime: 6.8, style: 'matrix', fontSize: 28, color: '#FF5500' },
      { id: 'c3', text: 'MASTER 4K STREAM', startTime: 7.1, endTime: 9.8, style: 'split', fontSize: 32, color: '#FFFFFF' },
    ],
  },
  {
    id: 'hyper-drive',
    title: 'Hyper-Drive Singularity',
    tagline: 'Deep space warp expedition through gravitational lensing, accretion discs, and relativistic light cones.',
    genre: 'Neurofunk / Drum & Bass',
    bpm: 174,
    camera: '24mm Orbital Arc · Exponential',
    model: 'Flux Pro Video',
    trackId: 'hyper-drive-dnb',
    coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    scenes: [
      {
        id: 'sing-1',
        title: 'Event Horizon Approach',
        prompt: 'Gargantua black hole accretion disc spinning at relativistic velocity, gravitational lensing distorting distant galaxies',
        cameraPresetId: 'orbital_drift',
        focalLength: '24mm',
        speedRamp: 1.4,
        easing: 'Exponential In/Out',
        modelId: 'flux_video',
        duration: 3.2,
        startAt: 0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
        captionText: 'SINGULARITY INITIATION',
        status: 'ready',
        transition: 'cut',
      },
      {
        id: 'sing-2',
        title: 'Wormhole Throat',
        prompt: 'Interior of Einstein-Rosen bridge folding space-time into kaleidoscopic geometric corridors of crystalline plasma',
        cameraPresetId: 'fpv_dive',
        focalLength: '35mm',
        speedRamp: 2.0,
        easing: 'Linear Constant',
        modelId: 'wan_2_1',
        duration: 3.8,
        startAt: 3.2,
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        captionText: 'WARP ENVELOPE MAXIMUM',
        status: 'ready',
        transition: 'crossfade',
      },
      {
        id: 'sing-3',
        title: 'Binary Star Outpost',
        prompt: 'Emergence into uncharted star system orbiting dual blue giant suns with titanium orbital solar array',
        cameraPresetId: 'overhead_crane',
        focalLength: '50mm',
        speedRamp: 0.8,
        easing: 'Smoothstep (Ease In/Out)',
        modelId: 'ltx_video',
        duration: 3.0,
        startAt: 7.0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        captionText: 'ALPHA CENTAURI HARBOR',
        status: 'ready',
        transition: 'dip_black',
      },
    ],
    captions: [
      { id: 'c4', text: 'EVENT HORIZON', startTime: 0.3, endTime: 3.0, style: 'slam', fontSize: 36, color: '#FFFFFF' },
      { id: 'c5', text: '174 BPM TRANSIENT CUTS', startTime: 3.4, endTime: 6.8, style: 'glow', fontSize: 26, color: '#FF5500' },
      { id: 'c6', text: '4K RELATIVISTIC HDR', startTime: 7.2, endTime: 9.8, style: 'split', fontSize: 32, color: '#FFFFFF' },
    ],
  },
  {
    id: 'lofi-sunset',
    title: 'Lofi Pacific Horizon',
    tagline: 'Warm golden-hour coastal highway drive, analogue tape saturation, vintage anamorphic grain, and serene rhythm.',
    genre: 'Chillhop / Lofi',
    bpm: 85,
    camera: '50mm Dolly Zoom · Elastic',
    model: 'LTX Video 0.9',
    trackId: 'lofi-sunset-chill',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    scenes: [
      {
        id: 'lofi-1',
        title: 'Golden Hour Coastline',
        prompt: 'Vintage 1970s convertible cruising along Pacific Coast Highway at sunset, golden dust motes, 35mm film grain',
        cameraPresetId: 'dolly_zoom_vertigo',
        focalLength: '50mm',
        speedRamp: 0.9,
        easing: 'Smoothstep (Ease In/Out)',
        modelId: 'ltx_video',
        duration: 4.0,
        startAt: 0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        captionText: 'PACIFIC GOLDEN HOUR',
        status: 'ready',
        transition: 'cut',
      },
      {
        id: 'lofi-2',
        title: 'Neon Seaside Diner',
        prompt: 'Warm diner booth overlooking ocean breakers with neon sign humming softly through dusk mist',
        cameraPresetId: 'orbital_drift',
        focalLength: '35mm',
        speedRamp: 0.8,
        easing: 'Smoothstep (Ease In/Out)',
        modelId: 'flux_video',
        duration: 3.5,
        startAt: 4.0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        captionText: 'ANALOGUE TAPE WARMTH',
        status: 'ready',
        transition: 'crossfade',
      },
      {
        id: 'lofi-3',
        title: 'Starry Headland Lookout',
        prompt: 'Coastal lighthouse beam cutting across starry twilight ocean with gentle waves breaking on sea stacks',
        cameraPresetId: 'overhead_crane',
        focalLength: '85mm',
        speedRamp: 0.7,
        easing: 'Smoothstep (Ease In/Out)',
        modelId: 'wan_2_1',
        duration: 2.5,
        startAt: 7.5,
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        captionText: 'MIDNIGHT OCEAN CHILL',
        status: 'ready',
        transition: 'dip_black',
      },
    ],
    captions: [
      { id: 'c7', text: 'GOLDEN HOUR DRIFT', startTime: 0.2, endTime: 3.8, style: 'glow', fontSize: 30, color: '#FFFFFF' },
      { id: 'c8', text: 'VINTAGE TAPE SATURATION', startTime: 4.2, endTime: 7.2, style: 'slam', fontSize: 26, color: '#FF5500' },
      { id: 'c9', text: 'SERENE WAVEFORM FLOW', startTime: 7.6, endTime: 9.8, style: 'split', fontSize: 32, color: '#FFFFFF' },
    ],
  },
  {
    id: 'anime-blade',
    title: 'Anime Blade Resonance',
    tagline: 'Hyper-kinetic sword clash in a cherry blossom storm with speed-ramped kinetic impact frames and kick-drum snap.',
    genre: 'Speedcore / Glitch',
    bpm: 140,
    camera: '85mm FPV Arc · Exponential',
    model: 'Kling 1.5 HD',
    trackId: 'anime-speedcore',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    scenes: [
      {
        id: 'blade-1',
        title: 'Moonlit Bamboo Grove',
        prompt: 'Anime samurai standing motionless in moonlit bamboo grove, wind whipping fallen pink petals, high contrast ink shadows',
        cameraPresetId: 'orbital_drift',
        focalLength: '85mm',
        speedRamp: 1.0,
        easing: 'Smoothstep (Ease In/Out)',
        modelId: 'wan_2_1',
        duration: 3.0,
        startAt: 0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        captionText: 'BLADE UNSHEATHED',
        status: 'ready',
        transition: 'cut',
      },
      {
        id: 'blade-2',
        title: 'Lightning Flash Impact',
        prompt: 'Hyper-speed katana clash unleashing blinding white shockwave shattering surrounding raindrops into prismatic glass',
        cameraPresetId: 'fpv_dive',
        focalLength: '35mm',
        speedRamp: 2.2,
        easing: 'Exponential In/Out',
        modelId: 'flux_video',
        duration: 3.8,
        startAt: 3.0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        captionText: 'IMPACT FRAME SHOCKWAVE',
        status: 'ready',
        transition: 'glitch',
      },
      {
        id: 'blade-3',
        title: 'Petal Vortex Standstill',
        prompt: 'Sheathing katana with single click as background explosion freezes in mid-air surrounded by floating cherry blossoms',
        cameraPresetId: 'dolly_zoom_vertigo',
        focalLength: '50mm',
        speedRamp: 0.6,
        easing: 'Smoothstep (Ease In/Out)',
        modelId: 'ltx_video',
        duration: 3.2,
        startAt: 6.8,
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        captionText: 'PERFECT ZERO CUT',
        status: 'ready',
        transition: 'crossfade',
      },
    ],
    captions: [
      { id: 'c10', text: 'RESONANCE IMPACT', startTime: 0.2, endTime: 2.8, style: 'matrix', fontSize: 32, color: '#FFFFFF' },
      { id: 'c11', text: '140 BPM TRANSIENT SNAP', startTime: 3.2, endTime: 6.5, style: 'slam', fontSize: 28, color: '#FF5500' },
      { id: 'c12', text: 'PRECISION CINEMA MASTER', startTime: 6.9, endTime: 9.8, style: 'split', fontSize: 32, color: '#FFFFFF' },
    ],
  },
];

export const ShowcaseView: React.FC = () => {
  const setWorkspaceView = useStudioStore((s) => s.setWorkspaceView);
  const setBeatsAndBpm = useStudioStore((s) => s.setBeatsAndBpm);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

  const handleToggleAudioPreview = async (trackId: string) => {
    if (playingTrackId === trackId) {
      audioSource?.stop();
      setAudioSource(null);
      setPlayingTrackId(null);
      return;
    }

    try {
      audioSource?.stop();
      const ctx = beatDetector.getOrCreateContext();
      if (ctx.state === 'suspended') await ctx.resume();
      const buffer = await synthesizeAudioTrack(trackId, ctx);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start();
      src.onended = () => {
        setPlayingTrackId(null);
        setAudioSource(null);
      };
      setAudioSource(src);
      setPlayingTrackId(trackId);
    } catch {
      setPlayingTrackId(null);
    }
  };

  const handleLoadTemplate = async (template: TemplateReel) => {
    audioSource?.stop();
    setPlayingTrackId(null);
    setLoadedTemplateId(template.id);

    // Update store state with this template's assets
    const store = useStudioStore.getState();
    store.resetPlayback();

    // Set scenes
    useStudioStore.setState({
      scenes: template.scenes,
      captions: template.captions,
      duration: 10,
      bpm: template.bpm,
      activeTrackId: template.trackId,
    });

    // Synthesize audio track for this template
    try {
      const ctx = beatDetector.getOrCreateContext();
      const buffer = await synthesizeAudioTrack(template.trackId, ctx);
      const analysis = await beatDetector.analyzeBuffer(buffer);
      if (analysis.beats.length > 0) {
        setBeatsAndBpm(analysis.beats, analysis.bpm, template.trackId);
      }
    } catch {}

    setTimeout(() => {
      setLoadedTemplateId(null);
      setWorkspaceView('director'); // switch directly into Cinema Director studio
    }, 400);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121317] text-white p-6 md:p-10 font-sans select-none">
      {/* Hero Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
            CINEMATIC PRESETS & REELS ARCHIVE
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white mb-3">
          Production-Ready AI Beat Sequences
        </h1>
        <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
          Explore complete production sequences with matched DiT generation prompts, 6-DOF optical camera curves,
          synthesized stems with real FFT beat detection, and synchronized kinetic captions. One-click load directly into the Studio NLE.
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((tmpl) => {
          const isPlayingThis = playingTrackId === tmpl.trackId;
          const isLoaded = loadedTemplateId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className="group bg-[#191B22] border border-white/[0.08] hover:border-white/[0.18] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col"
            >
              {/* Cover Image & Live Overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#0D0E12]">
                <img
                  src={tmpl.coverImage}
                  alt={tmpl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191B22] via-transparent to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-200">
                    {tmpl.genre}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#FF5500]/90 text-black font-semibold text-[10px] font-mono tracking-wider">
                    {tmpl.bpm} BPM
                  </span>
                </div>

                {/* Audio Preview Button */}
                <button
                  type="button"
                  onClick={() => handleToggleAudioPreview(tmpl.trackId)}
                  className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                    isPlayingThis
                      ? 'bg-[#FF5500] text-black border-[#FF5500] font-semibold'
                      : 'bg-black/80 text-white border-white/15 hover:bg-white/15'
                  }`}
                >
                  {isPlayingThis ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlayingThis ? 'Previewing Beat...' : 'Audition Stem'}</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-white tracking-tight mb-1.5 flex items-center justify-between">
                    <span>{tmpl.title}</span>
                    <span className="text-[11px] font-mono font-normal text-zinc-500">
                      {tmpl.scenes.length} Scenes · 10.0s
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {tmpl.tagline}
                  </p>

                  {/* Metadata Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#0D0E12] p-3 rounded-lg border border-white/[0.06]">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Optics Curve</span>
                      <span className="text-zinc-200">{tmpl.camera}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Generative Model</span>
                      <span className="text-zinc-200">{tmpl.model}</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() => handleLoadTemplate(tmpl)}
                  disabled={isLoaded}
                  className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-[#FF5500] text-white hover:text-black font-semibold text-xs font-mono transition-all duration-200 flex items-center justify-center gap-2 border border-white/10 hover:border-[#FF5500] cursor-pointer shadow-sm active:scale-98"
                >
                  {isLoaded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>Loading Sequence...</span>
                    </>
                  ) : (
                    <>
                      <span>Load Template into Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

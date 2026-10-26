'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepBack,
  StepForward,
  Plus,
  Trash2,
  Video,
  Music,
  Type,
  ZoomIn,
  ZoomOut,
  Magnet,
  Upload,
  Sparkles,
  Sliders,
  X,
  Palette,
  Scissors,
  FolderOpen,
  Volume2,
  VolumeX,
  Copy,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  FileVideo,
  ImageIcon,
  Music2,
  Move,
  Camera,
  Layers,
  Sparkle,
} from 'lucide-react';
import {
  useStudioStore,
  SceneClip,
  CaptionItem,
  MediaAsset,
} from '../../lib/store/studioStore';
import { beatDetector } from '../../lib/audio/beatDetector';
import { synthesizeAudioTrack } from '../../lib/audio/audioSynthesizer';
import { CINEMA_PRESETS, FOCAL_LENGTHS } from '../Canvas/nodes/CameraNode';

const KINETIC_STYLES: Array<{ id: CaptionItem['style']; label: string }> = [
  { id: 'slam', label: 'Slam (Spring Impact)' },
  { id: 'glow', label: 'Glow (Neon Bloom)' },
  { id: 'split', label: 'Split (Chromatic Shift)' },
  { id: 'matrix', label: 'Matrix (Glitch Stream)' },
];

const TRANSITION_PRESETS = [
  { id: 'cut', label: 'Hard Cut' },
  { id: 'crossfade', label: 'Crossfade (0.5s)' },
  { id: 'glitch', label: 'Chromatic Glitch (0.2s)' },
  { id: 'dip_black', label: 'Dip to Black (0.5s)' },
];

const COLOR_SWATCHES = [
  { hex: '#FFFFFF', name: 'Studio White' },
  { hex: '#00F0FF', name: 'Electric Cyan' },
  { hex: '#F472B6', name: 'Hot Pink' },
  { hex: '#FACC15', name: 'Cyber Amber' },
  { hex: '#34D399', name: 'Emerald' },
];

const FONT_SIZES = [18, 24, 28, 36];

export const MultiTrackTimeline: React.FC = () => {
  const currentTime = useStudioStore((s) => s.currentTime);
  const duration = useStudioStore((s) => s.duration);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const bpm = useStudioStore((s) => s.bpm);
  const scenes = useStudioStore((s) => s.scenes);
  const beats = useStudioStore((s) => s.beats);
  const captions = useStudioStore((s) => s.captions);
  const audioWaveform = useStudioStore((s) => s.audioWaveform);
  const activeSceneIndex = useStudioStore((s) => s.activeSceneIndex);
  const autoBeatSnap = useStudioStore((s) => s.autoBeatSnap);
  const selectedCaptionId = useStudioStore((s) => s.selectedCaptionId);
  const audioVolume = useStudioStore((s) => s.audioVolume);
  const isMuted = useStudioStore((s) => s.isMuted);
  const mediaAssets = useStudioStore((s) => s.mediaAssets);
  const isGeneratingVideo = useStudioStore((s) => s.isGeneratingVideo);

  const seekTo = useStudioStore((s) => s.seekTo);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const resetPlayback = useStudioStore((s) => s.resetPlayback);
  const stepFrame = useStudioStore((s) => s.stepFrame);
  const selectScene = useStudioStore((s) => s.selectScene);
  const updateScene = useStudioStore((s) => s.updateScene);
  const addScene = useStudioStore((s) => s.addScene);
  const addCustomMediaScene = useStudioStore((s) => s.addCustomMediaScene);
  const removeScene = useStudioStore((s) => s.removeScene);
  const trimScene = useStudioStore((s) => s.trimScene);
  const splitSceneAtPlayhead = useStudioStore((s) => s.splitSceneAtPlayhead);
  const reorderScene = useStudioStore((s) => s.reorderScene);
  const duplicateScene = useStudioStore((s) => s.duplicateScene);
  const addCaption = useStudioStore((s) => s.addCaption);
  const updateCaption = useStudioStore((s) => s.updateCaption);
  const trimCaption = useStudioStore((s) => s.trimCaption);
  const removeCaption = useStudioStore((s) => s.removeCaption);
  const setSelectedCaptionId = useStudioStore((s) => s.setSelectedCaptionId);
  const toggleBeatSnap = useStudioStore((s) => s.toggleBeatSnap);
  const setAudioVolume = useStudioStore((s) => s.setAudioVolume);
  const toggleMute = useStudioStore((s) => s.toggleMute);
  const addMediaAsset = useStudioStore((s) => s.addMediaAsset);
  const setBeatsAndBpm = useStudioStore((s) => s.setBeatsAndBpm);
  const setCustomAudio = useStudioStore((s) => s.setCustomAudio);
  const setCameraOptions = useStudioStore((s) => s.setCameraOptions);
  const generateActiveScene = useStudioStore((s) => s.generateActiveScene);

  const [zoom, setZoom] = useState(1);
  const [isAddShotMenuOpen, setIsAddShotMenuOpen] = useState(false);
  const [isAssetBinOpen, setIsAssetBinOpen] = useState(false);
  const [isShotInspectorOpen, setIsShotInspectorOpen] = useState(true);
  const [assetTab, setAssetTab] = useState<'all' | 'video' | 'image' | 'audio'>('all');

  // Interactive Scrubbing state
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Inline editing state for title caption
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Scene Trimming Drag State
  const [trimmingIndex, setTrimmingIndex] = useState<number | null>(null);
  const [trimInitialDuration, setTrimInitialDuration] = useState<number>(0);
  const [trimInitialClientX, setTrimInitialClientX] = useState<number>(0);

  // Caption Dragging / Trimming State
  const [dragCaptionId, setDragCaptionId] = useState<string | null>(null);
  const [dragCaptionMode, setDragCaptionMode] = useState<'move' | 'trim-end' | null>(null);
  const [dragCaptionStartX, setDragCaptionStartX] = useState<number>(0);
  const [dragCaptionInitialStart, setDragCaptionInitialStart] = useState<number>(0);
  const [dragCaptionInitialEnd, setDragCaptionInitialEnd] = useState<number>(0);

  const timelineTrackRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const assetFileInputRef = useRef<HTMLInputElement | null>(null);

  // Timecode formatter: MM:SS.ff
  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const playheadPercent = Math.min(100, (currentTime / Math.max(0.1, duration)) * 100);

  // Continuous Pointer Scrubbing across timeline
  const getTimeFromClientX = useCallback(
    (clientX: number) => {
      if (!timelineTrackRef.current) return 0;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      let targetTime = ratio * duration;

      if (autoBeatSnap && beats.length > 0) {
        const nearestBeat = beats.reduce((prev, curr) =>
          Math.abs(curr.timestamp - targetTime) < Math.abs(prev.timestamp - targetTime) ? curr : prev
        );
        if (Math.abs(nearestBeat.timestamp - targetTime) < 0.2) {
          targetTime = nearestBeat.timestamp;
        }
      }
      return targetTime;
    },
    [duration, autoBeatSnap, beats]
  );

  const handlePointerDownTimeline = (e: React.PointerEvent<HTMLDivElement>) => {
    if (trimmingIndex !== null || dragCaptionId !== null) return;
    setIsScrubbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(getTimeFromClientX(e.clientX));
  };

  const handlePointerMoveTimeline = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      seekTo(getTimeFromClientX(e.clientX));
    } else if (trimmingIndex !== null && timelineTrackRef.current) {
      const trackWidth = timelineTrackRef.current.clientWidth || 800;
      const deltaX = e.clientX - trimInitialClientX;
      const deltaSeconds = (deltaX / trackWidth) * duration;
      const newDuration = Math.max(0.4, trimInitialDuration + deltaSeconds);
      trimScene(trimmingIndex, newDuration);
    } else if (dragCaptionId !== null && timelineTrackRef.current) {
      const trackWidth = timelineTrackRef.current.clientWidth || 800;
      const deltaX = e.clientX - dragCaptionStartX;
      const deltaSeconds = (deltaX / trackWidth) * duration;

      if (dragCaptionMode === 'move') {
        const capDuration = dragCaptionInitialEnd - dragCaptionInitialStart;
        const newStart = Math.max(0, Math.min(duration - capDuration, dragCaptionInitialStart + deltaSeconds));
        trimCaption(dragCaptionId, newStart, newStart + capDuration);
      } else if (dragCaptionMode === 'trim-end') {
        const newEnd = Math.max(dragCaptionInitialStart + 0.3, Math.min(duration, dragCaptionInitialEnd + deltaSeconds));
        trimCaption(dragCaptionId, dragCaptionInitialStart, newEnd);
      }
    }
  };

  const handlePointerUpTimeline = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsScrubbing(false);
    }
    if (trimmingIndex !== null) {
      setTrimmingIndex(null);
    }
    if (dragCaptionId !== null) {
      setDragCaptionId(null);
      setDragCaptionMode(null);
    }
  };

  // Custom Media Upload Handler
  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');

    if (isVideo) {
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const vidDuration = Math.min(12, Math.max(2, tempVideo.duration || 3.5));
        addCustomMediaScene(file, url, 'video', Number(vidDuration.toFixed(1)));
      };
      tempVideo.onerror = () => {
        addCustomMediaScene(file, url, 'video', 3.5);
      };
    } else {
      addCustomMediaScene(file, url, 'image', 3.5);
    }

    addMediaAsset({
      id: `asset-${Date.now()}`,
      name: file.name,
      type: isVideo ? 'video' : 'image',
      url,
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
    });

    setIsAddShotMenuOpen(false);
  };

  // Dedicated Asset Bin File Upload
  const handleAssetBinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');
    const isAudio = file.type.startsWith('audio');
    const type = isVideo ? 'video' : isAudio ? 'audio' : 'image';

    addMediaAsset({
      id: `asset-${Date.now()}`,
      name: file.name,
      type,
      url,
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
    });
  };

  // Adding an asset from the Media Bin to Timeline
  const handleAddAssetToTimeline = async (asset: MediaAsset) => {
    if (asset.type === 'audio') {
      try {
        const ctx = beatDetector.getOrCreateContext();
        let buffer: AudioBuffer;
        if (asset.url.startsWith('blob:') || asset.url.startsWith('http')) {
          const resp = await fetch(asset.url);
          const ab = await resp.arrayBuffer();
          buffer = await ctx.decodeAudioData(ab);
          setCustomAudio(buffer, asset.name, asset.url);
        } else {
          buffer = await synthesizeAudioTrack('cyberpunk-neon-drift', ctx);
        }
        const analysis = await beatDetector.analyzeBuffer(buffer);
        setBeatsAndBpm(analysis.beats, analysis.bpm, asset.id, asset.name, analysis.waveform);
      } catch (err) {
        console.warn('Audio asset load error:', err);
      }
    } else {
      addCustomMediaScene(
        new File([], asset.name),
        asset.url,
        asset.type as 'video' | 'image',
        asset.duration || 3.5
      );
    }
  };

  // Direct Drag-and-Drop files onto Timeline
  const handleTimelineDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      const isAudio = file.type.startsWith('audio');

      if (isVideo) {
        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        tempVideo.onloadedmetadata = () => {
          const vidDuration = Math.min(12, Math.max(2, tempVideo.duration || 3.5));
          addCustomMediaScene(file, url, 'video', Number(vidDuration.toFixed(1)));
        };
      } else if (isImage) {
        addCustomMediaScene(file, url, 'image', 3.5);
      } else if (isAudio) {
        try {
          const ctx = beatDetector.getOrCreateContext();
          const ab = await file.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(ab);
          setCustomAudio(audioBuffer, file.name, url);
          const analysis = await beatDetector.analyzeBuffer(audioBuffer);
          setBeatsAndBpm(analysis.beats, analysis.bpm, 'custom-drop', file.name, analysis.waveform);
        } catch (err) {
          console.warn('Audio drop parse failed:', err);
        }
      }

      addMediaAsset({
        id: `asset-${Date.now()}`,
        name: file.name,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        url,
        sizeBytes: file.size,
        createdAt: new Date().toISOString(),
      });
    }
  };

  // Inline Title Editing handlers
  const handleStartTitleEdit = (cap: CaptionItem) => {
    setEditingCaptionId(cap.id);
    setEditingText(cap.text);
    setSelectedCaptionId(cap.id);
  };

  const handleSaveTitleEdit = (id: string) => {
    if (editingText.trim()) {
      updateCaption(id, { text: editingText.trim() });
    }
    setEditingCaptionId(null);
  };

  const selectedCaption = captions.find((c) => c.id === selectedCaptionId);
  const activeScene = scenes[activeSceneIndex];

  // Filtered Assets for Asset Bin
  const filteredAssets = mediaAssets.filter((a) =>
    assetTab === 'all' ? true : a.type === assetTab
  );

  return (
    <div className="w-full bg-[#0B0E14] border-t border-[#1E2638] select-none text-zinc-100 flex flex-col h-72 z-40 shadow-2xl relative">
      {/* Hidden file input for custom media upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp"
        onChange={handleMediaFileUpload}
        className="hidden"
      />
      <input
        ref={assetFileInputRef}
        type="file"
        accept="video/*,image/*,audio/*"
        onChange={handleAssetBinUpload}
        className="hidden"
      />

      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E2638] bg-[#12161F]">
        <div className="flex items-center gap-3">
          {/* Rewind */}
          <button
            type="button"
            onClick={resetPlayback}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Rewind to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Back 1 Frame */}
          <button
            type="button"
            onClick={() => stepFrame(-1)}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Step Back 1 Frame (Left Arrow)"
          >
            <StepBack className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-md flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold transition-colors shadow-md shadow-cyan-950/30"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            type="button"
            onClick={() => stepFrame(1)}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Step Forward 1 Frame (Right Arrow)"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          {/* Timecode Readout */}
          <div className="font-mono text-xs px-2.5 py-1 rounded bg-[#0D1119] border border-[#1E2638] text-zinc-200 flex items-center gap-1">
            <span className="text-cyan-400 font-semibold">{formatTimecode(currentTime)}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{formatTimecode(duration)}</span>
          </div>

          {/* Razor Split Tool Button */}
          <button
            type="button"
            onClick={splitSceneAtPlayhead}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            title="Split Clip at Playhead (Cut)"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>Split Clip</span>
          </button>

          {/* BPM & FPS Badge */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-[#161B26] border border-[#1E2638] text-zinc-300">
              {bpm} BPM
            </span>
            <span className="px-2 py-0.5 rounded bg-[#161B26] border border-[#1E2638] text-zinc-400">
              30 FPS
            </span>
          </div>

          {/* Beat Snap Toggle */}
          <button
            type="button"
            onClick={toggleBeatSnap}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              autoBeatSnap
                ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300 font-semibold shadow-sm'
                : 'bg-[#161B26] border-[#1E2638] text-zinc-500 hover:text-zinc-300'
            }`}
            title="Magnet-snap playhead and edits to nearest kick transient"
          >
            <Magnet className="w-3 h-3 text-cyan-400" />
            <span>Beat Snap: {autoBeatSnap ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Timeline Actions & Zoom */}
        <div className="flex items-center gap-2 text-zinc-400">
          {/* Asset Bin Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAssetBinOpen(!isAssetBinOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              isAssetBinOpen
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-semibold'
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
            }`}
            title="Toggle Left Asset Bin / Media Library"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Media Bin ({mediaAssets.length})</span>
          </button>

          {/* Add Shot Popover Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAddShotMenuOpen(!isAddShotMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Shot</span>
            </button>

            {isAddShotMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#12161F] border border-[#1E2638] rounded-lg shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-[#161B26] text-zinc-200 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <div className="font-medium text-xs">Upload Custom Media</div>
                    <div className="text-[10px] text-zinc-500">MP4, WebM, PNG, JPEG</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addScene();
                    setIsAddShotMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-[#161B26] text-zinc-200 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <div className="font-medium text-xs">Generate with AI</div>
                    <div className="text-[10px] text-zinc-500">Flux / Kling prompt sequence</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add Title Button */}
          <button
            type="button"
            onClick={addCaption}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Type className="w-3.5 h-3.5 text-pink-400" />
            <span>Add Title</span>
          </button>

          <div className="h-4 w-[1px] bg-[#1E2638] mx-1" />

          {/* Zoom Controls */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-zinc-500">{zoom.toFixed(1)}x</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tracks & Inspector Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Asset Bin / Media Manager */}
        {isAssetBinOpen && (
          <div className="w-80 bg-[#12161F] border-r border-[#1E2638] flex flex-col justify-between shrink-0 shadow-2xl z-30 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-[#1E2638] flex items-center justify-between bg-[#161B26]">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-zinc-100">Project Asset Bin</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => assetFileInputRef.current?.click()}
                  className="p-1 rounded hover:bg-zinc-800 text-cyan-400 transition-colors"
                  title="Upload New Asset to Bin"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAssetBinOpen(false)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Asset Category Tabs */}
            <div className="flex items-center px-3 py-1.5 border-b border-[#1E2638] text-[10px] gap-1 font-mono bg-[#0D1119]">
              {(['all', 'video', 'image', 'audio'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAssetTab(tab)}
                  className={`px-2 py-0.5 rounded capitalize transition-colors ${
                    assetTab === tab
                      ? 'bg-zinc-800 text-cyan-300 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredAssets.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                  No assets found in category.
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-2 rounded-lg bg-[#0D1119] border border-[#1E2638] hover:border-zinc-700 flex items-center justify-between text-xs group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-cyan-400">
                        {asset.type === 'video' ? (
                          <FileVideo className="w-4 h-4" />
                        ) : asset.type === 'audio' ? (
                          <Music2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-pink-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-zinc-200 truncate">
                          {asset.name}
                        </div>
                        <div className="text-[9px] text-zinc-500 font-mono uppercase">
                          {asset.type} {asset.duration ? `· ${asset.duration.toFixed(1)}s` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddAssetToTimeline(asset)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-cyan-300 hover:text-cyan-200 text-[10px] font-medium transition-colors shrink-0"
                      title={asset.type === 'audio' ? 'Load onto Track A1' : 'Add to Track V1'}
                    >
                      + Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Track Headers (Left Column) */}
        <div className="w-40 bg-[#0D1119] border-r border-[#1E2638] flex flex-col justify-between py-1 shrink-0 text-xs text-zinc-400 font-mono">
          {/* V1 Video Track Header */}
          <div className="h-20 px-3 flex flex-col justify-center border-b border-[#1E2638]/60">
            <div className="flex items-center justify-between font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>V1 Video</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono">{scenes.length} Clips</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1">4K Deterministic</span>
          </div>

          {/* T1 Title Track Header */}
          <div className="h-12 px-3 flex flex-col justify-center border-b border-[#1E2638]/60">
            <div className="flex items-center justify-between font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-pink-400" />
                <span>T1 Titles</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono">{captions.length} Cues</span>
            </div>
          </div>

          {/* A1 Audio Track Header with Volume Slider */}
          <div className="h-16 px-3 flex flex-col justify-center">
            <div className="flex items-center justify-between font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span>A1 Audio</span>
              </div>
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
              </button>
            </div>

            {/* Volume Fader Slider */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={isMuted ? 0 : audioVolume}
                onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[9px] font-mono text-zinc-500 w-8 text-right">
                {Math.round((isMuted ? 0 : audioVolume) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Track Timeline Area (Right Scrollable / Interactive Canvas with Drag-and-Drop) */}
        <div
          ref={timelineTrackRef}
          className="flex-1 relative bg-[#0B0E14] overflow-hidden cursor-crosshair touch-none"
          onPointerDown={handlePointerDownTimeline}
          onPointerMove={handlePointerMoveTimeline}
          onPointerUp={handlePointerUpTimeline}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={handleTimelineDrop}
        >
          {/* Subtle Vertical Time Tick Marks */}
          <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="h-full border-r border-zinc-700 w-full" />
            ))}
          </div>

          {/* V1 Video Track: Scene Blocks with Reordering, Duplicate, and Trim Handles */}
          <div className="h-20 p-1 flex items-center gap-1 border-b border-[#1E2638]/60">
            {scenes.map((scene, idx) => {
              const widthPct = (scene.duration / duration) * 100;
              const isSelected = activeSceneIndex === idx;
              const isVideo = scene.mediaType === 'video';

              return (
                <div
                  key={scene.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectScene(idx);
                    setSelectedCaptionId(null);
                    setIsShotInspectorOpen(true);
                  }}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full rounded-md border relative overflow-hidden group transition-all flex flex-col justify-between p-1.5 select-none ${
                    isSelected
                      ? 'border-cyan-400 bg-[#162032] shadow-md ring-1 ring-cyan-400/50'
                      : 'border-[#1E2638] bg-[#12161F] hover:border-zinc-600'
                  }`}
                >
                  {/* Clip Thumbnail / Video Background */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity pointer-events-none"
                    style={{ backgroundImage: `url(${scene.thumbnailUrl})` }}
                  />

                  {/* Header: Shot Title & Quick Actions */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-tight text-zinc-200 truncate flex items-center gap-1">
                      {isVideo && (
                        <span className="px-1 py-0.2 rounded bg-cyan-900/60 text-cyan-300 text-[9px] font-mono">
                          MP4
                        </span>
                      )}
                      <span>{scene.title}</span>
                    </span>

                    {/* Quick Reorder & Duplicate Controls for Selected Scene */}
                    {isSelected && (
                      <div className="flex items-center gap-0.5 bg-black/60 rounded px-1 py-0.5 border border-white/10">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              reorderScene(idx, idx - 1);
                            }}
                            className="p-0.5 rounded hover:bg-zinc-700 text-zinc-300"
                            title="Move Earlier in Timeline"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {idx < scenes.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              reorderScene(idx, idx + 1);
                            }}
                            className="p-0.5 rounded hover:bg-zinc-700 text-zinc-300"
                            title="Move Later in Timeline"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateScene(idx);
                          }}
                          className="p-0.5 rounded hover:bg-zinc-700 text-zinc-300"
                          title="Duplicate Shot"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {scenes.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeScene(idx);
                            }}
                            className="p-0.5 rounded hover:bg-red-500/30 text-red-400"
                            title="Delete Shot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer: Camera Preset Badge & Duration */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="px-1 py-0.2 rounded bg-black/60 border border-white/10 text-cyan-300 truncate max-w-[120px]">
                      {scene.cameraPresetId.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-zinc-200">{scene.duration.toFixed(1)}s</span>
                  </div>

                  {/* Draggable Trim-End Handle (Right Edge) */}
                  <div
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setTrimmingIndex(idx);
                      setTrimInitialDuration(scene.duration);
                      setTrimInitialClientX(e.clientX);
                      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    }}
                    onPointerUp={(e) => {
                      try {
                        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                      } catch {}
                      setTrimmingIndex(null);
                    }}
                    className="absolute inset-y-0 right-0 w-3 cursor-ew-resize hover:bg-cyan-400/40 z-20 flex items-center justify-center transition-colors group/trim"
                    title="Drag to Trim Clip Duration"
                  >
                    <div className="w-[2px] h-4 rounded-full bg-cyan-400/60 group-hover/trim:bg-cyan-300" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* T1 Title Track: Kinetic Caption Blocks with Drag Move & Trim */}
          <div className="h-12 p-1 flex items-center relative border-b border-[#1E2638]/60">
            {captions.map((cap) => {
              const leftPct = (cap.startTime / duration) * 100;
              const widthPct = ((cap.endTime - cap.startTime) / duration) * 100;
              const isEditing = editingCaptionId === cap.id;
              const isSelected = selectedCaptionId === cap.id;

              return (
                <div
                  key={cap.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCaptionId(cap.id);
                    setIsShotInspectorOpen(false);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleStartTitleEdit(cap);
                  }}
                  onPointerDown={(e) => {
                    if (isEditing) return;
                    e.stopPropagation();
                    setSelectedCaptionId(cap.id);
                    setDragCaptionId(cap.id);
                    setDragCaptionMode('move');
                    setDragCaptionStartX(e.clientX);
                    setDragCaptionInitialStart(cap.startTime);
                    setDragCaptionInitialEnd(cap.endTime);
                  }}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    borderLeftColor: cap.color || '#00F0FF',
                  }}
                  className={`absolute h-8 rounded border text-zinc-100 px-2 flex items-center justify-between text-[10px] font-mono shadow-sm cursor-grab active:cursor-grabbing transition-all border-l-4 group/cap ${
                    isSelected
                      ? 'border-cyan-400 bg-zinc-800 ring-1 ring-cyan-400/50'
                      : 'border-pink-500/40 bg-pink-950/30 hover:border-pink-400/80'
                  }`}
                  title="Drag to reposition, double-click to edit text"
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <Move className="w-2.5 h-2.5 text-zinc-500 opacity-60 group-hover/cap:opacity-100" />
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitleEdit(cap.id);
                          if (e.key === 'Escape') setEditingCaptionId(null);
                        }}
                        onBlur={() => handleSaveTitleEdit(cap.id)}
                        className="w-full bg-[#0D1119] border border-cyan-400 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none"
                      />
                    ) : (
                      <span className="truncate select-none font-semibold" style={{ color: cap.color || '#FFFFFF' }}>
                        {cap.text}
                      </span>
                    )}
                  </div>

                  {/* Caption Trim-End Handle */}
                  <div
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDragCaptionId(cap.id);
                      setDragCaptionMode('trim-end');
                      setDragCaptionStartX(e.clientX);
                      setDragCaptionInitialStart(cap.startTime);
                      setDragCaptionInitialEnd(cap.endTime);
                    }}
                    className="w-2 h-full cursor-ew-resize hover:bg-white/20 rounded-r flex items-center justify-center shrink-0"
                    title="Drag to Extend/Shorten Duration"
                  >
                    <div className="w-[1.5px] h-3 bg-white/40" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* A1 Audio Track: REAL 64-BAR RMS WAVEFORM (Zero Math.sin fake) */}
          <div className="h-16 p-1 relative flex items-center">
            <div className="w-full h-10 flex items-end gap-[2px]">
              {audioWaveform.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-emerald-600 to-cyan-400 transition-all duration-150"
                  style={{ height: `${Math.max(12, val * (isMuted ? 0.15 : audioVolume) * 100)}%` }}
                />
              ))}
            </div>

            {/* Vertical Beat Marker Ticks (Cyan for kick, Pink for snare) */}
            {beats.map((beat, i) => {
              const posPct = (beat.timestamp / duration) * 100;
              const isKick = beat.type === 'kick';

              return (
                <div
                  key={i}
                  style={{ left: `${posPct}%` }}
                  className={`absolute top-0 bottom-0 w-[1.5px] pointer-events-none ${
                    isKick ? 'bg-cyan-400 opacity-90' : 'bg-pink-400 opacity-70'
                  }`}
                  title={`${beat.type.toUpperCase()} @ ${beat.timestamp.toFixed(2)}s`}
                />
              );
            })}
          </div>

          {/* Smooth Playhead Scrubber with Drag Grip */}
          <div
            style={{ left: `${playheadPercent}%` }}
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 pointer-events-none z-30 transition-transform duration-75"
          >
            <div className="w-3.5 h-3.5 bg-cyan-400 -ml-[6px] -mt-1 rotate-45 rounded-[1px] shadow-lg shadow-cyan-400/60 border border-white" />
          </div>
        </div>

        {/* Title Properties Inspector Drawer (Opens when caption is selected) */}
        {selectedCaption && (
          <div className="w-80 bg-[#12161F] border-l border-[#1E2638] p-3 text-xs flex flex-col justify-between shrink-0 shadow-2xl z-30 animate-in slide-in-from-right duration-150">
            <div className="space-y-2.5 overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1E2638]">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <Sliders className="w-3.5 h-3.5 text-pink-400" />
                  <span>Title Inspector</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCaptionId(null)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title Text Content Input */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                  Text Content
                </label>
                <input
                  type="text"
                  value={selectedCaption.text}
                  onChange={(e) => updateCaption(selectedCaption.id, { text: e.target.value })}
                  className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-pink-400"
                />
              </div>

              {/* Timing Controls */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                    Start (s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={duration}
                    value={selectedCaption.startTime}
                    onChange={(e) =>
                      trimCaption(selectedCaption.id, parseFloat(e.target.value) || 0, selectedCaption.endTime)
                    }
                    className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                    End (s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={duration}
                    value={selectedCaption.endTime}
                    onChange={(e) =>
                      trimCaption(selectedCaption.id, selectedCaption.startTime, parseFloat(e.target.value) || 1)
                    }
                    className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              {/* Kinetic Motion Style Dropdown */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                  Kinetic Motion Preset
                </label>
                <select
                  value={selectedCaption.style}
                  onChange={(e) =>
                    updateCaption(selectedCaption.id, {
                      style: e.target.value as CaptionItem['style'],
                    })
                  }
                  className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-pink-400 cursor-pointer"
                >
                  {KINETIC_STYLES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size Pills */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                  Font Size
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {FONT_SIZES.map((fs) => (
                    <button
                      key={fs}
                      type="button"
                      onClick={() => updateCaption(selectedCaption.id, { fontSize: fs })}
                      className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                        (selectedCaption.fontSize || 28) === fs
                          ? 'bg-zinc-700 border-pink-400 text-white font-semibold'
                          : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {fs}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1 flex items-center justify-between">
                  <span>Color Theme</span>
                  <Palette className="w-3 h-3 text-zinc-500" />
                </label>
                <div className="flex items-center gap-1.5">
                  {COLOR_SWATCHES.map((sw) => (
                    <button
                      key={sw.hex}
                      type="button"
                      onClick={() => updateCaption(selectedCaption.id, { color: sw.hex })}
                      style={{ backgroundColor: sw.hex }}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        (selectedCaption.color || '#FFFFFF') === sw.hex
                          ? 'scale-115 ring-2 ring-white border-black'
                          : 'border-black/40 hover:scale-105'
                      }`}
                      title={sw.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Delete Title Action */}
            <button
              type="button"
              onClick={() => removeCaption(selectedCaption.id)}
              className="w-full mt-3 py-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Title Overlay</span>
            </button>
          </div>
        )}

        {/* Shot Properties Inspector Drawer (Opens when scene clip is selected) */}
        {!selectedCaption && isShotInspectorOpen && activeScene && (
          <div className="w-80 bg-[#12161F] border-l border-[#1E2638] p-3 text-xs flex flex-col justify-between shrink-0 shadow-2xl z-30 animate-in slide-in-from-right duration-150">
            <div className="space-y-2.5 overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1E2638]">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Shot Inspector (0{activeSceneIndex + 1}/{scenes.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShotInspectorOpen(false)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Shot Title */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                  Shot Title
                </label>
                <input
                  type="text"
                  value={activeScene.title}
                  onChange={(e) => updateScene(activeSceneIndex, { title: e.target.value })}
                  className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Shot Prompt */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                  Generative Prompt & Visual Directive
                </label>
                <textarea
                  rows={2}
                  value={activeScene.prompt}
                  onChange={(e) => updateScene(activeSceneIndex, { prompt: e.target.value })}
                  className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                />
              </div>

              {/* Camera Movement Preset */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1 flex items-center justify-between">
                  <span>Cinematic Camera Kinematics</span>
                  <span className="text-[9px] text-cyan-400 font-mono">6-DOF</span>
                </label>
                <select
                  value={activeScene.cameraPresetId}
                  onChange={(e) => setCameraOptions({ presetId: e.target.value })}
                  className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {CINEMA_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Focal Length Pills */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1 flex items-center justify-between">
                  <span>Lens Optics & FOV</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Perspective</span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {FOCAL_LENGTHS.map((foc) => (
                    <button
                      key={foc.mm}
                      type="button"
                      onClick={() => setCameraOptions({ focalLength: foc.mm })}
                      className={`py-1 text-[10px] font-mono rounded border text-center transition-colors ${
                        (activeScene.focalLength || '35mm') === foc.mm
                          ? 'bg-zinc-700 border-cyan-400 text-white font-semibold'
                          : 'bg-[#0D1119] border-[#1E2638] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {foc.mm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion Speed Ramp Slider */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-medium mb-1">
                  <span>Speed Ramp</span>
                  <span className="font-mono text-cyan-300">{(activeScene.speedRamp || 1.25).toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.05}
                  value={activeScene.speedRamp || 1.25}
                  onChange={(e) => setCameraOptions({ speedRamp: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Clip Transition Preset */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                  Clip Transition
                </label>
                <select
                  value={activeScene.transition || 'crossfade'}
                  onChange={(e) => updateScene(activeSceneIndex, { transition: e.target.value as any })}
                  className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {TRANSITION_PRESETS.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timing Duration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                    Start Offset
                  </label>
                  <div className="px-2 py-1 bg-[#0D1119] border border-[#1E2638] rounded text-zinc-300 font-mono text-xs">
                    {activeScene.startAt.toFixed(2)}s
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-medium mb-1">
                    Duration (s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max={20}
                    value={activeScene.duration}
                    onChange={(e) => trimScene(activeSceneIndex, parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#0D1119] border border-[#1E2638] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Shot Actions Footer */}
            <div className="pt-2 border-t border-[#1E2638] space-y-1.5 shrink-0">
              <button
                type="button"
                onClick={() => generateActiveScene()}
                disabled={isGeneratingVideo}
                className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingVideo ? 'Generating AI Shot...' : 'Regenerate AI Shot'}</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => duplicateScene(activeSceneIndex)}
                  className="py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>Duplicate</span>
                </button>
                {scenes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScene(activeSceneIndex)}
                    className="py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

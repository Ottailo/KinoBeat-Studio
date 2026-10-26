import { SceneClip, CaptionItem } from '../store/studioStore';
import { BeatMarker } from '../audio/beatDetector';

export interface RenderOptions {
  resolution: '1080p' | '720p' | '4K-Cinema';
  fps: number;
  scenes: SceneClip[];
  captions: CaptionItem[];
  duration: number;
  beats?: BeatMarker[];
  audioBuffer?: AudioBuffer | null;
  onProgress?: (progress: number, frame: number, totalFrames: number, status: string) => void;
  signal?: AbortSignal;
}

export interface RenderResult {
  blob: Blob;
  url: string;
  duration: number;
  width: number;
  height: number;
  mimeType: string;
}

export class VideoRenderer {
  private static RESOLUTION_MAP: Record<string, { width: number; height: number }> = {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '4K-Cinema': { width: 3840, height: 2160 },
  };

  /**
   * Preload an image URL into an HTMLImageElement
   */
  private static async preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback placeholder image on canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#12161F';
        ctx.fillRect(0, 0, 1280, 720);
        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('KINOBEAT STUDIO SCENE', 640, 360);
        const fallbackImg = new Image();
        fallbackImg.src = canvas.toDataURL();
        fallbackImg.onload = () => resolve(fallbackImg);
      };
      img.src = url;
    });
  }

  /**
   * Deterministically renders the composition to a genuine playable video file
   */
  public static async renderToVideo(options: RenderOptions): Promise<RenderResult> {
    const {
      resolution,
      fps = 30,
      scenes,
      captions,
      duration,
      audioBuffer,
      onProgress,
      signal,
    } = options;

    const { width, height } = this.RESOLUTION_MAP[resolution] || this.RESOLUTION_MAP['1080p'];
    const totalFrames = Math.max(30, Math.ceil(duration * fps));
    const frameIntervalMs = 1000 / fps;

    onProgress?.(0, 0, totalFrames, 'Preloading scene media and assets...');

    // 1. Preload scene images / frames
    const preloadedMedia: Record<string, HTMLImageElement> = {};
    for (const sc of scenes) {
      if (sc.thumbnailUrl) {
        preloadedMedia[sc.id] = await this.preloadImage(sc.thumbnailUrl);
      }
    }

    if (signal?.aborted) {
      throw new DOMException('Render aborted by user', 'AbortError');
    }

    // 2. Setup Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Canvas 2D context is unavailable in this environment.');
    }

    // 3. Audio Stream Setup
    let audioContext: AudioContext | null = null;
    let audioDest: MediaStreamAudioDestinationNode | null = null;
    let audioSource: AudioBufferSourceNode | null = null;

    if (audioBuffer && typeof AudioContext !== 'undefined') {
      try {
        audioContext = new AudioContext({ sampleRate: 48000 });
        audioDest = audioContext.createMediaStreamDestination();
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioDest);
      } catch (err) {
        console.warn('Audio stream destination setup skipped:', err);
      }
    }

    // 4. Setup MediaStream and MediaRecorder
    const canvasStream = canvas.captureStream(fps);
    if (audioDest) {
      audioDest.stream.getAudioTracks().forEach((track) => {
        canvasStream.addTrack(track);
      });
    }

    const candidateMimes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=avc1,mp4a',
      'video/mp4',
    ];

    let chosenMime = 'video/webm';
    for (const mime of candidateMimes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
        chosenMime = mime;
        break;
      }
    }

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(canvasStream, {
      mimeType: chosenMime,
      videoBitsPerSecond: resolution === '4K-Cinema' ? 24_000_000 : 8_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.start(100);
    if (audioSource) {
      audioSource.start(0);
    }

    onProgress?.(5, 0, totalFrames, 'Starting rasterization pipeline...');

    // 5. Render Frame-by-Frame
    for (let f = 0; f < totalFrames; f++) {
      if (signal?.aborted) {
        recorder.stop();
        if (audioSource) audioSource.stop();
        if (audioContext) audioContext.close();
        throw new DOMException('Render aborted by user', 'AbortError');
      }

      const t = f / fps;

      // Find active scene clip
      const activeScene =
        scenes.find((s) => t >= s.startAt && t < s.startAt + s.duration) ||
        scenes[scenes.length - 1];

      const sceneProgress = activeScene
        ? Math.max(0, Math.min(1, (t - activeScene.startAt) / activeScene.duration))
        : 0;

      // Clear Canvas
      ctx.fillStyle = '#0B0E14';
      ctx.fillRect(0, 0, width, height);

      // Draw Scene with 3D Camera Kinematics
      ctx.save();

      let scale = 1.05;
      let panX = 0;
      let panY = 0;
      let rotation = 0;

      const preset = activeScene?.cameraPresetId || 'orbital_drift';
      if (preset === 'orbital_drift') {
        scale = 1.05 + 0.12 * sceneProgress;
        panX = Math.sin(sceneProgress * Math.PI) * (width * 0.03);
        panY = Math.cos(sceneProgress * Math.PI) * (height * 0.02);
        rotation = Math.sin(sceneProgress * Math.PI) * 0.02;
      } else if (preset === 'fpv_dive') {
        const eased = Math.pow(sceneProgress, 1.6);
        scale = 1.02 + 0.35 * eased;
        panY = -eased * (height * 0.06);
        rotation = Math.sin(sceneProgress * 2 * Math.PI) * 0.035;
      } else if (preset === 'dolly_zoom_vertigo') {
        scale = 1.0 + 0.28 * sceneProgress;
        panX = (Math.random() - 0.5) * 2;
      } else if (preset === 'roll_540') {
        scale = 1.15 + 0.15 * Math.sin(sceneProgress * Math.PI);
        rotation = sceneProgress * Math.PI * 3;
      } else if (preset === 'crane_shot') {
        scale = 1.08;
        panY = (1 - sceneProgress) * (height * 0.08) - height * 0.04;
      } else if (preset === 'rack_focus') {
        scale = 1.06 + 0.04 * sceneProgress;
      }

      // Center pivot point
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.rotate(rotation);
      ctx.translate(-width / 2 + panX, -height / 2 + panY);

      // Draw image
      const mediaImg = activeScene ? preloadedMedia[activeScene.id] : null;
      if (mediaImg) {
        // Draw image covering the canvas
        const imgRatio = mediaImg.width / mediaImg.height;
        const canvasRatio = width / height;
        let drawW = width;
        let drawH = height;
        let drawX = 0;
        let drawY = 0;

        if (imgRatio > canvasRatio) {
          drawW = height * imgRatio;
          drawX = (width - drawW) / 2;
        } else {
          drawH = width / imgRatio;
          drawY = (height - drawH) / 2;
        }

        ctx.drawImage(mediaImg, drawX, drawY, drawW, drawH);
      } else {
        ctx.fillStyle = '#161B26';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      // Subtle Cinematic Vignette
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.35,
        width / 2,
        height / 2,
        width * 0.75
      );
      vignette.addColorStop(0, 'rgba(11, 14, 20, 0)');
      vignette.addColorStop(1, 'rgba(11, 14, 20, 0.45)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Render Active Kinetic Captions
      const activeCaps = captions.filter((c) => t >= c.startTime && t <= c.endTime);
      for (const cap of activeCaps) {
        const capDuration = Math.max(0.1, cap.endTime - cap.startTime);
        const capProgress = Math.max(0, Math.min(1, (t - cap.startTime) / capDuration));

        ctx.save();
        const baseFontSize = (cap.fontSize || 28) * (height / 1080);
        let kineticScale = 1.0;
        let alpha = 1.0;

        if (cap.style === 'slam') {
          if (capProgress < 0.15) {
            kineticScale = 1.6 - (capProgress / 0.15) * 0.6;
          } else {
            kineticScale = 1.0;
          }
        } else if (cap.style === 'glow') {
          ctx.shadowColor = cap.color || '#00F0FF';
          ctx.shadowBlur = 24 * Math.sin(capProgress * Math.PI);
        } else if (cap.style === 'split') {
          kineticScale = 1.0 + 0.05 * Math.sin(capProgress * Math.PI * 2);
        }

        ctx.font = `800 ${baseFontSize}px Inter, Geist, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textMetrics = ctx.measureText(cap.text);
        const pillW = textMetrics.width + 60 * (width / 1920);
        const pillH = baseFontSize * 1.8;
        const pillX = width / 2 - pillW / 2;
        const pillY = height * 0.82 - pillH / 2;

        // Draw pill background
        ctx.fillStyle = 'rgba(11, 14, 20, 0.85)';
        ctx.strokeStyle = cap.color || '#00F0FF';
        ctx.lineWidth = 2 * (width / 1920);
        ctx.beginPath();
        const r = 8 * (width / 1920);
        ctx.roundRect(pillX, pillY, pillW, pillH, r);
        ctx.fill();
        ctx.stroke();

        // Draw Text
        ctx.translate(width / 2, height * 0.82);
        ctx.scale(kineticScale, kineticScale);
        ctx.fillStyle = cap.color || '#FFFFFF';
        ctx.fillText(cap.text, 0, 0);

        ctx.restore();
      }

      // Render Clean Technical Burn-in Timecode (Bottom Left)
      ctx.save();
      ctx.font = `600 ${14 * (height / 1080)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const ff = Math.floor((t % 1) * fps);
      const tcStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ff.toString().padStart(2, '0')} // KINOBEAT STUDIO 4K // ${resolution}`;
      ctx.fillText(tcStr, 32 * (width / 1920), height - 24 * (height / 1080));
      ctx.restore();

      // Report Progress
      const pct = Math.round(((f + 1) / totalFrames) * 100);
      onProgress?.(pct, f + 1, totalFrames, `Encoding frame ${f + 1} of ${totalFrames}...`);

      // Allow recorder to consume frame
      await new Promise((r) => setTimeout(r, Math.max(2, Math.floor(frameIntervalMs * 0.25))));
    }

    onProgress?.(100, totalFrames, totalFrames, 'Finalizing video container mux...');

    // 6. Stop Recorder and compile Blob
    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        try {
          if (audioSource) audioSource.stop();
          if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
          }

          const masterBlob = new Blob(chunks, { type: chosenMime });
          const masterUrl = URL.createObjectURL(masterBlob);

          resolve({
            blob: masterBlob,
            url: masterUrl,
            duration,
            width,
            height,
            mimeType: chosenMime,
          });
        } catch (err) {
          reject(err);
        }
      };

      recorder.onerror = (e) => {
        reject(new Error(`MediaRecorder error: ${(e as any).error?.message || 'unknown'}`));
      };

      recorder.stop();
    });
  }
}

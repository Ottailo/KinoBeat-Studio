import { SceneClip, CaptionItem } from '../store/studioStore';
import { BeatMarker } from '../audio/beatDetector';
import { CAMERA_CURVES } from '../camera/cameraMath';

export interface RenderOptions {
  resolution: '1080p' | '720p' | '4K-Cinema';
  fps: number;
  scenes: SceneClip[];
  captions: CaptionItem[];
  duration: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '21:9';
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
   * Preload a video URL into an HTMLVideoElement
   */
  private static async preloadVideo(url: string): Promise<HTMLVideoElement> {
    return new Promise((resolve) => {
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.muted = true;
      vid.playsInline = true;
      vid.src = url;
      vid.onloadeddata = () => resolve(vid);
      vid.onerror = () => {
        // Fallback to placeholder canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#0B0E14';
        ctx.fillRect(0, 0, 1280, 720);
        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VIDEO STREAM ERROR', 640, 360);
        resolve(vid);
      };
    });
  }

  /**
   * Draw image or video covering the canvas preserving aspect ratio
   */
  private static drawMediaCover(
    ctx: CanvasRenderingContext2D,
    media: HTMLImageElement | HTMLVideoElement,
    canvasW: number,
    canvasH: number
  ) {
    const mediaW = media instanceof HTMLVideoElement ? media.videoWidth || 1920 : media.naturalWidth || 1920;
    const mediaH = media instanceof HTMLVideoElement ? media.videoHeight || 1080 : media.naturalHeight || 1080;
    const mediaRatio = mediaW / mediaH;
    const canvasRatio = canvasW / canvasH;

    let drawW = canvasW;
    let drawH = canvasH;
    let drawX = 0;
    let drawY = 0;

    if (mediaRatio > canvasRatio) {
      drawW = canvasH * mediaRatio;
      drawX = (canvasW - drawW) / 2;
    } else {
      drawH = canvasW / mediaRatio;
      drawY = (canvasH - drawH) / 2;
    }

    ctx.drawImage(media, drawX, drawY, drawW, drawH);
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
      aspectRatio = '16:9',
      beats = [],
      audioBuffer,
      onProgress,
      signal,
    } = options;

    const baseRes = this.RESOLUTION_MAP[resolution] || this.RESOLUTION_MAP['1080p'];
    let width = baseRes.width;
    let height = baseRes.height;

    if (aspectRatio === '9:16') {
      width = baseRes.height;
      height = baseRes.width;
    } else if (aspectRatio === '1:1') {
      width = Math.min(baseRes.width, baseRes.height);
      height = width;
    } else if (aspectRatio === '21:9') {
      height = baseRes.height;
      width = Math.round(height * (21 / 9));
    }

    const totalFrames = Math.max(30, Math.ceil(duration * fps));

    onProgress?.(0, 0, totalFrames, 'Preloading scene media and assets...');

    // 1. Preload scene images / videos
    const preloadedMedia: Record<string, HTMLImageElement | HTMLVideoElement> = {};
    for (const sc of scenes) {
      if (sc.mediaType === 'video' && sc.videoUrl) {
        preloadedMedia[sc.id] = await this.preloadVideo(sc.videoUrl);
      } else if (sc.thumbnailUrl) {
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

      // Evaluate Camera Curve matching KinoComposition
      const curve =
        CAMERA_CURVES[activeScene?.cameraPresetId || 'orbital_drift'] ||
        CAMERA_CURVES.orbital_drift;

      const camState = curve.evaluate(sceneProgress, {
        focalLength: activeScene?.focalLength || '35mm',
        speedRamp: activeScene?.speedRamp || 1.25,
        easing: activeScene?.easing || 'Smoothstep (Ease In/Out)',
      });

      const isBeatHit = beats.some((b) => Math.abs(b.timestamp - t) < 0.08);
      const beatScaleBump = isBeatHit ? 1.025 : 1.0;

      // Transitions
      const transition = activeScene?.transition || 'crossfade';
      let transitionOpacity = 1.0;
      let glitchOffset = 0;

      if (transition === 'crossfade') {
        if (sceneProgress < 0.12) {
          transitionOpacity = Math.max(0, sceneProgress / 0.12);
        }
      } else if (transition === 'dip_black') {
        if (sceneProgress < 0.1) {
          transitionOpacity = sceneProgress / 0.1;
        } else if (sceneProgress > 0.9) {
          transitionOpacity = (1.0 - sceneProgress) / 0.1;
        }
      } else if (transition === 'glitch') {
        if (sceneProgress < 0.15) {
          glitchOffset = (Math.random() - 0.5) * 12;
        }
      }

      // Draw Scene with 3D Camera Kinematics
      ctx.save();
      ctx.globalAlpha = transitionOpacity;

      // Camera 2D transforms approximating 3D camera angles
      ctx.translate(width / 2, height / 2);
      ctx.scale(camState.z * beatScaleBump, camState.z * beatScaleBump);
      ctx.rotate((camState.roll * Math.PI) / 180);
      ctx.translate(
        -width / 2 + (camState.x + glitchOffset) * (width / 1920),
        -height / 2 + camState.y * (height / 1080)
      );

      // Draw Media (Video or Image)
      const media = activeScene ? preloadedMedia[activeScene.id] : null;
      if (media instanceof HTMLVideoElement) {
        const targetTime = sceneProgress * activeScene.duration;
        media.currentTime = targetTime;
        await new Promise((res) => {
          media.onseeked = res;
          setTimeout(res, 20);
        });
        this.drawMediaCover(ctx, media, width, height);
      } else if (media instanceof HTMLImageElement) {
        this.drawMediaCover(ctx, media, width, height);
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
        const baseFontSize = (cap.fontSize || 32) * (height / 1080);
        let kineticScale = 1.0;

        if (cap.style === 'slam') {
          if (capProgress < 0.15) {
            kineticScale = 1.45 - (capProgress / 0.15) * 0.45;
          } else {
            kineticScale = 1.0;
          }
        } else if (cap.style === 'glow') {
          ctx.shadowColor = cap.color || '#00F0FF';
          ctx.shadowBlur = 24 * Math.sin(capProgress * Math.PI);
        } else if (cap.style === 'split') {
          kineticScale = 1.0 + 0.05 * Math.sin(capProgress * Math.PI * 2);
        }

        ctx.font = `800 ${baseFontSize * kineticScale}px Inter, Geist, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textMetrics = ctx.measureText(cap.text);
        const pillW = textMetrics.width + 60 * (width / 1920);
        const pillH = baseFontSize * 1.8;
        const pillX = width / 2 - pillW / 2;
        const pillY = height * 0.82 - pillH / 2;

        // Draw pill background
        ctx.fillStyle = 'rgba(11, 14, 20, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 8);
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = cap.color || '#FFFFFF';
        ctx.fillText(cap.text, width / 2, height * 0.82);

        ctx.restore();
      }

      // Letterbox Bars
      ctx.fillStyle = '#000000';
      const letterboxH = height * 0.045;
      ctx.fillRect(0, 0, width, letterboxH);
      ctx.fillRect(0, height - letterboxH, width, letterboxH);

      // Safe-Zone Corner Markers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      const margin = width * 0.04;
      const cornerLen = 16;
      ctx.beginPath();
      // Top Left
      ctx.moveTo(margin, margin + cornerLen);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + cornerLen, margin);
      // Top Right
      ctx.moveTo(width - margin - cornerLen, margin);
      ctx.lineTo(width - margin, margin);
      ctx.lineTo(width - margin, margin + cornerLen);
      // Bottom Left
      ctx.moveTo(margin, height - margin - cornerLen);
      ctx.lineTo(margin, height - margin);
      ctx.lineTo(margin + cornerLen, height - margin);
      // Bottom Right
      ctx.moveTo(width - margin - cornerLen, height - margin);
      ctx.lineTo(width - margin, height - margin);
      ctx.lineTo(width - margin, height - margin - cornerLen);
      ctx.stroke();

      // Technical Burn-in Timecode
      ctx.font = `600 ${Math.max(10, Math.round(14 * (height / 1080)))}px monospace`;
      ctx.fillStyle = '#00F0FF';
      ctx.textAlign = 'left';
      ctx.fillText(
        `TC: ${t.toFixed(2)}s | ${fps}FPS | KINOBEAT STUDIO`,
        margin,
        height - letterboxH / 2 + 4
      );

      // Progress reporting
      const pct = Math.round(((f + 1) / totalFrames) * 100);
      onProgress?.(pct, f + 1, totalFrames, `Encoding frames (${pct}%)...`);

      // Yield frame delay for MediaRecorder stream capture
      await new Promise((r) => setTimeout(r, 10));
    }

    onProgress?.(95, totalFrames, totalFrames, 'Finalizing video stream container...');

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        try {
          if (audioSource) audioSource.stop();
          if (audioContext) audioContext.close();

          const blob = new Blob(chunks, { type: chosenMime });
          const url = URL.createObjectURL(blob);
          resolve({
            blob,
            url,
            duration,
            width,
            height,
            mimeType: chosenMime,
          });
        } catch (e) {
          reject(e);
        }
      };

      recorder.stop();
    });
  }
}

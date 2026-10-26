/**
 * KinoBeat Studio - Multi-Model Video Architecture Registry
 * Real-world capabilities, resolutions, context horizons, and camera prompt syntax.
 */

export interface ModelSpec {
  id: string;
  name: string;
  provider: string;
  version: string;
  type: 'video-gen' | 'image-to-video' | 'director-control';
  maxDurationSeconds: number;
  supportedResolutions: string[];
  supportedAspectRatios: string[];
  nativeFps: number;
  cameraPromptSupport: 'native-tokens' | 'natural-language' | 'motion-vector';
  contextWindow: string;
  recommendedCfg: number;
  recommendedSteps: number;
  pricingPerSecond: number; // in USD
  description: string;
}

export const VIDEO_MODELS: Record<string, ModelSpec> = {
  flux_video: {
    id: 'flux_video',
    name: 'FLUX.1 Video Pro',
    provider: 'Black Forest Labs',
    version: 'v1.1-2026',
    type: 'video-gen',
    maxDurationSeconds: 10,
    supportedResolutions: ['720p', '1080p', '4K-Cinema'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '2.39:1'],
    nativeFps: 30,
    cameraPromptSupport: 'natural-language',
    contextWindow: '128k latent tokens',
    recommendedCfg: 4.5,
    recommendedSteps: 40,
    pricingPerSecond: 0.04,
    description: 'Ultra-photorealistic generation with high temporal consistency and deep lighting fidelity.',
  },

  kling_1_5: {
    id: 'kling_1_5',
    name: 'Kling 1.5 Cinematic',
    provider: 'Kuaishou',
    version: '1.5-Pro',
    type: 'video-gen',
    maxDurationSeconds: 10,
    supportedResolutions: ['720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    nativeFps: 30,
    cameraPromptSupport: 'native-tokens',
    contextWindow: 'Diffusion Transformer (DiT)',
    recommendedCfg: 5.0,
    recommendedSteps: 50,
    pricingPerSecond: 0.05,
    description: 'High physics simulation accuracy, natural fluid dynamics, and expressive character movement.',
  },

  wan_2_1: {
    id: 'wan_2_1',
    name: 'Wan 2.1 Video',
    provider: 'Alibaba Cloud',
    version: '2.1-Flash',
    type: 'video-gen',
    maxDurationSeconds: 8,
    supportedResolutions: ['720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16'],
    nativeFps: 24,
    cameraPromptSupport: 'natural-language',
    contextWindow: 'Spatiotemporal Attention',
    recommendedCfg: 6.0,
    recommendedSteps: 35,
    pricingPerSecond: 0.03,
    description: 'Fast inference speed, expressive camera tracking, and coherent scene transitions.',
  },

  ltx_video: {
    id: 'ltx_video',
    name: 'LTX-Video Ultra',
    provider: 'Lightricks',
    version: '0.9.1',
    type: 'video-gen',
    maxDurationSeconds: 10,
    supportedResolutions: ['720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '2.39:1'],
    nativeFps: 24,
    cameraPromptSupport: 'motion-vector',
    contextWindow: 'Linear Latent DiT',
    recommendedCfg: 3.5,
    recommendedSteps: 30,
    pricingPerSecond: 0.02,
    description: 'Ultra-low latency DiT pipeline with native motion vector guidance and real-time generation.',
  },

  higgsfield_dop: {
    id: 'higgsfield_dop',
    name: 'Higgsfield Director of Photography',
    provider: 'Higgsfield AI',
    version: 'DoP-Cinema-v2',
    type: 'director-control',
    maxDurationSeconds: 15,
    supportedResolutions: ['1080p', '4K-Cinema'],
    supportedAspectRatios: ['16:9', '2.39:1'],
    nativeFps: 30,
    cameraPromptSupport: 'native-tokens',
    contextWindow: 'Multi-Perspective Latent Mesh',
    recommendedCfg: 7.0,
    recommendedSteps: 45,
    pricingPerSecond: 0.06,
    description: 'Industry-standard camera choreography engine supporting pan, tilt, zoom, and multi-shot continuity.',
  },
};

/**
 * KinoBeat Studio - MCSLA Prompt Synthesis Engine
 * Implements the Model-Camera-Subject-Look-Action formula from Higgsfield & Opus Video Skills.
 */

export interface McslaPromptInput {
  modelId: string;
  subject: string;
  action: string;
  look: string;
  cameraPresetId: string;
  soulId?: string; // Character consistency identifier
  negativePrompt?: string;
  aspectRatio?: string;
  duration?: number;
}

export interface McslaCompiledPrompt {
  fullPrompt: string;
  cameraDirective: string;
  negativePrompt: string;
  modelTokens: string[];
  parameters: {
    cfg: number;
    steps: number;
    seed: number;
    motionStrength: number;
  };
}

export const LOOK_PRESETS = [
  { id: 'cinematic_anamorphic', name: '35mm Anamorphic / ARRI Alexa LF', prompt: 'Shot on 35mm anamorphic prime lenses, ARRI Alexa LF, shallow depth of field, subtle chromatic aberration, soft film grain, Kodak Vision3 500T color grading' },
  { id: 'cyberpunk_neon', name: 'Cyberpunk Neon Noir', prompt: 'Volumetric cyan and magenta neon backlighting, wet reflective asphalt, moody atmospheric haze, high micro-contrast, stylized cyberpunk color science' },
  { id: 'imax_documentary', name: 'IMAX 70mm Naturalist', prompt: 'IMAX 70mm natural lighting, crystal clear hyper-detailed textures, neutral dynamic range, cinematic documentary realism, 8k resolution textures' },
  { id: 'vintage_anime', name: '90s Retro Cel Anime', prompt: '1990s hand-drawn cel animation aesthetic, vibrant retro gouache backgrounds, subtle film dirt, evocative anime keyframes, Studio Ghibli lighting' },
];

export function compileMcslaPrompt(input: McslaPromptInput): McslaCompiledPrompt {
  const cameraMap: Record<string, string> = {
    orbital_drift: 'Camera movement: continuous 360-degree orbital drift around the subject at constant eye level, keeping subject locked in center frame, cinematic slow-motion pan',
    fpv_dive: 'Camera movement: high-speed dynamic FPV acrobatic dive rushing downward, banking roll through atmospheric haze, dramatic forward momentum',
    dolly_zoom_vertigo: 'Camera movement: dramatic vertigo contra-zoom (dolly-in zoom-out), perspective distortion expanding background while subject framing remains locked',
    rack_focus_push: 'Camera movement: slow forward tracking shot with precision rack focus from foreground environmental texture to sharp subject focus',
    whip_pan_snap: 'Camera movement: rapid kinetic whip-pan transition snapping horizontally with directional motion blur into subject framing',
    handheld_operator: 'Camera movement: organic handheld shoulder-mount camera operator sway, subtle breathing motion, cinema verité immersion',
  };

  const selectedCamera = cameraMap[input.cameraPresetId] || cameraMap.orbital_drift;
  
  // Format character/soul lock token if provided
  const soulLock = input.soulId ? `Consistent character [Soul ID: ${input.soulId}], identical facial features, consistent wardrobe and physique. ` : '';

  // MCSLA Assembly
  const fullPrompt = `${selectedCamera}. ${soulLock}${input.subject}, ${input.action}. Style and Lighting: ${input.look}. Highly detailed, 8k cinematic masterpiece, temporally coherent, photorealistic render.`;

  const defaultNegative = input.negativePrompt || 'jittery artifacts, morphing faces, distorted limbs, text watermark, low quality, oversaturated colors, sudden cut jumps, frame skipping, temporal flickering, cartoonish plasticity';

  return {
    fullPrompt,
    cameraDirective: selectedCamera,
    negativePrompt: defaultNegative,
    modelTokens: ['4k-native', 'hdr-10', 'temporal-stabilized', 'cinema-dop'],
    parameters: {
      cfg: 5.0,
      steps: 40,
      seed: Math.floor(Math.random() * 99999999),
      motionStrength: 0.85,
    },
  };
}

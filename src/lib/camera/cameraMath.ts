/**
 * KinoBeat Studio - Mathematical Camera Curves & Motion Vector Engine
 * Codifies parametric curves from Higgsfield DoP, Opus Video Skills & cinema motion rigs.
 */

export interface CameraState {
  x: number;       // Lateral translation (-100 to 100)
  y: number;       // Vertical translation (-100 to 100)
  z: number;       // Dolly depth (0.5 to 3.0 scale)
  pitch: number;   // Tilt (-45 to 45 deg)
  yaw: number;     // Pan (-180 to 180 deg)
  roll: number;    // Dutch angle (-30 to 30 deg)
  fov: number;     // Field of view in degrees (24 to 90)
  focalDistance: number; // For rack focus (0.1 to 10.0 meters)
  perspectivePx: number; // Computed 3D perspective depth in CSS pixels
  blurPx: number;        // Depth of field defocus blur
}

export interface CameraCurveOptions {
  focalLength?: string;  // '24mm' | '35mm' | '50mm' | '85mm'
  speedRamp?: number;    // 0.5 to 3.0
  easing?: string;       // 'Smoothstep (Ease In/Out)' | 'Exponential Ramp' | 'Linear Constant' | 'Elastic Snap'
}

export interface CameraCurve {
  id: string;
  name: string;
  category: 'Cinematic' | 'FPV' | 'Dynamic' | 'Subtle';
  formulaLaTeX: string;
  description: string;
  evaluate: (t: number, options?: CameraCurveOptions) => CameraState;
}

// Standard smoothstep easing
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Sine harmonic jitter generator
function harmonicNoise(t: number, f1 = 3.2, f2 = 7.1, f3 = 13.9): number {
  return (
    0.5 * Math.sin(2 * Math.PI * f1 * t) +
    0.3 * Math.sin(2 * Math.PI * f2 * t + 1.2) +
    0.2 * Math.sin(2 * Math.PI * f3 * t + 2.7)
  );
}

// Apply easing curve transformations to normalized time t in [0, 1]
export function applyEasing(t: number, easing?: string): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (easing) {
    case 'Exponential Ramp':
      return Math.pow(clamped, 2.2);
    case 'Linear Constant':
      return clamped;
    case 'Elastic Snap': {
      // Damped harmonic overshoot
      const p = 0.3;
      return Math.pow(2, -10 * clamped) * Math.sin(((clamped - p / 4) * (2 * Math.PI)) / p) + 1;
    }
    case 'Smoothstep (Ease In/Out)':
    default:
      return smoothstep(0, 1, clamped);
  }
}

// Map focal length string to optics parameters
export function getOpticsForFocalLength(focalLength?: string): {
  baseFov: number;
  perspectivePx: number;
  depthScale: number;
  edgeBlurPx: number;
} {
  switch (focalLength) {
    case '24mm':
      return { baseFov: 84, perspectivePx: 600, depthScale: 1.45, edgeBlurPx: 0 };
    case '50mm':
      return { baseFov: 46, perspectivePx: 1400, depthScale: 0.85, edgeBlurPx: 0.5 };
    case '85mm':
      return { baseFov: 28, perspectivePx: 2200, depthScale: 0.65, edgeBlurPx: 1.2 };
    case '35mm':
    default:
      return { baseFov: 63, perspectivePx: 950, depthScale: 1.0, edgeBlurPx: 0 };
  }
}

function processTime(t: number, options?: CameraCurveOptions): number {
  const ramp = options?.speedRamp && options.speedRamp > 0 ? options.speedRamp : 1.0;
  // Speed ramp scales the progress
  const rampedT = Math.min(1.0, t * ramp);
  return applyEasing(rampedT, options?.easing);
}

export const CAMERA_CURVES: Record<string, CameraCurve> = {
  orbital_drift: {
    id: 'orbital_drift',
    name: '360° Orbital Drift',
    category: 'Cinematic',
    formulaLaTeX: 'X(t) = R\\cos(\\omega t), Z(t) = R\\sin(\\omega t), \\text{Yaw}(t) = \\omega t',
    description: 'Smooth cylindrical rotation around subject with subtle vertical bobbing and locked center point.',
    evaluate: (t: number, options?: CameraCurveOptions): CameraState => {
      const effT = processTime(t, options);
      const optics = getOpticsForFocalLength(options?.focalLength);
      const angle = effT * Math.PI * 0.75; // 135 degree arc
      const radius = 25 * optics.depthScale;
      return {
        x: Math.sin(angle) * radius,
        y: Math.sin(effT * Math.PI * 2) * 4,
        z: 1.0 + Math.cos(angle) * 0.15 * optics.depthScale,
        pitch: -3 + Math.sin(effT * Math.PI) * 4,
        yaw: (angle * 180) / Math.PI * 0.5,
        roll: Math.sin(angle) * -2.5,
        fov: optics.baseFov + Math.sin(effT * Math.PI) * 4,
        focalDistance: 2.5,
        perspectivePx: optics.perspectivePx,
        blurPx: optics.edgeBlurPx,
      };
    },
  },

  fpv_dive: {
    id: 'fpv_dive',
    name: 'FPV Acro Dive & Roll',
    category: 'FPV',
    formulaLaTeX: 'Z(t) = 1.0 + 1.2 \\cdot t^2, \\text{Roll}(t) = A \\cdot \\sin(2\\pi t), \\text{Pitch}(t) = -35(1-t)',
    description: 'High-speed drone dive accelerating downward with dynamic banking roll and forward rush.',
    evaluate: (t: number, options?: CameraCurveOptions): CameraState => {
      const effT = processTime(t, options);
      const optics = getOpticsForFocalLength(options?.focalLength);
      const speedRamp = Math.pow(effT, 2.2);
      return {
        x: Math.sin(effT * Math.PI * 2) * 18 * optics.depthScale,
        y: -30 + speedRamp * 45,
        z: 1.0 + speedRamp * 0.95 * optics.depthScale,
        pitch: -25 * (1 - effT) + 12 * speedRamp,
        yaw: Math.sin(effT * Math.PI) * 22,
        roll: Math.sin(effT * Math.PI * 2) * 16,
        fov: optics.baseFov + speedRamp * 18,
        focalDistance: 1.8 - speedRamp * 0.8,
        perspectivePx: optics.perspectivePx,
        blurPx: optics.edgeBlurPx,
      };
    },
  },

  dolly_zoom_vertigo: {
    id: 'dolly_zoom_vertigo',
    name: 'Vertigo Dolly-Zoom (Hitchcock)',
    category: 'Cinematic',
    formulaLaTeX: 'Z(t) = Z_0(1-t) + Z_1 t, \\quad \\tan(\\text{FoV}/2) \\propto 1/Z(t)',
    description: 'Optical contra-zoom where camera dollies forward while lens widens to distort perspective background scale.',
    evaluate: (t: number, options?: CameraCurveOptions): CameraState => {
      const effT = processTime(t, options);
      const optics = getOpticsForFocalLength(options?.focalLength);
      const zScale = 1.0 + effT * 0.65 * optics.depthScale;
      const fovVal = optics.baseFov + effT * 25;
      return {
        x: 0,
        y: 0,
        z: zScale,
        pitch: 0,
        yaw: 0,
        roll: 0,
        fov: fovVal,
        focalDistance: 2.0,
        perspectivePx: optics.perspectivePx,
        blurPx: optics.edgeBlurPx,
      };
    },
  },

  roll_540: {
    id: 'roll_540',
    name: '540° Dynamic Roll',
    category: 'Dynamic',
    formulaLaTeX: '\\text{Roll}(t) = 3\\pi \\cdot t, \\quad Z(t) = 1.15 + 0.15\\sin(\\pi t)',
    description: 'Fast continuous roll axis barrel rotation with dynamic scale breathing.',
    evaluate: (t: number, options?: CameraCurveOptions): CameraState => {
      const effT = processTime(t, options);
      const optics = getOpticsForFocalLength(options?.focalLength);
      return {
        x: Math.sin(effT * Math.PI * 2) * 6,
        y: Math.cos(effT * Math.PI * 2) * 6,
        z: 1.15 + 0.18 * Math.sin(effT * Math.PI) * optics.depthScale,
        pitch: Math.sin(effT * Math.PI) * 4,
        yaw: Math.sin(effT * Math.PI) * 5,
        roll: effT * 360 * 1.5, // 540 degrees
        fov: optics.baseFov,
        focalDistance: 2.0,
        perspectivePx: optics.perspectivePx,
        blurPx: optics.edgeBlurPx,
      };
    },
  },

  crane_shot: {
    id: 'crane_shot',
    name: 'Overhead Crane Shot',
    category: 'Cinematic',
    formulaLaTeX: 'Y(t) = Y_0(1-t), \\quad \\text{Pitch}(t) = -35(1-t)',
    description: 'Sweeping top-down vertical reveal descending gracefully to eye level.',
    evaluate: (t: number, options?: CameraCurveOptions): CameraState => {
      const effT = processTime(t, options);
      const optics = getOpticsForFocalLength(options?.focalLength);
      return {
        x: 0,
        y: (1 - effT) * -45 * optics.depthScale,
        z: 1.08 + effT * 0.12 * optics.depthScale,
        pitch: (1 - effT) * -28,
        yaw: Math.sin(effT * Math.PI) * 4,
        roll: 0,
        fov: optics.baseFov,
        focalDistance: 2.5,
        perspectivePx: optics.perspectivePx,
        blurPx: optics.edgeBlurPx,
      };
    },
  },

  rack_focus_push: {
    id: 'rack_focus_push',
    name: 'Rack Focus & Anamorphic Push',
    category: 'Cinematic',
    formulaLaTeX: 'D(t) = D_0 + (D_1 - D_0) \\cdot S(t), \\quad Z(t) = 1.0 + 0.25 \\cdot S(t)',
    description: 'Slow forward dolly with dramatic shift of focal plane from foreground element to distant subject.',
    evaluate: (t: number, options?: CameraCurveOptions): CameraState => {
      const effT = processTime(t, options);
      const optics = getOpticsForFocalLength(options?.focalLength);
      return {
        x: (1 - effT) * -6,
        y: 0,
        z: 1.0 + effT * 0.25 * optics.depthScale,
        pitch: -1.5,
        yaw: (1 - effT) * -3,
        roll: 0,
        fov: optics.baseFov - effT * 4,
        focalDistance: 0.8 + effT * 3.2,
        perspectivePx: optics.perspectivePx,
        blurPx: Math.max(0, (1 - effT * 1.5) * 2.0),
      };
    },
  },

  whip_pan_snap: {
    id: 'whip_pan_snap',
    name: 'Whip-Pan Kinetic Snap',
    category: 'Dynamic',
    formulaLaTeX: '\\text{Yaw}(t) = \\Delta \\theta \\cdot \\left[ \\frac{1}{1 + e^{-20(t - 0.5)}} \\right]',
    description: 'Ultra-fast rotational whip pan that snaps between two framings in under 200 milliseconds.',
    evaluate: (t: number, options?: CameraCurveOptions): CameraState => {
      const effT = processTime(t, options);
      const optics = getOpticsForFocalLength(options?.focalLength);
      const snap = 1 / (1 + Math.exp(-22 * (effT - 0.5)));
      return {
        x: (snap - 0.5) * 80 * optics.depthScale,
        y: 0,
        z: 1.0 + Math.sin(effT * Math.PI) * 0.35,
        pitch: 0,
        yaw: -45 + snap * 90,
        roll: Math.sin(effT * Math.PI) * -8,
        fov: optics.baseFov + Math.sin(effT * Math.PI) * 12,
        focalDistance: 2.0,
        perspectivePx: optics.perspectivePx,
        blurPx: Math.sin(effT * Math.PI) * 3.5, // Motion blur during fast whip
      };
    },
  },

  handheld_operator: {
    id: 'handheld_operator',
    name: 'Cinema Verité Handheld',
    category: 'Subtle',
    formulaLaTeX: 'P(t) = \\sum_{k=1}^3 A_k \\sin(\\omega_k t + \\phi_k)',
    description: 'Organic human operator micro-shake, subtle breathing sway, and shoulder rig inertia.',
    evaluate: (t: number, options?: CameraCurveOptions): CameraState => {
      const effT = processTime(t, options);
      const optics = getOpticsForFocalLength(options?.focalLength);
      const shakeX = harmonicNoise(effT, 2.4, 5.8, 11.2) * 5 * optics.depthScale;
      const shakeY = harmonicNoise(effT + 0.3, 1.8, 4.2, 9.6) * 4 * optics.depthScale;
      const shakePitch = harmonicNoise(effT + 0.7, 2.1, 4.9, 10.3) * 2.5;
      const shakeYaw = harmonicNoise(effT + 0.5, 1.9, 3.8, 8.4) * 3;
      const shakeRoll = harmonicNoise(effT + 0.2, 1.5, 3.2, 7.1) * 1.8;
      return {
        x: shakeX,
        y: shakeY,
        z: 1.02 + Math.sin(effT * Math.PI * 2) * 0.04,
        pitch: shakePitch,
        yaw: shakeYaw,
        roll: shakeRoll,
        fov: optics.baseFov + Math.sin(effT * Math.PI * 2) * 1.5,
        focalDistance: 2.2,
        perspectivePx: optics.perspectivePx,
        blurPx: optics.edgeBlurPx,
      };
    },
  },
};

/**
 * Calculates shortest-angle modular delta math to prevent reverse 300-degree snapbacks
 */
export function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  return (((toDeg - fromDeg) % 360 + 360 + 180) % 360) - 180;
}

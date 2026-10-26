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
}

export interface CameraCurve {
  id: string;
  name: string;
  category: 'Cinematic' | 'FPV' | 'Dynamic' | 'Subtle';
  formulaLaTeX: string;
  description: string;
  evaluate: (t: number) => CameraState; // t in [0.0, 1.0]
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

export const CAMERA_CURVES: Record<string, CameraCurve> = {
  orbital_drift: {
    id: 'orbital_drift',
    name: '360° Orbital Drift',
    category: 'Cinematic',
    formulaLaTeX: 'X(t) = R\\cos(\\omega t), Z(t) = R\\sin(\\omega t), \\text{Yaw}(t) = \\omega t',
    description: 'Smooth cylindrical rotation around subject with subtle vertical bobbing and locked center point.',
    evaluate: (t: number): CameraState => {
      const angle = t * Math.PI * 0.75; // 135 degree arc
      const radius = 25;
      return {
        x: Math.sin(angle) * radius,
        y: Math.sin(t * Math.PI * 2) * 4,
        z: 1.0 + Math.cos(angle) * 0.15,
        pitch: -3 + Math.sin(t * Math.PI) * 4,
        yaw: (angle * 180) / Math.PI * 0.5,
        roll: Math.sin(angle) * -2.5,
        fov: 50 + Math.sin(t * Math.PI) * 4,
        focalDistance: 2.5,
      };
    },
  },

  fpv_dive: {
    id: 'fpv_dive',
    name: 'FPV Acro Dive & Roll',
    category: 'FPV',
    formulaLaTeX: 'Z(t) = 1.0 + 1.2 \\cdot t^2, \\text{Roll}(t) = A \\cdot \\sin(2\\pi t), \\text{Pitch}(t) = -35(1-t)',
    description: 'High-speed drone dive accelerating downward with dynamic banking roll and forward rush.',
    evaluate: (t: number): CameraState => {
      const speedRamp = Math.pow(t, 2.2);
      return {
        x: Math.sin(t * Math.PI * 2) * 18,
        y: -30 + speedRamp * 45,
        z: 1.0 + speedRamp * 0.95,
        pitch: -25 * (1 - t) + 12 * speedRamp,
        yaw: Math.sin(t * Math.PI) * 22,
        roll: Math.sin(t * Math.PI * 2) * 16,
        fov: 65 + speedRamp * 18,
        focalDistance: 1.8 - speedRamp * 0.8,
      };
    },
  },

  dolly_zoom_vertigo: {
    id: 'dolly_zoom_vertigo',
    name: 'Vertigo Dolly-Zoom (Hitchcock)',
    category: 'Cinematic',
    formulaLaTeX: 'Z(t) = Z_0(1-t) + Z_1 t, \\quad \\tan(\\text{FoV}/2) \\propto 1/Z(t)',
    description: 'Optical contra-zoom where camera dollies forward while lens widens to distort perspective background scale.',
    evaluate: (t: number): CameraState => {
      const ease = smoothstep(0, 1, t);
      const zScale = 1.0 + ease * 0.65;
      const fovVal = 35 + ease * 35; // Widens from telephoto 35mm to wide 70 deg
      return {
        x: 0,
        y: 0,
        z: zScale,
        pitch: 0,
        yaw: 0,
        roll: 0,
        fov: fovVal,
        focalDistance: 2.0,
      };
    },
  },

  rack_focus_push: {
    id: 'rack_focus_push',
    name: 'Rack Focus & Anamorphic Push',
    category: 'Cinematic',
    formulaLaTeX: 'D(t) = D_0 + (D_1 - D_0) \\cdot S(t), \\quad Z(t) = 1.0 + 0.25 \\cdot S(t)',
    description: 'Slow forward dolly with dramatic shift of focal plane from foreground element to distant subject.',
    evaluate: (t: number): CameraState => {
      const s = smoothstep(0.25, 0.75, t);
      return {
        x: (1 - s) * -6,
        y: 0,
        z: 1.0 + s * 0.25,
        pitch: -1.5,
        yaw: (1 - s) * -3,
        roll: 0,
        fov: 45 - s * 3,
        focalDistance: 0.8 + s * 3.2,
      };
    },
  },

  whip_pan_snap: {
    id: 'whip_pan_snap',
    name: 'Whip-Pan Kinetic Snap',
    category: 'Dynamic',
    formulaLaTeX: '\\text{Yaw}(t) = \\Delta \\theta \\cdot \\left[ \\frac{1}{1 + e^{-20(t - 0.5)}} \\right]',
    description: 'Ultra-fast rotational whip pan that snaps between two framings in under 200 milliseconds.',
    evaluate: (t: number): CameraState => {
      // Sigmoid snap around t = 0.5
      const snap = 1 / (1 + Math.exp(-22 * (t - 0.5)));
      return {
        x: (snap - 0.5) * 80,
        y: 0,
        z: 1.0 + Math.sin(t * Math.PI) * 0.35,
        pitch: 0,
        yaw: -45 + snap * 90,
        roll: Math.sin(t * Math.PI) * -8,
        fov: 52 + Math.sin(t * Math.PI) * 12,
        focalDistance: 2.0,
      };
    },
  },

  handheld_operator: {
    id: 'handheld_operator',
    name: 'Cinema Verité Handheld',
    category: 'Subtle',
    formulaLaTeX: 'P(t) = \\sum_{k=1}^3 A_k \\sin(\\omega_k t + \\phi_k)',
    description: 'Organic human operator micro-shake, subtle breathing sway, and shoulder rig inertia.',
    evaluate: (t: number): CameraState => {
      const shakeX = harmonicNoise(t, 2.4, 5.8, 11.2) * 5;
      const shakeY = harmonicNoise(t + 0.3, 1.8, 4.2, 9.6) * 4;
      const shakePitch = harmonicNoise(t + 0.7, 2.1, 4.9, 10.3) * 2.5;
      const shakeYaw = harmonicNoise(t + 0.5, 1.9, 3.8, 8.4) * 3;
      const shakeRoll = harmonicNoise(t + 0.2, 1.5, 3.2, 7.1) * 1.8;
      return {
        x: shakeX,
        y: shakeY,
        z: 1.02 + Math.sin(t * Math.PI * 2) * 0.04,
        pitch: shakePitch,
        yaw: shakeYaw,
        roll: shakeRoll,
        fov: 48 + Math.sin(t * Math.PI * 2) * 1.5,
        focalDistance: 2.2,
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

/**
 * Default visual + physics configuration for a Meridian Halo instance.
 * These values are shallow-merged with user-provided options in createHalo().
 */
import THREE from './threeAdapter';
const { Color } = THREE;
import type { Config } from './types';

/** Default configuration used if not overridden by HaloOptions. */
export const defaultConfig: Config = {
  // Canvas size (in device-independent pixels)
  width: 50,
  height: 50,

  // Particle counts and layout
  count: 1000,
  radius: 1.0,
  initialSpeed: 1.0,

  // Physics tuning (forces, damping, clamping)
  physics: {
    gravityStrength: 0.1,
    tangentialStrength: 1.6,
    springK: 1.0,
    damping: 0.985,
    maxVel: 4.0
  },

  // Swoosh modulation (impulse events across the halo)
  swoosh: {
    minInterval: 3,
    maxInterval: 8,
    duration: 1.6,
    amplitude: 5.0,
    groupRadius: 0.6,
    accentBoost: 0.8
  },

  // Visual tuning
  pointSize: 1.75,
  palettes: {
    neutralCool: { inner: new Color(0xfafcff).getHex(), outer: new Color(0xdfe7ee).getHex(), accent: new Color(0xe9f4ff).getHex() },
    deepTech:    { inner: new Color(0x0e3a5a).getHex(), outer: new Color(0x22b8d1).getHex(), accent: new Color(0x4bf0ff).getHex() },
    warmEthereal:{ inner: new Color(0xfff6ef).getHex(), outer: new Color(0xefe6ff).getHex(), accent: new Color(0xffefe0).getHex() }
  },

  // Mood system blends between two physics/color styles over a cycle
  mood: {
    cyclePeriod: 18,
    ethereal: { damping: 0.992, tangentialStrength: 1.2, springK: 0.9, twinkleAmp: 0.035, size: 0.9 },
    energetic:{ damping: 0.98,  tangentialStrength: 2.0, springK: 1.1, twinkleAmp: 0.07,  size: 1.05 }
  },

  // When enabled, cycles color palettes periodically
  styleCycle: { enabled: true, period: 8 },

  // Rendering mode (future: auto based on bg luma)
  mode: 'always-bright'
}; 
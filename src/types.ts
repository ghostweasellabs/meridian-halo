import type THREEType from './threeAdapter';
type THREE = typeof THREEType;

/** Palette definition in numeric hex (0xRRGGBB). */
export type Palette = {
  inner: number;
  outer: number;
  accent?: number;
};

/** Set of built-in palettes used by the mood/style system. */
export type Palettes = {
  neutralCool: Palette;
  deepTech: Palette;
  warmEthereal: Palette;
};

/** Physics tuning parameters. */
export type PhysicsCfg = {
  gravityStrength: number;
  tangentialStrength: number;
  springK: number;
  damping: number;
  maxVel: number;
};

/** Impulse/swoosh configuration. */
export type SwooshCfg = {
  minInterval: number;
  maxInterval: number;
  duration: number;
  amplitude: number;
  groupRadius: number;
  accentBoost: number;
};

/** Mood settings for blending between two visual/physics styles over time. */
export type MoodCfg = {
  cyclePeriod: number;
  ethereal: { damping: number; tangentialStrength: number; springK: number; twinkleAmp: number; size: number };
  energetic:{ damping: number; tangentialStrength: number; springK: number; twinkleAmp: number; size: number };
};

/** Runtime configuration (merged with defaults). */
export type Config = {
  width: number;
  height: number;
  count: number;
  radius: number;
  initialSpeed: number;
  physics: PhysicsCfg;
  swoosh: SwooshCfg;
  pointSize: number;
  palettes: Palettes;
  mood: MoodCfg;
  styleCycle: { enabled: boolean; period: number };
  mode: 'always-bright' | 'auto';
};

/** Creation options for createHalo(). Must include a mount element. */
export type HaloOptions = Partial<Config> & { mount: HTMLElement };

/** Public API of a running halo instance. */
export type HaloIcon = {
  setBrightness: (s: number)=> void;
  setMode: (m: 'always-bright' | 'auto')=> void;
  setBG: (hex: string | null)=> void;
  setStyleCycle: (enabled: boolean)=> void;
  destroy: ()=> void;
  three: { scene: THREE.Scene; renderer: THREE.Renderer; camera: THREE.Camera };
}; 
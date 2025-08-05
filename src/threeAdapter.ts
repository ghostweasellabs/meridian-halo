/**
 * threeAdapter
 * Resolves the Three.js runtime in different environments:
 * - Browser (script tag): returns window.THREE
 * - Bundled ESM/CJS: returns the imported 'three' module
 * This keeps our IIFE/browser build lightweight and compatible with CDN three,
 * while allowing modern bundlers to tree-shake ESM/CJS builds.
 */
export type {};
import * as THREE_NS from 'three';
const THREE: typeof THREE_NS = (typeof window !== 'undefined' && (window as any).THREE)
  ? (window as any).THREE
  : THREE_NS;
export default THREE; 
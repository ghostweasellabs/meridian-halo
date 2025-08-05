/**
 * Utilities for estimating background luma from a DOM element or override hex.
 * Useful for future auto-brightness/contrast behavior.
 */
export function hexToRgb(hex?: string | null){
  if (!hex) return null; const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return null; return { r: parseInt(m[1],16)/255, g: parseInt(m[2],16)/255, b: parseInt(m[3],16)/255 };
}

/**
 * Attempts to compute background luma for the element based on CSS `background-color`.
 * Falls back to a dark default when unavailable. Returns luma in [0..1].
 */
export function getBackgroundLuma(el: HTMLElement, overrideHex?: string | null){
  let rgb: { r:number; g:number; b:number } | null = null;
  if (overrideHex) rgb = hexToRgb(overrideHex);
  if (!rgb) {
    const cs = getComputedStyle(el.parentElement || document.body);
    const col = cs.backgroundColor || 'rgb(32,35,42)';
    const m = col.match(/rgba?\(([^)]+)\)/);
    if (m){ const parts = m[1].split(',').map(x=>parseFloat(x)/255); rgb = { r: parts[0], g: parts[1], b: parts[2] }; }
    else rgb = { r: 0.125, g: 0.137, b: 0.164 };
  }
  const luma = 0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b; // 0..1
  return luma;
} 
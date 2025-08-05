import THREE from '../threeAdapter';

/**
 * Creates a small radial gradient sprite used by point sprites.
 * The gradient is designed to have a soft edge and bright core.
 */
export function makeCircleSprite(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0.0, 'rgba(242,233,216,0.80)');
  g.addColorStop(0.22, 'rgba(242,238,232,0.12)');
  g.addColorStop(0.58, 'rgba(242,238,232,0.02)');
  g.addColorStop(1.0, 'rgba(242,238,232,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = false;
  return tex;
} 
/**
 * Approximate Gaussian sampler via sum of uniforms minus mean.
 * Returns a zero-mean value scaled by `scale` (default 1).
 */
export function randn(scale = 1) {
  return (Math.random() + Math.random() + Math.random() + Math.random() - 2) * (scale / 2);
} 
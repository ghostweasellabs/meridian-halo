import THREE from '../threeAdapter';
import { vert, frag } from './shader';
import { makeCircleSprite } from './spriteTexture';

/**
 * Builds the inner (nucleus) ShaderMaterial with slightly different palette/size.
 */
export function createInnerMaterial(config: { pointSize:number; radius:number }){
  const spriteTex = makeCircleSprite(64);
  const uniforms = {
    u_time: { value: 0 },
    u_size: { value: config.pointSize * 0.85 },
    u_twinkleAmp: { value: 0.0 },
    u_tex: { value: spriteTex },
    u_colorAccent: { value: new THREE.Color(0xffffff) },
    u_moodMix: { value: 0.0 },
    u_radius: { value: config.radius },
    u_alphaScale: { value: 1.5 },
    u_alphaCut: { value: 0.05 },
    u_innerA: { value: new THREE.Color(0xFFCFA5) },
    u_outerA: { value: new THREE.Color(0xFFE7CF) },
    u_innerB: { value: new THREE.Color(0xFFB98A) },
    u_outerB: { value: new THREE.Color(0xFFEEDD) },
    u_paletteMix: { value: 0.0 },
    u_frontTint: { value: new THREE.Color(0xFFE7D1) },
    u_backTint:  { value: new THREE.Color(0xFFD9B8) },
    u_depthStrength: { value: 0.0 },
    u_innerRadiusFactor: { value: 1.0 },
    u_layerAlphaMul0: { value: 1.0 },
    u_layerAlphaMul1: { value: 1.0 },
    u2_front: { value: new THREE.Color(0xFFD9B8) },
    u2_back:  { value: new THREE.Color(0xFFC394) },
    u2_edge:  { value: new THREE.Color(0xFFB07B) }
  } as const;
  const mat = new THREE.ShaderMaterial({
    uniforms: uniforms as any,
    vertexShader: `uniform float u_time; uniform float u_size; uniform float u_twinkleAmp;\n` + vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    premultipliedAlpha: true
  });
  return { mat, uniforms: uniforms as any };
} 
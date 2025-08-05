import THREE from '../threeAdapter';
import { vert, frag } from './shader';
import { makeCircleSprite } from './spriteTexture';

/**
 * Builds the outer halo ShaderMaterial and exposes its uniform bag.
 */
export function createOuterMaterial(config: { pointSize:number; radius:number }){
  const spriteTex = makeCircleSprite(64);
  const uniforms = {
    u_time: { value: 0 },
    u_size: { value: config.pointSize },
    u_twinkleAmp: { value: 0.0 },
    u_tex: { value: spriteTex },
    u_colorAccent: { value: new THREE.Color(0xffffff) },
    u_moodMix: { value: 0.0 },
    u_radius: { value: config.radius },
    u_alphaScale: { value: 1.28 },
    u_alphaCut: { value: 0.05 },
    u_innerA: { value: new THREE.Color(0x6FD6FF) },
    u_outerA: { value: new THREE.Color(0x2AB9D1) },
    u_innerB: { value: new THREE.Color(0x88E6FF) },
    u_outerB: { value: new THREE.Color(0x1AA0B5) },
    u_paletteMix: { value: 0.0 },
    u_frontTint: { value: new THREE.Color(0xEAF7FF) },
    u_backTint:  { value: new THREE.Color(0xDAFAFF) },
    u_depthStrength: { value: 0.0 },
    u_innerRadiusFactor: { value: 0.92 },
    u_layerAlphaMul0: { value: 1.0 },
    u_layerAlphaMul1: { value: 0.92 },
    u2_front: { value: new THREE.Color(0x7FE1D9) },
    u2_back:  { value: new THREE.Color(0xA6F2FF) },
    u2_edge:  { value: new THREE.Color(0x62E7D1) }
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
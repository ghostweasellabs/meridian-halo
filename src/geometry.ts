import THREE from './threeAdapter';
import { randn } from './utils/rng';

/**
 * Geometry generation for the inner/outer particle fields.
 * Particles are distributed on a sphere using radius ~ cbrt(U) for uniform density,
 * with small Gaussian jitter. Returns SoA-structured typed arrays for performance.
 */
export type ParticleSet = {
  positions: Float32Array;
  velocities: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
  baseRadii?: Float32Array;
  basePositions: Float32Array;
};

/**
 * Creates the outer particle cloud with layered points and tangential initial velocity.
 */
export function createOuterParticles(count:number, radius:number, pointSize:number, initialSpeed:number){
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const layers = new Float32Array(count);
  const seeds = new Float32Array(count);
  const baseRadii = new Float32Array(count);

  for (let i = 0; i < count; i++){
    // sample radius for uniform sphere density
    const u = Math.random();
    const r = radius * Math.cbrt(u);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    const ix = 3*i, iy = ix+1, iz = ix+2;
    positions[ix] = x*r + randn(0.01);
    positions[iy] = y*r + randn(0.01);
    positions[iz] = z*r + randn(0.01);
    baseRadii[i] = r;
    // initial tangential velocity around the sphere
    const radVec = new THREE.Vector3(x,y,z).normalize();
    const helper = Math.abs(radVec.y) < 0.9 ? new THREE.Vector3(0,1,0) : new THREE.Vector3(1,0,0);
    const tanVec = new THREE.Vector3().crossVectors(radVec, helper).normalize();
    velocities[ix] = tanVec.x * initialSpeed;
    velocities[iy] = tanVec.y * initialSpeed;
    velocities[iz] = tanVec.z * initialSpeed;
    const c = new THREE.Color(0xfafcff).multiplyScalar(0.7 + Math.random()*0.3);
    colors[ix]=c.r; colors[iy]=c.g; colors[iz]=c.b;
    sizes[i] = pointSize * (0.8 + Math.random()*0.4);
    layers[i] = (Math.random()<0.5)?0.0:1.0;
    seeds[i] = Math.random();
  }
  const basePositions = new Float32Array(positions);
  return { positions, velocities, colors, sizes, seeds, baseRadii, basePositions, layers } as const;
}

/**
 * Creates the inner particle cloud (nucleus) with slightly different jitter and speed.
 */
export function createInnerParticles(count:number, radius:number, pointSize:number, initialSpeed:number){
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++){
    const u = Math.random();
    const r = radius * Math.cbrt(u);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    const ix = 3*i, iy = ix+1, iz = ix+2;
    positions[ix] = x*r + randn(0.006);
    positions[iy] = y*r + randn(0.006);
    positions[iz] = z*r + randn(0.006);
    const radVec = new THREE.Vector3(x,y,z).normalize();
    const helper = Math.abs(radVec.y) < 0.9 ? new THREE.Vector3(0,1,0) : new THREE.Vector3(1,0,0);
    const tanVec = new THREE.Vector3().crossVectors(radVec, helper).normalize();
    velocities[ix] = tanVec.x * (initialSpeed * 0.8);
    velocities[iy] = tanVec.y * (initialSpeed * 0.8);
    velocities[iz] = tanVec.z * (initialSpeed * 0.8);
    const c = new THREE.Color(0xF2E9D8).multiplyScalar(0.85 + Math.random()*0.2);
    colors[ix]=c.r; colors[iy]=c.g; colors[iz]=c.b;
    sizes[i] = pointSize * (0.7 + Math.random()*0.25);
    seeds[i] = Math.random();
  }
  const basePositions = new Float32Array(positions);
  return { positions, velocities, colors, sizes, seeds, basePositions } as const;
} 
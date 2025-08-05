import THREE from './threeAdapter';
const { Color } = THREE;

/** Linear interpolation helper. */
export function lerp(a:number,b:number,t:number){ return a + (b-a)*t; }

/** Wraps index into [0, length). */
export function cycleIndex(length:number, i:number){ return (i % length + length) % length; }

/** Apply a palette to shader uniforms (expects THREE.Color uniforms). */
export function setPaletteUniforms(target: { u_innerA: any; u_outerA:any }, p: { inner:number; outer:number }){
  target.u_innerA.value.setHex(p.inner);
  target.u_outerA.value.setHex(p.outer);
}

/** Convenience: convert numeric hex to normalized THREE hex via Color helper. */
export function hex(c:number){ return new Color(c).getHex(); } 
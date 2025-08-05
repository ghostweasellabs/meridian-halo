import THREE from '../threeAdapter';
const { Vector3 } = THREE;

/** Physics step for the inner (nucleus) particle field. */
export type InnerState = {
  positions: Float32Array;
  velocities: Float32Array;
  basePositions: Float32Array;
  config: {
    count: number; radius: number;
    physics: { gravityStrength:number; maxVel:number };
    swoosh: { groupRadius:number };
  };
};

/**
 * Integrates inner particle positions/velocities by dt seconds.
 * Similar to outer, but slightly stronger spring and different damping to keep the core cohesive.
 */
export function updateInner(state: InnerState, dt:number, center: Vector3, tang:number, swooshFactor:number, spr:number, dmp:number){
  const { positions, velocities, basePositions, config } = state;
  for (let i = 0; i < config.count; i++){
    const ix = 3*i, iy = ix+1, iz = ix+2;
    const px = positions[ix], py = positions[iy], pz = positions[iz];
    const dx = px - center.x, dy = py - center.y, dz = pz - center.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.001;
    const invDist = 1.0 / dist;

    // slightly stronger central gravity in the nucleus
    const grav = (config.physics.gravityStrength * 1.15) * invDist * invDist;
    const ax = -dx * invDist * grav;
    const ay = -dy * invDist * grav;
    const az = -dz * invDist * grav;

    const rx = dx * invDist, ry = dy * invDist, rz = dz * invDist;
    let hx = 0.0, hy = 1.0, hz = 0.0;
    if (Math.abs(ry) > 0.9) { hx = 1.0; hy = 0.0; hz = 0.0; }
    const tx = ry*hz - rz*hy;
    const ty = rz*hx - rx*hz;
    const tz = rx*hy - ry*hx;
    const tlen = Math.hypot(tx,ty,tz) + 0.0001;
    const orx = tx / tlen, ory = ty / tlen, orz = tz / tlen;
    const orb = (tang * 0.7) * invDist;

    const fall = Math.exp(- (dist*dist) / (2.0 * (config.swoosh.groupRadius*0.5) * (config.swoosh.groupRadius*0.5)));
    const sb = (swooshFactor * 0.6) * invDist * fall;

    const sx = (basePositions[ix] - px) * (spr * 1.25);
    const sy = (basePositions[iy] - py) * (spr * 1.25);
    const sz = (basePositions[iz] - pz) * (spr * 1.25);

    velocities[ix] += (ax + orx*orb + orx*sb + sx) * dt;
    velocities[iy] += (ay + ory*orb + ory*sb + sy) * dt;
    velocities[iz] += (az + orz*orb + orz*sb + sz) * dt;

    // gentler damping tweak to keep a subtle inner glow motion
    const dmpInner = (dmp * 0.992/0.985);
    velocities[ix] *= dmpInner; velocities[iy] *= dmpInner; velocities[iz] *= dmpInner;

    // tighter velocity cap for the nucleus
    const maxV = state.config.physics.maxVel * 0.75;
    const vx = velocities[ix], vy = velocities[iy], vz = velocities[iz];
    const m2 = vx*vx + vy*vy + vz*vz;
    const max2 = maxV*maxV;
    if (m2 > max2) { const m = Math.sqrt(m2); const s = maxV / m; velocities[ix]*=s; velocities[iy]*=s; velocities[iz]*=s; }

    positions[ix] += velocities[ix] * dt;
    positions[iy] += velocities[iy] * dt;
    positions[iz] += velocities[iz] * dt;

    const lenSq = positions[ix]*positions[ix] + positions[iy]*positions[iy] + positions[iz]*positions[iz];
    if (lenSq > config.radius * config.radius) {
      const len = Math.sqrt(lenSq);
      const nx = positions[ix] / len;
      const ny = positions[iy] / len;
      const nz = positions[iz] / len;
      positions[ix] = nx * config.radius;
      positions[iy] = ny * config.radius;
      positions[iz] = nz * config.radius;
      const dot = velocities[ix]*nx + velocities[iy]*ny + velocities[iz]*nz;
      velocities[ix] -= 2 * dot * nx;
      velocities[iy] -= 2 * dot * ny;
      velocities[iz] -= 2 * dot * nz;
    }
  }
} 
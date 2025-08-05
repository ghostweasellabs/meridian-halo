import THREE from '../threeAdapter';
const { Vector3 } = THREE;

/** Physics step for the outer particle field. */
export type OuterState = {
  positions: Float32Array;
  velocities: Float32Array;
  basePositions: Float32Array;
  config: {
    count: number; radius: number;
    physics: { gravityStrength:number; maxVel:number };
    swoosh: { groupRadius:number };
  };
};

function clampVec(velocities: Float32Array, ix:number, iy:number, iz:number, maxV:number){
  const vx = velocities[ix], vy = velocities[iy], vz = velocities[iz];
  const m2 = vx*vx + vy*vy + vz*vz;
  const max2 = maxV*maxV;
  if (m2 > max2) {
    const m = Math.sqrt(m2); const s = maxV / m;
    velocities[ix] *= s; velocities[iy] *= s; velocities[iz] *= s;
  }
}

/**
 * Integrates outer particle positions/velocities by dt seconds.
 * Applies central gravity, tangential orbit, swoosh impulse, spring to base positions, and damping.
 */
export function updateOuter(state: OuterState, dt:number, center: Vector3, tang:number, swooshFactor:number, spr:number, dmp:number, mixV:number){
  const { positions, velocities, basePositions, config } = state;
  for (let i = 0; i < config.count; i++){
    const ix = 3*i, iy = ix+1, iz = ix+2;
    const px = positions[ix], py = positions[iy], pz = positions[iz];
    const dx = px - center.x, dy = py - center.y, dz = pz - center.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.001;
    const invDist = 1.0 / dist;

    // gravity ~ 1/r^2
    const grav = config.physics.gravityStrength * invDist * invDist;
    const ax = -dx * invDist * grav;
    const ay = -dy * invDist * grav;
    const az = -dz * invDist * grav;

    // local tangent (orbit) around radial axis
    const rx = dx * invDist, ry = dy * invDist, rz = dz * invDist;
    let hx = 0.0, hy = 1.0, hz = 0.0;
    if (Math.abs(ry) > 0.9) { hx = 1.0; hy = 0.0; hz = 0.0; }
    const tx = ry*hz - rz*hy;
    const ty = rz*hx - rx*hz;
    const tz = rx*hy - ry*hx;
    const tlen = Math.hypot(tx,ty,tz) + 0.0001;
    const orx = tx / tlen, ory = ty / tlen, orz = tz / tlen;
    const orb = tang * invDist;

    // transient swoosh impulse around local tangent
    const fall = Math.exp(- (dist*dist) / (2.0 * config.swoosh.groupRadius * config.swoosh.groupRadius));
    const sb = swooshFactor * invDist * fall * 0.8;

    // spring back to base sphere to maintain shape
    const sx = (basePositions[ix] - px) * spr;
    const sy = (basePositions[iy] - py) * spr;
    const sz = (basePositions[iz] - pz) * spr;

    velocities[ix] += (ax + orx*orb + orx*sb + sx) * dt;
    velocities[iy] += (ay + ory*orb + ory*sb + sy) * dt;
    velocities[iz] += (az + orz*orb + orz*sb + sz) * dt;

    // damping and clamping
    velocities[ix] *= dmp; velocities[iy] *= dmp; velocities[iz] *= dmp;
    clampVec(velocities, ix, iy, iz, state.config.physics.maxVel*(0.8+0.8*mixV));

    // integrate position
    positions[ix] += velocities[ix] * dt;
    positions[iy] += velocities[iy] * dt;
    positions[iz] += velocities[iz] * dt;

    // confine to sphere of radius
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
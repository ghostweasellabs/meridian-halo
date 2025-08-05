import THREE from './threeAdapter';
import { defaultConfig } from './config';
import type { HaloOptions, HaloIcon } from './types';
import { createScene } from './scene';
import { createOuterParticles, createInnerParticles } from './geometry';
import { createOuterMaterial } from './materials/outerMaterial';
import { createInnerMaterial } from './materials/innerMaterial';
import { lerp } from './palette';
import { updateOuter } from './physics/outerPhysics';
import { updateInner } from './physics/innerPhysics';

/**
 * Creates a Meridian Halo instance in the given mount element.
 * Returns control methods to tweak brightness, style cycle, and dispose resources.
 */
export function createHalo(opts: HaloOptions): HaloIcon {
  const cfg = { ...defaultConfig, ...opts };
  const mount = opts.mount;

  // Build Three.js render state
  const { renderer, scene, camera, group } = createScene(cfg.width, cfg.height);
  mount.innerHTML = '';
  mount.appendChild(renderer.domElement);

  // Generate particle buffers
  const outer = createOuterParticles(cfg.count, cfg.radius, cfg.pointSize, cfg.initialSpeed);
  const innerCount = Math.floor(cfg.count * 0.5);
  const innerRadius = cfg.radius * 0.85;
  const inner = createInnerParticles(innerCount, innerRadius, cfg.pointSize, cfg.initialSpeed);

  // Geometry attributes
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(outer.positions, 3).setUsage(THREE.DynamicDrawUsage));
  geom.setAttribute('color', new THREE.BufferAttribute(outer.colors, 3));
  geom.setAttribute('size', new THREE.BufferAttribute(outer.sizes, 1));
  geom.setAttribute('seed', new THREE.BufferAttribute(outer.seeds, 1));
  geom.setAttribute('layer', new THREE.BufferAttribute((outer as any).layers, 1));
  geom.setAttribute('baseR', new THREE.BufferAttribute(outer.baseRadii!, 1));

  const geom2 = new THREE.BufferGeometry();
  geom2.setAttribute('position', new THREE.BufferAttribute(inner.positions, 3).setUsage(THREE.DynamicDrawUsage));
  geom2.setAttribute('color', new THREE.BufferAttribute(inner.colors, 3));
  geom2.setAttribute('size', new THREE.BufferAttribute(inner.sizes, 1));
  geom2.setAttribute('seed', new THREE.BufferAttribute(inner.seeds, 1));

  // Materials
  const { mat: matOuter, uniforms: uniformsOuter } = createOuterMaterial({ pointSize: cfg.pointSize, radius: cfg.radius });
  const { mat: matInner, uniforms: uniformsInner } = createInnerMaterial({ pointSize: cfg.pointSize, radius: innerRadius });

  // Points
  const points = new THREE.Points(geom, matOuter);
  const points2 = new THREE.Points(geom2, matInner);
  group.add(points);
  group.add(points2);

  // Animation + style cycle state
  const center = new THREE.Vector3();
  let next = 0, start = 0;
  function schedule(t: number) {
    start = t;
    const idx = Math.floor(Math.random() * cfg.count);
    center.set(
      outer.positions[3*idx],
      outer.positions[3*idx + 1],
      outer.positions[3*idx + 2]
    );
    next = t + cfg.swoosh.minInterval + Math.random() * (cfg.swoosh.maxInterval - cfg.swoosh.minInterval);
  }

  let lastTime = performance.now() / 1000;
  let styleIndex = 0;
  const styles = [cfg.palettes.neutralCool, cfg.palettes.deepTech, cfg.palettes.warmEthereal];
  let nextStyleSwitch = performance.now() / 1000 + (cfg.styleCycle.enabled ? cfg.styleCycle.period : 1e9);
  let paletteBlendStart = 0;
  let paletteBlending = false;
  const paletteBlendDuration = 1.2;

  // Main RAF loop with physics step + render
  function animate(){
    const t = performance.now() / 1000;
    const dt = Math.min(0.033, t - lastTime);
    lastTime = t;
    requestAnimationFrame(animate);

    // Periodically blend to the next palette if styleCycle is enabled
    if (cfg.styleCycle.enabled && t >= nextStyleSwitch){
      styleIndex = (styleIndex + 1) % styles.length;
      nextStyleSwitch = t + cfg.styleCycle.period;
      paletteBlending = true;
      paletteBlendStart = t;
    }
    if (paletteBlending) {
      const k = Math.min(1.0, (t - paletteBlendStart) / paletteBlendDuration);
      (uniformsOuter as any).u_paletteMix.value = k;
      if (k >= 1.0) paletteBlending = false;
    }

    // Mood controls multiple parameters in sync
    const moodPhase = (Math.sin((t/ cfg.mood.cyclePeriod)*Math.PI*2.0) * 0.5 + 0.5);
    const mixV = moodPhase;
    (uniformsOuter as any).u_moodMix.value = mixV;
    (uniformsInner as any).u_moodMix.value = mixV;
    const dmp = lerp(cfg.mood.ethereal.damping,   cfg.mood.energetic.damping,   mixV);
    const tang= lerp(cfg.mood.ethereal.tangentialStrength, cfg.mood.energetic.tangentialStrength, mixV) * (1.0 + 0.02*Math.sin(t*0.7)*Math.sin(t*0.21+2.1));
    const spr = lerp(cfg.mood.ethereal.springK,   cfg.mood.energetic.springK,   mixV);

    // Schedule a swoosh event
    if (t >= next) schedule(t);
    const u = (t - start) / cfg.swoosh.duration;
    const swooshFactor = u < 1 ? Math.sin(u * Math.PI) * cfg.swoosh.amplitude : 0;

    // Gentle rotation + physics update
    group.rotation.y += 0.025 * dt * (0.5 + 0.7*mixV);
    group.rotation.x += 0.006 * dt;

    updateOuter({ positions: outer.positions, velocities: outer.velocities, basePositions: outer.basePositions, config: { count: cfg.count, radius: cfg.radius, physics: cfg.physics, swoosh: cfg.swoosh } }, dt, center, tang, swooshFactor, spr, dmp, mixV);
    updateInner({ positions: inner.positions, velocities: inner.velocities, basePositions: inner.basePositions, config: { count: innerCount, radius: innerRadius, physics: cfg.physics, swoosh: cfg.swoosh } }, dt, center, tang, swooshFactor, spr, dmp);

    (uniformsOuter as any).u_time.value = t;
    (uniformsInner as any).u_time.value = t;

    (geom.attributes.position as any).needsUpdate = true;
    (geom2.attributes.position as any).needsUpdate = true;

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }
  animate();

  /** Dispose all GPU resources and DOM. */
  function destroy(){
    renderer.dispose();
    (points.material as THREE.Material).dispose();
    (points2.material as THREE.Material).dispose();
    geom.dispose();
    geom2.dispose();
    mount.innerHTML = '';
  }

  return {
    setBrightness: (s)=>{ (uniformsOuter as any).u_alphaScale.value = s; (uniformsInner as any).u_alphaScale.value = s; },
    setMode: (m)=>{ /* future: adaptive luma hook */ },
    setBG: (_)=>{},
    setStyleCycle: (enabled)=>{ cfg.styleCycle.enabled = enabled; },
    destroy,
    three: { scene, renderer, camera }
  };
}

/** Convenience wrapper to call destroy() on a HaloIcon. */
export function destroyHalo(icon: HaloIcon){ icon.destroy(); } 
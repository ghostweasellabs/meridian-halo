# Meridian Halo

A polished, animated particle halo built with Three.js. Drop it into a web page via a script tag, or import it in modern apps as ESM/CJS. Includes external and standalone browser bundles and a minimal, documented API.

## Demo

Run the local demos:

```bash
npm run demo:serve
```

Open:
- External Three (script tag): http://localhost:8080/demo/
- Standalone (no dependencies): http://localhost:8080/demo/standalone.html
- ESM (module import): http://localhost:8080/demo/esm.html

## Installation

Install via npm (for ESM/CJS consumption):

```bash
npm install meridian-halo three
```

Or include via script tags (no install required): see Browser usage below.

## Usage

### ESM (recommended)

```ts
import * as MeridianHalo from 'meridian-halo';

const mount = document.getElementById('app')!;
const halo = MeridianHalo.createHalo({ mount, width: 512, height: 512 });

// later
halo.destroy();
```

### CJS (Node/CommonJS)

```js
const MeridianHalo = require('meridian-halo');
const mount = document.getElementById('app');
const halo = MeridianHalo.createHalo({ mount, width: 512, height: 512 });
```

### Browser (external Three)

```html
<div id="app"></div>
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script src="/dist/meridian-halo.min.js"></script>
<script>
  const mount = document.getElementById('app');
  const halo = MeridianHalo.createHalo({ mount, width: 512, height: 512 });
</script>
```

Note: Three’s "build/three.min.js" logs a deprecation warning but works. For a fully modern path, use the ESM demo which imports `build/three.module.js`.

### Browser (standalone, no dependencies)

```html
<div id="app"></div>
<script src="/dist/meridian-halo.standalone.min.js"></script>
<script>
  const halo = MeridianHalo.createHalo({ mount: document.getElementById('app'), width: 512, height: 512 });
</script>
```

## API

### createHalo(options: HaloOptions): HaloIcon
Creates and mounts a halo instance. Returns methods for control and cleanup.

### destroyHalo(icon: HaloIcon): void
Convenience wrapper to dispose the instance.

### HaloIcon
- setBrightness(scale: number): void
- setMode(mode: 'always-bright' | 'auto'): void
- setBG(hex: string | null): void
- setStyleCycle(enabled: boolean): void
- destroy(): void
- three: { scene: THREE.Scene; renderer: THREE.Renderer; camera: THREE.Camera }

### HaloOptions (partial)
- mount: HTMLElement (required)
- width, height: number — canvas size in CSS pixels
- count: number — total particles (outer + inner)
- radius: number — base radius of the halo sphere
- initialSpeed: number — initial tangential velocity scalar
- pointSize: number — base point size
- physics: { gravityStrength, tangentialStrength, springK, damping, maxVel }
- swoosh: { minInterval, maxInterval, duration, amplitude, groupRadius, accentBoost }
- palettes: { neutralCool, deepTech, warmEthereal }
- mood: { cyclePeriod, ethereal, energetic }
- styleCycle: { enabled, period }
- mode: 'always-bright' | 'auto'

Defaults are defined in `src/config.ts` and merged with your options.

## Notes

- Rendering: Uses a simple Three.js scene with a single `Group` and two `Points` meshes (outer/inner).
- Performance: Uses typed arrays and in-place updates; geometry attributes are marked dynamic and updated per frame.
- Browser bundles:
  - `dist/meridian-halo.min.js`: expects `window.THREE` (external three). Small and flexible.
  - `dist/meridian-halo.standalone.min.js`: includes Three.js for zero-dependency drop-in. Heavier.
- ESM/CJS builds for modern bundlers:
  - `dist/meridian-halo.mjs` (ESM)
  - `dist/meridian-halo.cjs` (CommonJS)

## Development

Build:
```bash
npm run build
```

Watch:
```bash
npm run dev
```

Serve demos:
```bash
npm run demo:serve
```

## Release

CI will build and attach artifacts when you push a tag starting with `v` (e.g., `v0.1.0`).

Local release helper (uses gh):
```bash
# 1) bump package.json version first (e.g., 0.1.0)
# 2) commit your changes
npm run release
```
This will build, create an annotated tag `v<version>`, push tags, and create a GitHub Release with artifacts.

---

Licensed under MIT. 
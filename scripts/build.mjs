import { build, context } from 'esbuild';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const srcDir = resolve(root, 'src');
const distDir = resolve(root, 'dist');

const watch = process.argv.includes('--watch');

await mkdir(distDir, { recursive: true });

const common = {
  entryPoints: [resolve(srcDir, 'index.ts')],
  bundle: true,
  sourcemap: true,
  minify: true,
};

function browserThreeGlobalPlugin(){
  return {
    name: 'browser-three-global',
    setup(build){
      // Resolve the bare import 'three' to a virtual module
      build.onResolve({ filter: /^three$/ }, (args) => {
        return { path: 'three-browser-global', namespace: 'global' };
      });
      // Provide the virtual module that re-exports window.THREE symbols
      build.onLoad({ filter: /^three-browser-global$/, namespace: 'global' }, async () => {
        const contents = `
          const T = (typeof window !== 'undefined' && window.THREE) ? window.THREE : {};
          export const REVISION = T.REVISION;
          export const Scene = T.Scene; export const Group = T.Group; export const PerspectiveCamera = T.PerspectiveCamera; export const WebGLRenderer = T.WebGLRenderer;
          export const BufferGeometry = T.BufferGeometry; export const BufferAttribute = T.BufferAttribute; export const DynamicDrawUsage = T.DynamicDrawUsage; export const Points = T.Points;
          export const ShaderMaterial = T.ShaderMaterial; export const NormalBlending = T.NormalBlending; export const CanvasTexture = T.CanvasTexture;
          export const Color = T.Color; export const Vector3 = T.Vector3;
          export default T;
        `;
        return { contents, loader: 'js' };
      });
    }
  };
}

function replaceRequireThreePlugin(){
  // no longer used; keeping name to avoid larger diff but return a no-op
  return { name: 'noop', setup(){} };
}

async function buildAll(){
  // Library targets for package consumption
  await build({
    ...common,
    external: ['three'],
    format: 'esm',
    outfile: resolve(distDir, 'meridian-halo.mjs'),
  });
  await build({
    ...common,
    external: ['three'],
    format: 'cjs',
    outfile: resolve(distDir, 'meridian-halo.cjs'),
  });
  // External IIFE (expects global THREE)
  await build({
    ...common,
    external: [],
    format: 'iife',
    globalName: 'MeridianHalo',
    outfile: resolve(distDir, 'meridian-halo.min.js'),
    banner: { js: '/* Meridian Halo */' },
    plugins: [browserThreeGlobalPlugin()],
  });
  // Standalone IIFE (inlines three)
  await build({
    ...common,
    format: 'iife',
    globalName: 'MeridianHalo',
    outfile: resolve(distDir, 'meridian-halo.standalone.min.js'),
    banner: { js: '/* Meridian Halo (standalone) */' },
  });

  await writeFile(resolve(distDir, 'index.d.ts'), `export * from '../src/public';\n`);

  // Remove any legacy index.* artifacts if present
  const legacy = [
    'index.mjs','index.mjs.map','index.cjs','index.cjs.map','index.umd.min.js','index.umd.min.js.map',
    'meridian-halo.umd.min.js','meridian-halo.umd.min.js.map','meridian-halo.standalone.umd.min.js','meridian-halo.standalone.umd.min.js.map'
  ];
  for (const f of legacy) {
    try { await rm(resolve(distDir, f)); } catch {}
  }
}

async function watchAll(){
  const ctxEsm = await context({ ...common, external: ['three'], format: 'esm', outfile: resolve(distDir, 'meridian-halo.mjs') });
  const ctxCjs = await context({ ...common, external: ['three'], format: 'cjs', outfile: resolve(distDir, 'meridian-halo.cjs') });
  const ctxUmd = await context({ ...common, external: [], format: 'iife', globalName: 'MeridianHalo', outfile: resolve(distDir, 'meridian-halo.min.js'), banner: { js: '/* Meridian Halo */' }, plugins: [browserThreeGlobalPlugin()] });
  const ctxUmdStandalone = await context({ ...common, format: 'iife', globalName: 'MeridianHalo', outfile: resolve(distDir, 'meridian-halo.standalone.min.js'), banner: { js: '/* Meridian Halo (standalone) */' } });
  await Promise.all([ctxEsm.watch(), ctxCjs.watch(), ctxUmd.watch(), ctxUmdStandalone.watch()]);
  console.log('Watching for changes...');
}

if (watch) {
  await watchAll();
} else {
  await buildAll();
}

// optional: copy demo later
try {
  await mkdir(resolve(root, 'demo'), { recursive: true });
} catch {} 
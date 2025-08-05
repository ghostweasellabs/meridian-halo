#!/usr/bin/env node
// Creates a git tag and GitHub Release for the current package.json version.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function sh(cmd){
  return execSync(cmd, { stdio: 'inherit' });
}

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = pkg.version;
if(!version){
  console.error('No version in package.json');
  process.exit(1);
}
const tag = `v${version}`;

try {
  // create tag if not exists
  execSync(`git rev-parse --verify ${tag}`, { stdio: 'ignore' });
  console.log(`Tag ${tag} already exists.`);
} catch {
  sh(`git tag -a ${tag} -m "Release ${tag}"`);
  sh('git push --tags');
}

// Create GitHub release with artifacts
try {
  sh(`gh release view ${tag}`);
  console.log(`GitHub release ${tag} already exists.`);
} catch {
  sh(`gh release create ${tag} dist/meridian-halo.mjs dist/meridian-halo.cjs dist/meridian-halo.min.js dist/meridian-halo.standalone.min.js --title ${tag} --notes "Automated release ${tag}"`);
} 
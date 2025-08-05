// Public entrypoint: re-export the library API for package consumers.
// Consumers should import from the package root.

/** Create and manage a Meridian Halo instance. */
export { createHalo, destroyHalo } from './public';

/** Public types for Halo creation and control. */
export type { HaloIcon, HaloOptions } from './types'; 
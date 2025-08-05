import THREE from './threeAdapter';

/**
 * Creates a minimal Three.js scene graph for the halo.
 * Returns renderer + scene + camera + a root group to attach mesh/points.
 */
export function createScene(width:number, height:number){
  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10);
  camera.position.set(0, 0, 3.2);
  scene.add(camera);
  const group = new THREE.Group();
  scene.add(group);
  return { renderer, scene, camera, group };
}

/**
 * Adjust the renderer/camera to a new width/height.
 * Should be called on container resize.
 */
export function resize(renderer:THREE.WebGLRenderer, camera:THREE.PerspectiveCamera, width:number, height:number){
  renderer.setSize(width, height);
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
} 
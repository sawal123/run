// player.js
import * as THREE from 'three';

export function setupPlayer(scene, gltf, xPos, scaleSize) {
  const model = gltf.scene;
  model.scale.set(scaleSize, scaleSize, scaleSize);
  model.position.set(xPos, 0, 1);
  model.rotation.y = Math.PI;
  model.traverse((child) => {
    if (child.isMesh) child.frustumCulled = false;
  });
  scene.add(model);

  let mixer = null;
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    const runAnimation = gltf.animations.find((anim) =>
      anim.name.toLowerCase().includes("run")
    );
    mixer.clipAction(runAnimation || gltf.animations[0]).play();
  }
  return { model, mixer };
}
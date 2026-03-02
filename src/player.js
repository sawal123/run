// player.js
import * as THREE from "three";

export function setupPlayer(scene, gltf, xPos, scaleSize) {
  const model = gltf.scene;
  model.scale.set(scaleSize, scaleSize, scaleSize);
  model.position.set(xPos, 0, 0);
  model.rotation.y = Math.PI;

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  let mixer = null;
  let actions = {}; // Kita buat wadah khusus untuk menyimpan naskahnya

  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);

    // Cari animasi berdasarkan nama yang tadi kamu buat di Blender
    let idleAnim = gltf.animations.find((a) =>
      a.name.toLowerCase().includes("idle"),
    );
    let runAnim = gltf.animations.find((a) =>
      a.name.toLowerCase().includes("run"),
    );

    // Jaga-jaga kalau namanya tidak terdeteksi, ambil urutan 0 dan 1
    if (!idleAnim) idleAnim = gltf.animations[0];
    if (!runAnim) runAnim = gltf.animations[1] || gltf.animations[0];

    actions.idle = mixer.clipAction(idleAnim);
    actions.run = mixer.clipAction(runAnim);

    // MAINKAN KEDUANYA BERSAMAAN TERUS-MENERUS!
    actions.idle.play();
    actions.run.play();

    // Tapi di awal (saat diam), sembunyikan gerakan larinya
    actions.idle.setEffectiveWeight(1); // 1 = Tampil 100%
    actions.run.setEffectiveWeight(0); // 0 = Sembunyi
  }

  scene.add(model);
  // WAJIB: Kembalikan variabel 'actions' agar bisa dibaca di main.js
  return { model, mixer, actions };
}

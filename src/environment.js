// environment.js
import * as THREE from 'three';

export function buildWorld(scene, assets, finishZ) {
  const { roadGltf, startGltf, finishGltf, b1Gltf, b2Gltf, b3Gltf } = assets;
  const arrayGedung = [b1Gltf.scene, b2Gltf.scene, b3Gltf.scene];

  // Setup Garis Start & Finish
  const skalaTugu = 0.04;
  startGltf.scene.scale.set(skalaTugu, skalaTugu, skalaTugu);
  startGltf.scene.position.set(0, 0, 20);
  scene.add(startGltf.scene);

  finishGltf.scene.scale.set(skalaTugu, skalaTugu, skalaTugu);
  finishGltf.scene.position.set(0, 2.4, finishZ);
  scene.add(finishGltf.scene);

  // Setup Jalan & Gedung
  const panjangJalanMaksimal = Math.abs(finishZ) + 60;
  const panjangPerSegmen = 10;
  const skalaJalanLebar = 0.05, skalaJalanPanjang = 0.02;
  const skalaGedung = 3.5, jarakGedung = 20;

  for (let z = 10; z >= -panjangJalanMaksimal; z -= panjangPerSegmen) {
    const jalan = roadGltf.scene.clone();
    jalan.scale.set(skalaJalanLebar, skalaJalanPanjang, skalaJalanPanjang);
    jalan.position.set(0, 0, z);
    scene.add(jalan);

    const gedungKiri = arrayGedung[Math.floor(Math.random() * arrayGedung.length)].clone();
    gedungKiri.scale.set(skalaGedung, skalaGedung, skalaGedung);
    gedungKiri.position.set(-jarakGedung, 0, z);
    scene.add(gedungKiri);

    const gedungKanan = arrayGedung[Math.floor(Math.random() * arrayGedung.length)].clone();
    gedungKanan.scale.set(skalaGedung, skalaGedung, skalaGedung);
    gedungKanan.position.set(jarakGedung, 0, z);
    gedungKanan.rotation.y = Math.PI;
    scene.add(gedungKanan);
  }
}

export function createCloud() {
  // Isi dengan fungsi createCloud asli kamu (bisa di-export jika nanti dipanggil di main.js)
}
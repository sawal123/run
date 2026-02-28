// =============================== // GAME STATE & VARIABLES // ===============================
const clock = new THREE.Clock();
let gameStarted = false;
let gameEnded = false;
let timeLeft = 15;
let countdown = 3;
const finishZ = -120;
const speed = 0.15;
let player1 = null;
let player2 = null;
let mixer1 = null;
let mixer2 = null;

// =============================== // SCENE, RENDERER, & CAMERAS // ===============================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
// Warna langit biru
//
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setScissorTest(true);

// --- TAMBAHKAN 2 BARIS INI UNTUK BAYANGAN ---
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Membuat tepi bayangan lebih halus
// // --------------------------------------------
document.body.appendChild(renderer.domElement);
const camera1 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const camera2 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera1.position.set(0, 3, 8);
camera2.position.set(0, 3, 8);
/// ===============================
// // LIGHTING, FOG & ENVIRONMENT
// ===============================
// // 1. Kabut (Fog)
scene.fog = new THREE.Fog(0x87ceeb, 30, 150);
// 2. Matahari Buatan
const sunGeometry = new THREE.SphereGeometry(15, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffee });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 60, finishZ - 30);
scene.add(sun);

// ---------------- PERUBAHAN MULAI DARI SINI ----------------
// 3. Hemisphere Light (Sangat penting untuk lingkungan outdoor)
// Parameter: (Warna Langit, Warna Pantulan Tanah, Intensitas)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);
// 4. Cahaya Utama / Matahari (Directional Light)
const light = new THREE.DirectionalLight(0xffffee, 1.5); // Intensitas dinaikkan ke 1.5
light.position.set(20, 60, 40); // Posisi Z digeser lebih ke belakang (40) agar menyinari punggung karakter
light.castShadow = true;

// Konfigurasi Bayangan (Shadow)
light.shadow.camera.left = -50;
light.shadow.camera.right = 50;
light.shadow.camera.top = 150;
light.shadow.camera.bottom = -150;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.bias = -0.001;
// // Mencegah artefak "garis-garis kotor" pada bayangan
scene.add(light);

// 5. Cahaya Ambien (Untuk menerangkan area yang benar-benar gelap)
const ambient = new THREE.AmbientLight(0xffffff, 0.7); // Dinaikkan sedikit scene.add(ambient);

// =============================== // HELPER: PROMISE LOADER // ===============================

const loader = new THREE.GLTFLoader();

function loadModel(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

// =============================== // UI & INPUT // ===============================
const ui = document.getElementById("ui");
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// =============================== // GAME LOGIC FUNCTIONS // ===============================
function startCountdown() {
  ui.innerText = countdown;
  const cd = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      ui.innerText = countdown;
    } else if (countdown === 0) {
      ui.innerText = "GO!";
    } else {
      clearInterval(cd);
      gameStarted = true;
      ui.innerText = "Waktu: " + timeLeft;
      startTimer();
    }
  }, 1000);
}
function startTimer() {
  const timer = setInterval(() => {
    if (!gameStarted || gameEnded) return;
    timeLeft--;
    ui.innerText = "Waktu: " + timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame("Waktu Habis!");
    }
  }, 1000);
}
function endGame(message) {
  gameEnded = true;
  gameStarted = false;
  ui.innerText = message;
}
function renderSplit() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  // LEFT SCREEN
  camera1.aspect = width / 2 / height;
  camera1.updateProjectionMatrix();
  renderer.setViewport(0, 0, width / 2, height);
  renderer.setScissor(0, 0, width / 2, height);
  renderer.render(scene, camera1);
  // RIGHT SCREEN
  camera2.aspect = width / 2 / height;
  camera2.updateProjectionMatrix();
  renderer.setViewport(width / 2, 0, width / 2, height);
  renderer.setScissor(width / 2, 0, width / 2, height);
  renderer.render(scene, camera2);
}

// =============================== // HELPER: PEMBUAT AWAN LOW-POLY // ===============================
function createCloud() {
  const cloudGroup = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 8, 8);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    // Memberikan efek low-poly
    roughness: 1,
  });

  // Gabungkan 4-6 bola acak menjadi 1 awan
  const gumpalan = Math.floor(Math.random() * 3) + 4;
  for (let i = 0; i < gumpalan; i++) {
    const puff = new THREE.Mesh(geo, mat);
    puff.position.set(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 3,
    );
    puff.scale.setScalar(Math.random() * 1.5 + 1);
    puff.castShadow = true; // Awan juga menghasilkan bayangan ketanah
    cloudGroup.add(puff);
  }
  return cloudGroup;
}

// =============================== // MAIN INITIALIZATION (ASYNC) // ===============================

async function initGame() {
  ui.innerText = "Loading Assets...";
  try {
    // 1. Muat SEMUA aset secara bersamaan
    const [
      p1Gltf,
      p2Gltf,
      roadGltf,
      startGltf,
      finishGltf,
      b1Gltf,
      b2Gltf,
      b3Gltf,
    ] = await Promise.all([
      loadModel("../assets/glb/run.glb"),
      loadModel("../assets/glb/run1.glb"),
      loadModel("../assets/glb/Road.glb"),
      loadModel("../assets/glb/start.glb"),
      loadModel("../assets/glb/finish.glb"),
      loadModel("../assets/glb/building1.glb"),
      loadModel("../assets/glb/building2.glb"),
      loadModel("../assets/glb/building3.glb"),
    ]);
    console.log("Semua aset berhasil dimuat!");
    // 2. Inisialisasi Karakter
    // player1 = p1Gltf.scene;
    // 2. SETUP LINGKUNGAN (TUGU)
    const skalaTugu = 0.04; // Ganti angka ini: coba 0.1, 0.5, atau 2 jika masih kurang pas
    const startLine = startGltf.scene;
    startLine.scale.set(skalaTugu, skalaTugu, skalaTugu);
    startLine.position.set(0, 0, 20);
    scene.add(startLine);
    const finishLineObj = finishGltf.scene;
    finishLineObj.scale.set(skalaTugu, skalaTugu, skalaTugu);
    finishLineObj.position.set(0, 2.4, finishZ);
    scene.add(finishLineObj);

    // 3. LOOPING JALAN & GEDUNG
    const panjangJalanMaksimal = Math.abs(finishZ) + 60;
    const panjangPerSegmen = 10;
    const arrayGedung = [b1Gltf.scene, b2Gltf.scene, b3Gltf.scene];

    // --- PENGATURAN SKALA & POSISI BARU --- // Melebarkan jalan secara khusus pada sumbu X (kiri-kanan)

    const skalaJalanLebar = 0.05; // Sumbu X: Besarkan angka ini jika jalan masih kurang lebar
    const skalaJalanPanjang = 0.02; // Sumbu Y & Z: Biarkan tetap 0.02 agar sambungan tidak rusak
    const skalaGedung = 3.5; // Perbesar ukuran gedung (naikkan dari 1.5 ke 3.5 atau 4.0)
    const jarakGedung = 20; // Jauhkan gedung ke pinggir (geser dari 8 menjadi 14)
    const posisiX_P1 = -3.5; // Geser Player 1 sedikit ke kiri agar pas di tengah jalur
    const posisiX_P2 = 3.5; // Geser Player 2 sedikit ke kanan agar pas di tengah jalur

    for (let z = 10; z >= -panjangJalanMaksimal; z -= panjangPerSegmen) {
      // Pasang Jalan (Skala X dilebarkan)
      const jalan = roadGltf.scene.clone();
      jalan.scale.set(skalaJalanLebar, skalaJalanPanjang, skalaJalanPanjang);
      jalan.position.set(0, 0, z);
      scene.add(jalan);
      // Pasang Gedung Kiri
      const gedungKiri =
        arrayGedung[Math.floor(Math.random() * arrayGedung.length)].clone();
      gedungKiri.scale.set(skalaGedung, skalaGedung, skalaGedung);
      gedungKiri.position.set(-jarakGedung, 0, z);
      // Posisi X menggunakan variabel jarakGedung
      scene.add(gedungKiri);
      // Pasang Gedung Kanan
      const gedungKanan =
        arrayGedung[Math.floor(Math.random() * arrayGedung.length)].clone();
      gedungKanan.scale.set(skalaGedung, skalaGedung, skalaGedung);
      gedungKanan.position.set(jarakGedung, 0, z);
      // Posisi X menggunakan variabel jarakGedung
      gedungKanan.rotation.y = Math.PI;
      scene.add(gedungKanan);
    }

    // 4. SETUP KARAKTER

    function setupPlayer(gltf, xPos, scaleSize) {
      const model = gltf.scene;
      model.scale.set(scaleSize, scaleSize, scaleSize);
      model.position.set(xPos, 0, 0);
      model.rotation.y = Math.PI;
      model.traverse((child) => {
        if (child.isMesh) child.frustumCulled = false;
      });
      scene.add(model);
      let mixer = null;
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        const runAnimation = gltf.animations.find((anim) =>
          anim.name.toLowerCase().includes("run"),
        );
        if (runAnimation) {
          mixer.clipAction(runAnimation).play();
        } else {
          mixer.clipAction(gltf.animations[0]).play();
        }
      }
      return { model, mixer };
    }

    // Assign Player 1 dengan posisi X yang baru

    const p1 = setupPlayer(p1Gltf, posisiX_P1, 0.7);
    player1 = p1.model;
    mixer1 = p1.mixer;
    // Assign Player 2 dengan posisi X yang baru
    const p2 = setupPlayer(p2Gltf, posisiX_P2, 2);
    player2 = p2.model;
    mixer2 = p2.mixer;

    // 5. MULAI GAME ENGINE
    animate();
    startCountdown();
  } catch (error) {
    console.error("Gagal memuat aset 3D:", error);
    ui.innerText = "Error loading assets! Cek console.";
  }
}

// =============================== // ANIMATE LOOP // ===============================

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (player1 && player2) {
    if (gameStarted && !gameEnded) {
      // PLAYER 1: Bergerak dan animasi jalan hanya saat tombol ditekan
      if (keys["ArrowLeft"] || keys["ArrowRight"]) {
        player1.position.z -= speed;
        if (mixer1) mixer1.update(delta);
      }
      // PLAYER 2: Bergerak dan animasi jalan hanya saat tombol ditekan
      if (keys["KeyA"] || keys["KeyD"]) {
        player2.position.z -= speed;
        if (mixer2) mixer2.update(delta);
      }
      // FINISH CHECK
      if (player1.position.z <= finishZ) {
        endGame("Player 1 Menang!");
      } else if (player2.position.z <= finishZ) {
        endGame("Player 2 Menang!");
      }
    }
    // CAMERA FOLLOW
    camera1.position.set(player1.position.x, 3, player1.position.z + 6);
    camera1.lookAt(player1.position.x, 1, player1.position.z - 3);
    camera2.position.set(player2.position.x, 3, player2.position.z + 6);
    camera2.lookAt(player2.position.x, 1, player2.position.z - 3);
  }
  renderSplit();
}

// =============================== // JALANKAN INIT // ===============================
initGame();

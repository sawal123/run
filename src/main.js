// main.js
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { state } from "./state.js";
import { keys } from "./input.js";
import { playStepSound } from "./audio.js";

import {
  setUIText,
  startCountdown,
  endGame,
  setupStartScreen,
  setupGameOver,
} from "./ui.js";
import {
  scene,
  renderer,
  camera1,
  camera2,
  setupLighting,
} from "./graphics.js";
import { buildWorld } from "./environment.js";
import { setupPlayer } from "./player.js";
// import { setUIText, startCountdown, endGame } from "./ui.js";

const loader = new GLTFLoader();
const loadModel = (url) =>
  new Promise((res, rej) => loader.load(url, res, undefined, rej));

// ================= FUNGSI RESET GAME =================
function resetGame() {
  // 1. Kembalikan posisi karakter ke garis Start
  state.player1.position.z = 0;
  state.player2.position.z = 0;

  // 2. Reset kecepatan dan pelacak tombol
  p1Velocity = 0;
  p2Velocity = 0;
  lastKeyP1 = null;
  lastKeyP2 = null;

  // Kosongkan riwayat tombol sebelumnya
  for (let key in prevKeys) delete prevKeys[key];

  // 3. Reset State Waktu
  state.timeLeft = 20;
  state.countdown = 3;
  state.gameEnded = false;
  state.gameStarted = false;

  // 4. Mulai ulang hitungan mundur
  startCountdown();
}

document.getElementById("restart-btn").addEventListener("click", () => {
  // 1. BUNUH SEMUA INTERVAL DARI GAME SEBELUMNYA SEKARANG JUGA!
  if (state.gameTimerInterval) clearInterval(state.gameTimerInterval);
  if (state.countdownInterval) clearInterval(state.countdownInterval);
  state.countdown = 3;
  state.timeLeft = 20;
  state.gameStarted = false;
  startCountdown();
});

async function initGame() {
  setUIText("Loading Assets...");
  setupLighting();

  try {
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
      loadModel("../assets/glb/character_run1.glb"),
      loadModel("../assets/glb/character_run2.glb"),
      loadModel("../assets/glb/Road.glb"),
      loadModel("../assets/glb/start.glb"),
      loadModel("../assets/glb/finish.glb"),
      loadModel("../assets/glb/building1.glb"),
      loadModel("../assets/glb/building2.glb"),
      loadModel("../assets/glb/building3.glb"),
    ]);

    buildWorld(
      scene,
      { roadGltf, startGltf, finishGltf, b1Gltf, b2Gltf, b3Gltf },
      state.finishZ,
    );

    const p1 = setupPlayer(scene, p1Gltf, -3.5, 2);
    state.player1 = p1.model;
    state.mixer1 = p1.mixer;
    state.player1.position.y = 0.1;
    state.actions1 = p1.actions;
    console.log("Animasi Player 1:", p1Gltf.animations);

    const p2 = setupPlayer(scene, p2Gltf, 3.5, 1);
    state.player2 = p2.model;
    state.mixer2 = p2.mixer;
    state.actions2 = p2.actions;
    state.player2.position.y = 0.1;

    // startCountdown();
    // animate();
    setupStartScreen(startCountdown);
    setupGameOver(resetGame);
    animate();
  } catch (error) {
    console.error("Gagal memuat aset:", error);
    setUIText("Error loading assets! Cek console.");
    // Tampilkan error menggunakan UI Tailwind
    const loadingText = document.getElementById("loading-text");
    loadingText.classList.remove("text-yellow-400", "animate-pulse");
    loadingText.classList.add("text-red-500");
    loadingText.innerText = "Gagal memuat aset. Cek console browser.";
  }
}

function renderSplit() {
  const w = window.innerWidth,
    h = window.innerHeight;
  // Left
  camera1.aspect = w / 2 / h;
  camera1.updateProjectionMatrix();
  renderer.setViewport(0, 0, w / 2, h);
  renderer.setScissor(0, 0, w / 2, h);
  renderer.render(scene, camera1);
  // Right
  camera2.aspect = w / 2 / h;
  camera2.updateProjectionMatrix();
  renderer.setViewport(w / 2, 0, w / 2, h);
  renderer.setScissor(w / 2, 0, w / 2, h);
  renderer.render(scene, camera2);
}

// Variabel untuk Edge Detection & Momentum
const prevKeys = {};
let lastKeyP1 = null;
let lastKeyP2 = null;

// --- SISTEM MOMENTUM ---
let p1Velocity = 0;
let p2Velocity = 0;

const boost = 0.15;
const maxSpeed = 0.5;
const friction = 0.92;

function animate() {
  requestAnimationFrame(animate);
  const delta = state.clock.getDelta();

  if (state.player1 && state.player2) {
    // ================= 1. INPUT (HANYA JALAN JIKA GAME BELUM SELESAI) =================
    if (state.gameStarted && !state.gameEnded) {
      const leftJustPressed = keys["ArrowLeft"] && !prevKeys["ArrowLeft"];
      const rightJustPressed = keys["ArrowRight"] && !prevKeys["ArrowRight"];
      const aJustPressed = keys["KeyA"] && !prevKeys["KeyA"];
      const dJustPressed = keys["KeyD"] && !prevKeys["KeyD"];

      // --- Player 1 ---
      if (leftJustPressed && lastKeyP1 !== "Left") {
        p1Velocity += boost;
        lastKeyP1 = "Left";
        playStepSound(); // <--- BUNYIKAN LANGKAH KAKI
      } else if (rightJustPressed && lastKeyP1 !== "Right") {
        p1Velocity += boost;
        lastKeyP1 = "Right";
        playStepSound(); // <--- BUNYIKAN LANGKAH KAKI
      }

      // --- Player 2 ---
      if (aJustPressed && lastKeyP2 !== "A") {
        p2Velocity += boost;
        lastKeyP2 = "A";
        playStepSound(); // <--- BUNYIKAN LANGKAH KAKI
      } else if (dJustPressed && lastKeyP2 !== "D") {
        p2Velocity += boost;
        lastKeyP2 = "D";
        playStepSound(); // <--- BUNYIKAN LANGKAH KAKI
      }
    }

    // ================= 2. TERAPKAN FISIKA (SELALU JALAN AGAR BISA NGEREM) =================
    p1Velocity = Math.min(p1Velocity, maxSpeed);
    p2Velocity = Math.min(p2Velocity, maxSpeed);

    state.player1.position.z -= p1Velocity;
    state.player2.position.z -= p2Velocity;

    p1Velocity *= friction;
    p2Velocity *= friction;

    // ================= 3. UPDATE ANIMASI (IDLE & RUN) =================

    // Mesin tulang harus selalu di-update setiap frame agar nafasnya (Idle) jalan
    if (state.mixer1) state.mixer1.update(delta);
    if (state.mixer2) state.mixer2.update(delta);

    // --- Update Animasi Player 1 ---
    if (state.actions1) {
      if (p1Velocity > 0.01) {
        // SEDANG LARI: Tampilkan gaya lari, sembunyikan gaya diam
        state.actions1.run.setEffectiveWeight(1);
        state.actions1.idle.setEffectiveWeight(0);

        // Sesuaikan kecepatan ayunan kaki dengan kecepatan lari
        state.actions1.run.setEffectiveTimeScale(p1Velocity * 5);
      } else {
        // BERHENTI: Tampilkan gaya diam bernafas, sembunyikan gaya lari
        state.actions1.run.setEffectiveWeight(0);
        state.actions1.idle.setEffectiveWeight(1);
      }
    }

    // --- Update Animasi Player 2 ---
    if (state.actions2) {
      if (p2Velocity > 0.01) {
        state.actions2.run.setEffectiveWeight(1);
        state.actions2.idle.setEffectiveWeight(0);
        state.actions2.run.setEffectiveTimeScale(p2Velocity * 5);
      } else {
        state.actions2.run.setEffectiveWeight(0);
        state.actions2.idle.setEffectiveWeight(1);
      }
    }

    // ================= 4. CEK FINISH (HANYA JALAN JIKA GAME BELUM SELESAI) =================
    if (state.gameStarted && !state.gameEnded) {
      const p1Finish = state.player1.position.z <= state.finishZ;
      const p2Finish = state.player2.position.z <= state.finishZ;

      if (p1Finish || p2Finish) {
        if (p1Finish && p2Finish) {
          if (state.player1.position.z < state.player2.position.z)
            endGame("Player 1 Menang!");
          else if (state.player2.position.z < state.player1.position.z)
            endGame("Player 2 Menang!");
          else endGame("Seri! (Draw)");
        } else if (p1Finish) endGame("Player 1 Menang!");
        else if (p2Finish) endGame("Player 2 Menang!");
      }
    }

    // CAMERA FOLLOW
    camera1.position.set(
      state.player1.position.x,
      3,
      state.player1.position.z + 6,
    );
    camera1.lookAt(state.player1.position.x, 1, state.player1.position.z - 3);
    camera2.position.set(
      state.player2.position.x,
      3,
      state.player2.position.z + 6,
    );
    camera2.lookAt(state.player2.position.x, 1, state.player2.position.z - 3);
  }

  Object.assign(prevKeys, keys);
  renderSplit();
}

initGame();

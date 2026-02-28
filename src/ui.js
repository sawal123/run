// ui.js
import { state } from "./state.js";

const uiElement = document.getElementById("ui");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const loadingText = document.getElementById("loading-text");

// Tambahkan 2 variabel ini
const countdownLayer = document.getElementById("countdown-layer");
const countdownText = document.getElementById("countdown-text");

// ui.js (Tambahkan di bagian atas bersama variabel lain)
const gameOverScreen = document.getElementById("game-over-screen");
const winnerText = document.getElementById("winner-text");
const restartBtn = document.getElementById("restart-btn");
const homeBtn = document.getElementById("home-btn");

export function setUIText(text) {
  uiElement.innerText = text;
}

// --- FUNGSI PEMBANTU UNTUK PESTA KONFETI ---
function triggerCelebrateConfetti() {
  // Preset: 'Pesta' jatuh dari atas seperti hujan
  const count = 200;
  const defaults = {
    origin: { y: 0.1 }, // Jatuh dari sedikit di atas layar
    zIndex: 1000, // Pastikan di atas canvas dan UI lainnya
    colors: ["#60a5fa", "#fb923c", "#ffffff", "#fbbf24", "#10b981"], // Campuran warna tim + emas
  };

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      }),
    );
  }

  // Berbagai jenis 'tembakan' untuk efek alami
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

// Fungsi transisi Start Screen
export function setupStartScreen(onPlayCallback) {
  // Sembunyikan teks loading, munculkan tombol
  loadingText.classList.add("hidden");
  startBtn.classList.remove("hidden");

  // Event ketika tombol MAIN diklik
  startBtn.onclick = () => {
    // 1. Berikan efek fade-out pada layar utama (menggunakan opacity Tailwind)
    startScreen.classList.add("opacity-0");

    // 2. Tunggu sebentar sampai efek fade selesai, lalu hilangkan total
    setTimeout(() => {
      startScreen.classList.add("hidden");
      //   uiElement.classList.remove("hidden");

      // 3. Mulai Hitung Mundur (3, 2, 1, GO!)
      onPlayCallback();
    }, 500); // 500ms sesuai dengan class duration-500 di HTML
  };
}

// Fungsi untuk menghubungkan tombol Game Over dengan main.js
export function setupGameOver(onRestartCallback) {
  // Tombol Main Lagi (Soft Reset tanpa refresh halaman)
  restartBtn.onclick = () => {
    gameOverScreen.classList.add("hidden");
    onRestartCallback();
  };

  // Tombol Menu Utama (Refresh halaman total agar kembali ke awal)
  homeBtn.onclick = () => {
    window.location.reload();
  };
}

// ================= FUNGSI ENDGAME YANG BARU =================
export function endGame(message) {
  state.gameEnded = true;
  state.gameStarted = false;

  // 1. Sembunyikan semua UI permainan (Timer & Countdown)
  document.getElementById("ui").classList.add("hidden");
  document.getElementById("countdown-layer").classList.add("hidden");

  // 2. Set teks pemenang dan warnanya
  winnerText.innerText = message;

  // Reset class warna (hapus warna sebelumnya jika ada)
  winnerText.classList.remove(
    "text-blue-400",
    "text-orange-400",
    "text-red-500",
  );

  if (message.includes("Player 1")) {
    winnerText.classList.add("text-blue-400"); // Warna Tim P1
    triggerCelebrateConfetti();
  } else if (message.includes("Player 2")) {
    winnerText.classList.add("text-orange-400"); // Warna Tim P2
    triggerCelebrateConfetti();
  } else {
    winnerText.classList.add("text-red-500"); // Warna jika Seri / Waktu Habis
  }

  // 3. Munculkan Layar Game Over
  gameOverScreen.classList.remove("hidden");
}

export function startTimer() {
  const timer = setInterval(() => {
    if (!state.gameStarted || state.gameEnded) return;
    state.timeLeft--;
    setUIText("Waktu: " + state.timeLeft);
    if (state.timeLeft <= 0) {
      clearInterval(timer);
      endGame("Waktu Habis!");
    }
  }, 1000);
}

// ================= FUNGSI COUNTDOWN BARU =================
export function startCountdown() {
  // Pastikan timer atas sembunyi dulu
  uiElement.classList.add("hidden");

  // Munculkan layer raksasa di tengah
  countdownLayer.classList.remove("hidden");
  countdownText.innerText = state.countdown;

  const cd = setInterval(() => {
    state.countdown--;

    // Efek Pop Animasi (Membesar lalu mengecil sedikit tiap detik)
    countdownText.classList.add("scale-125");
    setTimeout(() => {
      countdownText.classList.remove("scale-125");
    }, 300);

    if (state.countdown > 0) {
      countdownText.innerText = state.countdown;
    } else if (state.countdown === 0) {
      // Ubah teks dan warna saat GO!
      countdownText.innerText = "GO!";
      countdownText.classList.remove("text-yellow-400");
      countdownText.classList.add("text-emerald-400"); // Hijau cerah
    } else {
      // Hitung mundur selesai
      clearInterval(cd);
      countdownLayer.classList.add("hidden"); // Hilangkan tulisan GO!
      uiElement.classList.remove("hidden"); // Munculkan timer di atas

      state.gameStarted = true;
      setUIText("Waktu: " + state.timeLeft);
      startTimer();
    }
  }, 1000);
}

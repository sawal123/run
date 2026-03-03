// ui.js
import { state } from "./state.js";
import {
  playSFX,
  playBGM,
  stopBGM,
  playMenuBGM,
  stopMenuBGM,
} from "./audio.js";

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
  loadingText.classList.add("hidden");
  startBtn.classList.remove("hidden");

  // 1. Coba putar langsung saat tombol "MAIN SEKARANG" muncul
  playMenuBGM();

  // 2. TRIK ANTI-BLOKIR BROWSER:
  // Jika autoplay diblokir, putar musik saat user klik area manapun di layar
  const startAudioOnInteract = () => {
    playMenuBGM();
    window.removeEventListener("click", startAudioOnInteract);
  };
  window.addEventListener("click", startAudioOnInteract);

  // 3. Saat tombol MAIN SEKARANG diklik
  startBtn.onclick = (e) => {
    e.stopPropagation(); // Mencegah bentrok dengan trik klik di atas
    window.removeEventListener("click", startAudioOnInteract);

    // Matikan musik menu, putar suara klik (opsional)
    stopMenuBGM();
    playSFX("step"); // Memberi efek suara saat tombol diklik

    startScreen.classList.add("opacity-0");

    setTimeout(() => {
      startScreen.classList.add("hidden");
      onPlayCallback(); // Ini akan memanggil startCountdown()
    }, 500);
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
    stopBGM(); // HENTIKAN MUSIK BALAPAN
    playSFX("win"); // PUTAR SUARA KEMENANGAN / TEPUK TANGAN
  } else if (message.includes("Player 2")) {
    winnerText.classList.add("text-orange-400"); // Warna Tim P2
    triggerCelebrateConfetti();
    stopBGM(); // HENTIKAN MUSIK BALAPAN
    playSFX("win"); // PUTAR SUARA KEMENANGAN / TEPUK TANGAN
  } else {
    winnerText.classList.add("text-red-500"); // Warna jika Seri / Waktu Habis
  }

  // 3. Munculkan Layar Game Over
  gameOverScreen.classList.remove("hidden");
}


// Contoh perbaikan di fungsi startTimer
export function startTimer() {
  // Bersihkan timer lama sebelum mulai yang baru
  if (state.gameTimerInterval) {
    clearInterval(state.gameTimerInterval);
  }

  state.gameTimerInterval = setInterval(() => {
    state.timeLeft--;
    setUIText("Waktu: " + state.timeLeft);

    if (state.timeLeft <= 0) {
      clearInterval(state.gameTimerInterval);
      // Logika game over / finish di sini
    }
  }, 1000);
}


// ================= FUNGSI COUNTDOWN BARU =================
export function startCountdown() {
  // 1. BERSIHKAN INTERVAL LAMA (ANTI NGEBUT)
  if (state.countdownInterval) {
    clearInterval(state.countdownInterval);
  }

  uiElement.classList.add("hidden");
  countdownLayer.classList.remove("hidden");
  countdownText.innerText = state.countdown;

  if (window.playSFX) playSFX("beep"); // Putar beep awal

  // 2. SIMPAN INTERVAL KE DALAM STATE
  state.countdownInterval = setInterval(() => {
    state.countdown--;

    countdownText.classList.add("scale-125");
    setTimeout(() => {
      countdownText.classList.remove("scale-125");
    }, 300);

    if (state.countdown > 0) {
      countdownText.innerText = state.countdown;
      playSFX("beep");
    } else if (state.countdown === 0) {
      countdownText.innerText = "GO!";
      countdownText.classList.remove("text-yellow-400");
      countdownText.classList.add("text-emerald-400");

      playSFX("go");
      playBGM();

      state.gameStarted = true;
      uiElement.classList.remove("hidden"); // Munculkan timer atas
      setUIText("Waktu: " + state.timeLeft);

      startTimer();
    } else {
      // 3. BERSIHKAN INTERVAL SAAT SELESAI
      clearInterval(state.countdownInterval);
      countdownLayer.classList.add("hidden");
    }
  }, 1000);
}

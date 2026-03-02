// src/audio.js

// Inisialisasi semua objek audio
export const sounds = {
  menuBgm: new Audio("../assets/audio/menu_bgm.wav"), // <-- Tambahkan ini
  bgm: new Audio("../assets/audio/bgm.wav"),
  beep: new Audio("../assets/audio/beep.mp3"),
  go: new Audio("../assets/audio/go.mp3"),
  step: new Audio("../assets/audio/step.wav"),
  win: new Audio("../assets/audio/win.wav"),
};

// Pengaturan Audio
sounds.menuBgm.loop = true;
sounds.menuBgm.volume = 0.5; // Sesuaikan volume musik menu
sounds.bgm.loop = true; // Musik latar diulang terus
sounds.bgm.volume = 0.4; // Volume musik 40% agar tidak menutupi suara langkah
sounds.win.volume = 0.8;
sounds.step.volume = 0.5;

// Fungsi untuk memutar musik latar
export function playBGM() {
  sounds.bgm.currentTime = 0;
  // Blok catch digunakan untuk mencegah error di console jika browser memblokir auto-play
  sounds.bgm.play().catch((e) => console.log("Menunggu interaksi user"));
}

// Fungsi untuk menghentikan musik latar
export function stopBGM() {
  sounds.bgm.pause();
}

// Fungsi untuk memutar efek suara (SFX) umum
export function playSFX(name) {
  if (sounds[name]) {
    sounds[name].currentTime = 0; // Reset ke awal agar bisa diputar cepat berulang-ulang
    sounds[name].play().catch((e) => {});
  }
}

// ================= FUNGSI MUSIK MENU =================
export function playMenuBGM() {
  sounds.menuBgm.play().catch((e) => {
    // Akan error di background jika browser memblokir autoplay, tidak apa-apa
  });
}

export function stopMenuBGM() {
  sounds.menuBgm.pause();
  sounds.menuBgm.currentTime = 0;
}

// Fungsi KHUSUS untuk langkah kaki (Karena ditekan sangat cepat)
export function playStepSound() {
  try {
    // Cek apakah suara step benar-benar ada/berhasil di-load
    if (!sounds.step) return;

    const stepClone = sounds.step.cloneNode();
    stepClone.volume = 0.2;
    // Catch digunakan agar game tidak macet jika browser memblokir audio
    stepClone.play().catch((e) => {});
  } catch (error) {
    // Abaikan error agar game tetap berjalan
  }
}

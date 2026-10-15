# Weather Web App 🌦️

Aplikasi web informasi cuaca real-time yang bersih, modern, dan responsif. Dibangun untuk memenuhi tugas kuliah **Pengembangan Aplikasi Berbasis Web (PABWE)** di Institut Teknologi Del (IT Del).

🌐 **Demo Live:** [https://weather.yogitrim.my.id](https://weather.yogitrim.my.id)

---

## 🚀 Fitur Utama
- **Pencarian Cuaca Real-time**: Cari cuaca kota di seluruh dunia (misal: Balige, Jakarta, Tokyo, London).
- **Auto-Load Default**: Otomatis memuat cuaca kota Jakarta saat aplikasi pertama kali dibuka.
- **Visualisasi Informatif**:
  - Nilai suhu udara (°C)
  - Ikon kondisi cuaca dinamis & teranimasi
  - Deskripsi kondisi cuaca dalam Bahasa Indonesia
  - Panel metrik sekunder (Kelembapan dalam `%` dan Kecepatan Angin dalam `m/s`)
- **Fault-Tolerant & User-Friendly Feedback**:
  - Loading spinner CSS murni saat mengambil data dari API
  - Alert banner ramah pengguna jika kota tidak ditemukan (404) atau terjadi gangguan jaringan.
- **Desain Modern & Responsif**:
  - Tampilan Centered Card dengan Glassmorphism & High-Contrast Typography.
  - Mobile-First design (`@media (max-width: 480px)`).

---

## 🛠️ Teknologi yang Digunakan
- **HTML5 Murni**: Struktur semantik (`<main>`, `<header>`, `<form>`, `<section>`, `<article>`, `<footer>`) dan standar aksesibilitas (A11y).
- **CSS3 Murni**: CSS Custom Properties (Variables), Flexbox, CSS Grid, dan animasi `@keyframes` (tanpa library/framework CSS).
- **Vanilla JavaScript (ES6+)**: `async/await`, Fetch API, Destructuring, dan arsitektur modular (`WeatherService` & `UIController`).
- **REST API**:
  - [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
  - [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)
  - OpenWeatherMap Icons

---

## 📂 Struktur File
```text
Weather APPS/
├── index.html   # Struktur semantik HTML5 & modul antarmuka
├── style.css    # Sistem desain, variabel warna, grid layout, dan animasi
├── script.js    # Logika bisnis, integrasi API, manipulasi DOM, dan penanganan error
├── README.md    # Dokumentasi proyek
└── .gitignore   # Filter file sistem / cache
```

---

## 👤 Pembuat
- **Nama**: Yogi Tri Medya Panjaitan
- **NIM**: 11S24023
- **Akun GitHub**: [@yogitm](https://github.com/yogitm)
- **Institusi**: Institut Teknologi Del (IT Del)

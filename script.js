/**
 * ==============================================================================
 * WEATHER WEB APP - BUSINESS LOGIC & REST API INTEGRATION
 * Pure Vanilla JavaScript (ES6+) • Fault-Tolerant • Clean Architecture
 * ==============================================================================
 */

'use strict';

/* ==============================================================================
 * 1. API SERVICE LAYER (PENGAMBILAN DATA CUACA & GEOCODING)
 * Bertanggung jawab penuh terhadap pemanggilan HTTP request dan validasi respons.
 * ============================================================================== */

const WeatherService = {
  /**
   * Mengambil koordinat geografis (latitude, longitude) suatu kota via Open-Meteo Geocoding API.
   *
   * @async
   * @param {string} city - Nama kota yang ingin dicari (misal: "Jakarta", "Balige").
   * @returns {Promise<{latitude: number, longitude: number, name: string, country: string}>}
   * @throws {Error} Melempar error jika respons HTTP gagal atau kota tidak ditemukan.
   */
  async getCityCoordinates(city) {
    const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=id&format=json`;

    const response = await fetch(endpoint);

    // Memeriksa status HTTP apakah berada dalam rentang 200-299
    if (!response.ok) {
      throw new Error(`Gagal menghubungi server pencarian lokasi (Status: ${response.status} ${response.statusText}).`);
    }

    const data = await response.json();

    // Validasi data hasil pencarian (Simulasi 404 Not Found)
    if (!data.results || data.results.length === 0) {
      throw new Error("Kota tidak ditemukan. Periksa kembali ejaan nama kota Anda.");
    }

    const [firstResult] = data.results;
    const { latitude, longitude, name, country } = firstResult;

    return {
      latitude,
      longitude,
      name,
      country: country || 'Internasional'
    };
  },

  /**
   * Mengambil data cuaca real-time berdasarkan titik koordinat dari Open-Meteo Forecast API.
   *
   * @async
   * @param {number} latitude - Garis lintang kota.
   * @param {number} longitude - Garis bujur kota.
   * @returns {Promise<{temperature: number, humidity: number, weatherCode: number, windSpeed: number}>}
   * @throws {Error} Melempar error jika koneksi gagal atau data tidak lengkap.
   */
  async getCurrentWeather(latitude, longitude) {
    const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=ms`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Gagal mengambil data cuaca dari server (Status: ${response.status} ${response.statusText}).`);
    }

    const data = await response.json();

    if (!data.current) {
      throw new Error("Format data cuaca tidak sesuai atau tidak tersedia.");
    }

    const {
      temperature_2m: temperature,
      relative_humidity_2m: humidity,
      weather_code: weatherCode,
      wind_speed_10m: windSpeed
    } = data.current;

    return {
      temperature,
      humidity,
      weatherCode,
      windSpeed
    };
  },

  /**
   * Memetakan kode cuaca standar WMO (World Meteorological Organization)
   * menjadi deskripsi bahasa Indonesia yang ramah pengguna serta ikon cuaca berkualitas tinggi.
   *
   * @param {number} code - Kode cuaca WMO dari Open-Meteo.
   * @returns {{description: string, iconUrl: string}} Objek deskripsi dan URL ikon cuaca.
   */
  mapWeatherCode(code) {
    /** @type {Record<number, {description: string, icon: string}>} */
    const codeMap = {
      0: { description: 'Cerah', icon: '01d' },
      1: { description: 'Sebagian Besar Cerah', icon: '02d' },
      2: { description: 'Sebagian Berawan', icon: '02d' },
      3: { description: 'Berawan Tebal', icon: '04d' },
      45: { description: 'Berkabut', icon: '50d' },
      48: { description: 'Kabut Tebal Berembun', icon: '50d' },
      51: { description: 'Gerimis Ringan', icon: '09d' },
      53: { description: 'Gerimis Sedang', icon: '09d' },
      55: { description: 'Gerimis Lebat', icon: '09d' },
      56: { description: 'Gerimis Membeku Ringan', icon: '09d' },
      57: { description: 'Gerimis Membeku Lebat', icon: '09d' },
      61: { description: 'Hujan Ringan', icon: '10d' },
      63: { description: 'Hujan Sedang', icon: '10d' },
      65: { description: 'Hujan Lebat', icon: '10d' },
      66: { description: 'Hujan Es Membeku Ringan', icon: '13d' },
      67: { description: 'Hujan Es Membeku Lebat', icon: '13d' },
      71: { description: 'Salju Ringan', icon: '13d' },
      73: { description: 'Salju Sedang', icon: '13d' },
      75: { description: 'Salju Lebat', icon: '13d' },
      77: { description: 'Butiran Salju', icon: '13d' },
      80: { description: 'Hujan Deras Singkat', icon: '09d' },
      81: { description: 'Hujan Deras Sedang', icon: '09d' },
      82: { description: 'Hujan Badai Deras', icon: '09d' },
      85: { description: 'Hujan Salju Ringan', icon: '13d' },
      86: { description: 'Hujan Salju Lebat', icon: '13d' },
      95: { description: 'Badai Petir', icon: '11d' },
      96: { description: 'Badai Petir Disertai Es Ringan', icon: '11d' },
      99: { description: 'Badai Petir Disertai Es Lebat', icon: '11d' }
    };

    const condition = codeMap[code] || { description: 'Cerah Berawan', icon: '02d' };

    return {
      description: condition.description,
      iconUrl: `https://openweathermap.org/img/wn/${condition.icon}@4x.png`
    };
  }

  /*
   * ----------------------------------------------------------------------------
   * ALTERNATIF IMPLEMENTASI DENGAN OPENWEATHERMAP API:
   * Jika Anda memiliki API Key resmi dari OpenWeatherMap, fungsi di bawah dapat
   * digunakan sebagai pengganti Open-Meteo:
   * ----------------------------------------------------------------------------
   * async fetchFromOpenWeatherMap(city, apiKey) {
   *   const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=id&appid=${apiKey}`;
   *   const response = await fetch(endpoint);
   *   if (!response.ok) {
   *     if (response.status === 404) {
   *       throw new Error("Kota tidak ditemukan. Periksa kembali ejaan nama kota Anda.");
   *     }
   *     throw new Error(`Gagal mengambil data dari OpenWeatherMap (Status: ${response.status}).`);
   *   }
   *   const data = await response.json();
   *   return {
   *     cityName: `${data.name}, ${data.sys.country}`,
   *     temperature: data.main.temp,
   *     humidity: data.main.humidity,
   *     windSpeed: data.wind.speed,
   *     description: data.weather[0].description,
   *     iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`
   *   };
   * }
   */
};

/* ==============================================================================
 * 2. UI CONTROLLER LAYER (MANIPULASI DOM & INTERAKSI PENGGUNA)
 * Bertanggung jawab terhadap pembaruan tampilan, event listeners, dan feedback state.
 * ============================================================================== */

const UIController = {
  // Cache Referensi Elemen DOM
  elements: {
    searchForm: document.getElementById('search-form'),
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    weatherDisplay: document.getElementById('weather-display'),
    cityName: document.getElementById('city-name'),
    updateTime: document.getElementById('update-time'),
    weatherIcon: document.getElementById('weather-icon'),
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weather-description'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed')
  },

  /**
   * Menampilkan indikator loading dan menonaktifkan kontrol pencarian sementara.
   *
   * @returns {void}
   */
  showLoading() {
    this.elements.weatherDisplay.classList.add('hidden');
    this.elements.errorState.classList.add('hidden');
    this.elements.loadingState.classList.remove('hidden');

    this.elements.searchBtn.disabled = true;
    const btnText = this.elements.searchBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = 'Mencari...';
    }
  },

  /**
   * Menyembunyikan indikator loading dan mengaktifkan kembali kontrol pencarian.
   *
   * @returns {void}
   */
  hideLoading() {
    this.elements.loadingState.classList.add('hidden');
    this.elements.searchBtn.disabled = false;
    const btnText = this.elements.searchBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = 'Cari Cuaca';
    }
  },

  /**
   * Menampilkan pesan kesalahan kepada pengguna dengan banner yang jelas.
   *
   * @param {string} message - Pesan error yang akan ditampilkan.
   * @returns {void}
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorState.classList.remove('hidden');
    this.elements.weatherDisplay.classList.add('hidden');
  },

  /**
   * Memformat waktu pembaruan terakhir menjadi format lokal Indonesia yang rapi.
   *
   * @returns {string} String representasi tanggal dan waktu lokal.
   */
  getFormattedTimestamp() {
    const now = new Date();
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);
  },

  /**
   * Memperbarui antarmuka kartu cuaca dengan data cuaca yang telah diterima.
   *
   * @param {object} weatherData - Data cuaca terstruktur.
   * @param {string} weatherData.cityName - Nama kota dan negara.
   * @param {number} weatherData.temperature - Suhu dalam derajat Celcius.
   * @param {number} weatherData.humidity - Persentase kelembapan udara.
   * @param {number} weatherData.windSpeed - Kecepatan angin dalam m/s.
   * @param {string} weatherData.description - Deskripsi kondisi cuaca.
   * @param {string} weatherData.iconUrl - URL ikon kondisi cuaca.
   * @returns {void}
   */
  renderWeather(weatherData) {
    const { cityName, temperature, humidity, windSpeed, description, iconUrl } = weatherData;

    this.elements.cityName.textContent = cityName;
    this.elements.updateTime.textContent = `Pembaruan: ${this.getFormattedTimestamp()}`;
    this.elements.temperature.textContent = Math.round(temperature);
    this.elements.weatherDescription.textContent = description;
    this.elements.humidity.textContent = `${humidity}%`;
    this.elements.windSpeed.textContent = `${windSpeed.toFixed(1)} m/s`;

    // Pengaturan gambar ikon cuaca dengan alt text deskriptif untuk aksesibilitas
    this.elements.weatherIcon.src = iconUrl;
    this.elements.weatherIcon.alt = `Kondisi cuaca: ${description}`;

    // Tampilkan panel display cuaca
    this.elements.weatherDisplay.classList.remove('hidden');
    this.elements.errorState.classList.add('hidden');
  },

  /**
   * Menangani alur pencarian cuaca kota secara asinkron dari input hingga render.
   * Menerapkan prinsip penanganan siklus async/await dan try-catch-finally.
   *
   * @async
   * @param {string} city - Nama kota dari input pengguna.
   * @returns {Promise<void>}
   */
  async handleSearch(city) {
    const sanitizedCity = city.trim();

    // Validasi input kosong di sisi klien
    if (!sanitizedCity) {
      this.showError('Harap masukkan nama kota terlebih dahulu.');
      this.elements.cityInput.focus();
      return;
    }

    // 1. Pre-Fetch State: Tampilkan loading, sembunyikan tampilan lama
    this.showLoading();

    try {
      // 2. Fetch Tahap 1: Dapatkan koordinat kota melalui Geocoding API
      const location = await WeatherService.getCityCoordinates(sanitizedCity);

      // 3. Fetch Tahap 2: Dapatkan data cuaca melalui Forecast API
      const weather = await WeatherService.getCurrentWeather(location.latitude, location.longitude);

      // 4. Transformasi kode cuaca WMO ke deskripsi dan ikon
      const weatherInfo = WeatherService.mapWeatherCode(weather.weatherCode);

      // 5. Render data ke antarmuka pengguna
      this.renderWeather({
        cityName: `${location.name}, ${location.country}`,
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        description: weatherInfo.description,
        iconUrl: weatherInfo.iconUrl
      });
    } catch (error) {
      // 6. Tangkap segala jenis error (jaringan, 404, atau lainnya)
      console.error('Error saat mengambil data cuaca:', error);

      let userFriendlyMessage = error.message;

      // Tangani kasus kegagalan jaringan bawaan browser (Offline / DNS failure)
      if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
        userFriendlyMessage = 'Koneksi internet bermasalah atau server tidak dapat dijangkau. Periksa kembali koneksi Anda.';
      }

      this.showError(userFriendlyMessage);
    } finally {
      // 7. Finally Block: Pastikan indikator loading selalu dinonaktifkan
      this.hideLoading();
    }
  },

  /**
   * Menginisialisasi event listeners dan data default awal saat aplikasi pertama kali dimuat.
   *
   * @returns {void}
   */
  init() {
    // Event listener form submission
    this.elements.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSearch(this.elements.cityInput.value);
    });

    // Otomatis muat data cuaca kota Jakarta sebagai data percontohan awal (Default City)
    this.handleSearch('Jakarta');
  }
};

/* ==============================================================================
 * 3. INISIALISASI SAAT DOM SIAP
 * ============================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  UIController.init();
});

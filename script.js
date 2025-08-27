document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: INISIALISASI & VARIABEL ---
    
    const apiKey = '9a332a040cd3f9f8bcb0b0e2cb27bb08'; 

    // Referensi ke elemen-elemen HTML
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const detectLocationBtn = document.getElementById('detect-location-btn');

    // Elemen untuk menampilkan data cuaca saat ini
    const locationEl = document.getElementById('location');
    const dateTimeEl = document.getElementById('date-time');
    const weatherIconEl = document.getElementById('weather-icon');
    const temperatureEl = document.getElementById('temperature');
    const descriptionEl = document.getElementById('description');
    
    // Elemen untuk menampilkan detail cuaca
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const sunriseEl = document.getElementById('sunrise');
    const sunsetEl = document.getElementById('sunset');

    // Kontainer untuk perkiraan cuaca
    const forecastContainer = document.getElementById('forecast-container');

    // --- BAGIAN 2: FUNGSI-FUNGSI UTAMA ---

    /**
     * Fungsi untuk mengambil data cuaca berdasarkan nama kota
     * @param {string} city Nama kota yang dicari
     */
    async function getWeatherByCity(city) {
        // URL API untuk cuaca saat ini
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=id`;
        // URL API untuk perkiraan 5 hari
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=id`;
        
        fetchAndDisplayWeather(currentWeatherUrl, forecastUrl);
    }

    /**
     * Fungsi untuk mengambil data cuaca berdasarkan koordinat
     * @param {number} lat Latitude (garis lintang)
     * @param {number} lon Longitude (garis bujur)
     */
    async function getWeatherByCoords(lat, lon) {
        // URL API untuk cuaca saat ini
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;
        // URL API untuk perkiraan 5 hari
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;

        fetchAndDisplayWeather(currentWeatherUrl, forecastUrl);
    }

    /**
     * Fungsi inti untuk mengambil dan menampilkan data dari API
     * @param {string} currentUrl URL untuk cuaca saat ini
     * @param {string} forecastUrl URL untuk perkiraan cuaca
     */
    async function fetchAndDisplayWeather(currentUrl, forecastUrl) {
        try {
            // Menggunakan Promise.all untuk mengambil kedua data secara bersamaan
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentUrl),
                fetch(forecastUrl)
            ]);

            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('Lokasi tidak ditemukan atau terjadi kesalahan jaringan.');
            }

            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();
            
            displayWeather(currentData, forecastData);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert(error.message);
        }
    }


    /**
     * Fungsi untuk menampilkan data cuaca ke halaman HTML
     * @param {object} currentData Data cuaca saat ini
     * @param {object} forecastData Data perkiraan cuaca
     */
    function displayWeather(currentData, forecastData) {
        // --- Menampilkan Cuaca Saat Ini ---
        locationEl.textContent = `${currentData.name}, ${currentData.sys.country}`;
        dateTimeEl.textContent = new Date(currentData.dt * 1000).toLocaleString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        weatherIconEl.src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
        temperatureEl.textContent = Math.round(currentData.main.temp);
        descriptionEl.textContent = currentData.weather[0].description;
        
        // --- Menampilkan Detail Cuaca ---
        humidityEl.textContent = `${currentData.main.humidity}%`;
        windSpeedEl.textContent = `${currentData.wind.speed} m/s`; // API defaultnya m/s
        sunriseEl.textContent = new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        sunsetEl.textContent = new Date(currentData.sys.sunset * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // --- Menampilkan Perkiraan Cuaca ---
        forecastContainer.innerHTML = ''; // Kosongkan kontainer dulu

        // Filter data perkiraan untuk mendapatkan satu data per hari (sekitar tengah hari)
        const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes('12:00:00'));

        dailyForecasts.forEach(forecast => {
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';

            const day = new Date(forecast.dt * 1000).toLocaleDateString('id-ID', { weekday: 'short' });
            const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
            const temp = `${Math.round(forecast.main.temp)}°C`;

            forecastCard.innerHTML = `
                <p>${day}</p>
                <img src="${icon}" alt="ikon perkiraan cuaca">
                <p class="forecast-temp">${temp}</p>
            `;
            forecastContainer.appendChild(forecastCard);
        });
    }


    // --- BAGIAN 3: EVENT LISTENERS ---

    // Event listener untuk form pencarian
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah halaman reload saat form disubmit
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
            cityInput.value = ''; // Kosongkan input setelah mencari
        }
    });

    // Event listener untuk tombol deteksi lokasi
    detectLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    getWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Tidak dapat mendeteksi lokasi. Pastikan Anda mengizinkan akses lokasi.');
                }
            );
        } else {
            alert('Geolocation tidak didukung oleh browser ini.');
        }
    });
    
    // --- Inisialisasi awal ---
    // Coba deteksi lokasi saat pertama kali membuka halaman
    detectLocationBtn.click();

});

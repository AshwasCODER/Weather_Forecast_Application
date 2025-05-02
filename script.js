const apiKey = '95e595f1866829198e8f572ae5c3eb75'; // Replace with your OpenWeatherMap API key

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentBtn = document.getElementById('currentBtn');
const weatherResult = document.getElementById('weatherResult');
const forecast = document.getElementById('forecast');
const forecastCards = document.getElementById('forecastCards');
const recentDropdown = document.getElementById('recentDropdown');
const recentSelect = document.getElementById('recentSelect');
const errorMsg = document.getElementById('error');

// Search button click
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  getWeatherByCity(city);
});

// Current location button click
currentBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      getWeatherByCoords(latitude, longitude);
    }, () => showError("Unable to access location."));
  } else {
    showError("Geolocation not supported.");
  }
});

// Fetch weather by city
function getWeatherByCity(city) {
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetch(weatherURL)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);
      updateWeatherUI(data);
      saveRecentCity(city);
      getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(err => showError(err.message));
}

// Fetch weather by geolocation
function getWeatherByCoords(lat, lon) {
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(weatherURL)
    .then(res => res.json())
    .then(data => {
      updateWeatherUI(data);
      saveRecentCity(data.name);
      getForecast(lat, lon);
    })
    .catch(err => showError(err.message));
}

// Get 5-day forecast
function getForecast(lat, lon) {
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(forecastURL)
    .then(res => res.json())
    .then(data => updateForecastUI(data))
    .catch(err => showError("Failed to load forecast."));
}

function updateWeatherUI(data) {
    weatherResult.classList.remove('hidden');
    errorMsg.classList.add('hidden');
  
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = data.main.temp.toFixed(1);
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('wind').textContent = data.wind.speed;
    document.getElementById('condition').textContent = data.weather[0].main + " - " + data.weather[0].description;
  }

  function updateForecastUI(data) {
    forecast.classList.remove('hidden');
    forecastCards.innerHTML = '';
  
    // Filter for 12 PM entries from 3-hour intervals
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
  
    dailyData.forEach(day => {
      const card = document.createElement('div');
      card.className = 'bg-white p-4 rounded shadow text-center';
  
      const date = new Date(day.dt_txt).toDateString();
      const iconURL = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
  
      card.innerHTML = `
        <h4 class="font-semibold">${date}</h4>
        <img src="${iconURL}" alt="${day.weather[0].description}" class="mx-auto">
        <p>🌡️ ${day.main.temp.toFixed(1)}°C</p>
        <p>💨 ${day.wind.speed} km/h</p>
        <p>💧 ${day.main.humidity}%</p>
      `;
      forecastCards.appendChild(card);
    });
  }
  
  function saveRecentCity(city) {
    let recent = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recent.includes(city)) {
      recent.unshift(city);
      if (recent.length > 5) recent.pop();
      localStorage.setItem('recentCities', JSON.stringify(recent));
    }
    loadRecentDropdown();
  }
  
  function loadRecentDropdown() {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (cities.length === 0) {
      recentDropdown.classList.add('hidden');
      return;
    }
  
    recentSelect.innerHTML = '';
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      recentSelect.appendChild(option);
    });
  
    recentDropdown.classList.remove('hidden');
  }
  
  recentSelect.addEventListener('change', () => {
    const city = recentSelect.value;
    if (city) getWeatherByCity(city);
  });
  
  loadRecentDropdown();


  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    weatherResult.classList.add('hidden');
    forecast.classList.add('hidden');
  }
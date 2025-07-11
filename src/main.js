import './style.css'

const WEATHER_EMOJI = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌦️', 56: '🌧️', 57: '🌧️', 61: '🌦️', 63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️', 71: '🌨️', 73: '🌨️', 75: '❄️', 77: '❄️', 80: '🌦️', 81: '🌧️', 82: '🌧️', 85: '🌨️', 86: '❄️', 95: '⛈️', 96: '⛈️', 99: '⛈️',
};
const WEATHER_DESC = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain', 67: 'Heavy freezing rain', 71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
};

async function getCoordsByCity(city) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.length) throw new Error('City not found');
  return { lat: data[0].lat, lon: data[0].lon, display_name: data[0].display_name };
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(url);
  const data = await res.json();
  return data.current_weather;
}

async function fetchForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  return data.daily;
}

function updateWeatherCard(weather, city) {
  const icon = WEATHER_EMOJI[weather.weathercode] || '❓';
  const desc = WEATHER_DESC[weather.weathercode] || 'Unknown';
  document.querySelector('.weather-icon-placeholder').textContent = icon;
  document.querySelector('.weather-info .temp').textContent = `${Math.round(weather.temperature)}°C`;
  document.querySelector('.weather-info .desc').textContent = desc;
  document.querySelector('.weather-info .city').textContent = city;
}

function updateForecast(forecast) {
  const days = forecast.time.slice(0, 5);
  const maxTemps = forecast.temperature_2m_max.slice(0, 5);
  const minTemps = forecast.temperature_2m_min.slice(0, 5);
  const codes = forecast.weathercode.slice(0, 5);
  const forecastCards = document.querySelector('.forecast-cards');
  forecastCards.innerHTML = '';
  days.forEach((date, i) => {
    const d = new Date(date);
    const day = d.toLocaleDateString(undefined, { weekday: 'short' });
    const icon = WEATHER_EMOJI[codes[i]] || '❓';
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="forecast-date">${day}</div>
      <div class="forecast-icon">${icon}</div>
      <div class="forecast-temp">${Math.round(maxTemps[i])}°C / ${Math.round(minTemps[i])}°C</div>
    `;
    forecastCards.appendChild(card);
  });
}

function showWeatherError(msg) {
  document.querySelector('.weather-icon-placeholder').textContent = '❌';
  document.querySelector('.weather-info .temp').textContent = '--';
  document.querySelector('.weather-info .desc').textContent = msg;
  document.querySelector('.weather-info .city').textContent = '';
  document.querySelector('.forecast-cards').innerHTML = '';
}

window.addEventListener('DOMContentLoaded', () => {
  searchAndUpdate('Tbilisi');
});

document.getElementById('weather-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = document.getElementById('city-input').value.trim();
  if (!city) return;
  searchAndUpdate(city);
});

async function searchAndUpdate(city) {
  try {
    const coords = await getCoordsByCity(city);
    const weather = await fetchWeather(coords.lat, coords.lon);
    updateWeatherCard(weather, city);
    const forecast = await fetchForecast(coords.lat, coords.lon);
    updateForecast(forecast);
  } catch (err) {
    showWeatherError('City not found');
  }
}

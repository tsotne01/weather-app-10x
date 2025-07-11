import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const resultDiv = document.getElementById('weather-result');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  // Placeholder for API call
  resultDiv.textContent = `Searching weather for: ${city}`;
});

// 🔐 Keep placeholder for GitHub
const API_KEY = "YOUR_API_KEY";

const messageEl = document.getElementById("message");
const weatherDisplay = document.getElementById("weather-display");

function setMessage(msg, type = "") {
  messageEl.textContent = msg;
  messageEl.className = "message " + type;
}

function clearWeather() {
  weatherDisplay.style.display = "none";
  setMessage("");
}

async function fetchWeather(url) {
  try {
    setMessage("Loading...", "loading");

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch weather");

    const data = await res.json();
    updateUI(data);
  } catch (err) {
    setMessage(err.message, "error");
  }
}

function fetchByCity(city) {
  if (API_KEY === "YOUR_API_KEY") {
    setMessage("Add your API key to run this project", "error");
    return;
  }

  fetchWeather(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
  );
}

function fetchByCoords(lat, lon) {
  if (API_KEY === "YOUR_API_KEY") {
    setMessage("Add your API key to run this project", "error");
    return;
  }

  fetchWeather(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
}

function updateUI(data) {
  setMessage("");
  document.getElementById("city-name").textContent = data.name;
  document.getElementById("temperature").textContent =
    Math.round(data.main.temp) + "°C";
  document.getElementById("description").textContent =
    data.weather[0].description;
  document.getElementById(
    "weather-icon"
  ).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  document.getElementById("feels-like").textContent =
    Math.round(data.main.feels_like) + "°C";
  document.getElementById("humidity").textContent = data.main.humidity + "%";
  document.getElementById("wind-speed").textContent = data.wind.speed + " m/s";
  document.getElementById("pressure").textContent = data.main.pressure + " hPa";

  weatherDisplay.style.display = "block";
}

document.getElementById("search-btn").onclick = () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) fetchByCity(city);
};

document.getElementById("location-btn").onclick = () => {
  clearWeather();
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    () => setMessage("Location access denied", "error")
  );
};

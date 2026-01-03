class WeatherDashboard {
  constructor() {
    this.statusBox = document.getElementById("message");
    this.container = document.getElementById("weather-display");
    this.inputField = document.getElementById("city-input");
    this.setup();
  }

  setup() {
    document
      .getElementById("search-btn")
      .addEventListener("click", () => this.executeSearch());
    document
      .getElementById("location-btn")
      .addEventListener("click", () => this.syncLocation());
  }

  updateDisplayState(msg = "", type = "") {
    this.statusBox.textContent = msg;
    this.statusBox.className = `message ${type}`;
  }

  toggle(show) {
    this.container.style.display = show ? "block" : "none";
    if (!show) this.statusBox.textContent = "";
  }

  async executeSearch() {
    const city = this.inputField.value.trim();
    if (!city) return;

    try {
      this.toggle(false);
      this.updateDisplayState("Fetching weather...", "loading");

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results?.length) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name } = geoData.results[0];
      const weatherData = await this.fetchWeather(latitude, longitude);
      this.render(name, weatherData);
    } catch (err) {
      this.updateDisplayState(err.message, "error");
    }
  }

  async fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    const res = await fetch(url);
    return res.json();
  }

  async reverseGeocode(lat, lon) {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`
    );
    const data = await res.json();
    return data.results?.[0]?.name || "Your Location";
  }

  async syncLocation() {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          this.toggle(false);
          this.updateDisplayState("Detecting location...", "loading");

          const cityName = await this.reverseGeocode(
            coords.latitude,
            coords.longitude
          );
          const weatherData = await this.fetchWeather(
            coords.latitude,
            coords.longitude
          );
          this.render(cityName, weatherData);
        } catch {
          this.updateDisplayState("Failed to fetch location weather", "error");
        }
      },
      () => this.updateDisplayState("Location access denied", "error")
    );
  }

  render(city, data) {
    const { current } = data;

    this.updateDisplayState("");

    const map = {
      "city-name": city,
      "temperature": `${current.temperature_2m}°C`,
      "description": "Current Weather",
      "humidity": `${current.relative_humidity_2m}%`,
      "wind-speed": `${current.wind_speed_10m} km/h`,
      "feels-like": "—",
      "pressure": "—"
    };

    for (const id in map) {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    }

    this.toggle(true);
  }
}

const WeatherApp = new WeatherDashboard();

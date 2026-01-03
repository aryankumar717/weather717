class WeatherDashboard {
  constructor() {
    this.msg = document.getElementById("message");
    this.box = document.getElementById("weather-display");
    this.input = document.getElementById("city-input");

    document.getElementById("search-btn").onclick = () => this.search();
    document.getElementById("location-btn").onclick = () => this.location();
  }

  setStatus(text = "", type = "") {
    this.msg.textContent = text;
    this.msg.className = `message ${type}`;
  }

  showWeather(show) {
    this.box.style.display = show ? "block" : "none";
  }

  async search() {
    const city = this.input.value.trim();
    if (!city) return;

    try {
      this.setStatus("", "");
      this.showWeather(false);
      this.setStatus("Loading...", "loading");

      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      ).then(r => r.json());

      if (!geo.results || geo.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name, country } = geo.results[0];
      const weather = await this.fetchWeather(latitude, longitude);

      this.render(`${name}, ${country}`, weather);
    } catch (e) {
      this.setStatus(e.message, "error");
    }
  }

  async fetchWeather(lat, lon) {
    return fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
    ).then(r => r.json());
  }

  async reverseGeocode(lat, lon) {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`
    ).then(r => r.json());

    return geo.results?.[0]?.name || "Your Location";
  }

  async location() {
    this.setStatus("", "");
    this.showWeather(false);

    if (!navigator.geolocation) {
      this.setStatus("Geolocation not supported", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          this.setStatus("Detecting location...", "loading");

          const name = await this.reverseGeocode(
            coords.latitude,
            coords.longitude
          );

          const weather = await this.fetchWeather(
            coords.latitude,
            coords.longitude
          );

          this.render(name, weather);
        } catch {
          this.setStatus("Location error", "error");
        }
      },
      () => this.setStatus("Location denied", "error")
    );
  }

  render(title, data) {
    const c = data.current;

    this.setStatus("", "");
    this.showWeather(true);

    document.getElementById("city-name").textContent = title;
    document.getElementById("temperature").textContent = `${c.temperature_2m}°C`;
    document.getElementById("description").textContent = "Current Weather";
    document.getElementById("humidity").textContent = `${c.relative_humidity_2m}%`;
    document.getElementById("wind-speed").textContent = `${c.wind_speed_10m} km/h`;
    document.getElementById("feels-like").textContent = "—";
    document.getElementById("pressure").textContent = "—";
  }
}

new WeatherDashboard();

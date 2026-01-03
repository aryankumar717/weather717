class WeatherDashboard {
  constructor() {
    this.statusBox = document.getElementById("message");
    this.container = document.getElementById("weather-display");
    this.inputField = document.getElementById("city-input");
    
    this.setup();
  }

  setup() {
    document.getElementById("search-btn").addEventListener("click", () => this.executeSearch());
    document.getElementById("location-btn").addEventListener("click", () => this.syncLocation());
  }

  updateDisplayState(msg, type = "info") {
    this.statusBox.textContent = msg;
    this.statusBox.className = `status-msg type-${type}`;
  }

  async executeSearch() {
    const val = this.inputField.value.trim();
    if (!val) return;

    try {
      this.toggle(false);
      this.updateDisplayState("Fetching...", "loading");

      const gRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${val}&count=1`);
      const gData = await gRes.json();

      if (!gData.results?.length) throw new Error("Unknown Location");

      const { latitude, longitude, name } = gData.results[0];
      const wData = await this.pull(latitude, longitude);
      
      this.render(name, wData);
    } catch (e) {
      this.updateDisplayState(e.message, "error");
    }
  }

  async pull(lat, lon) {
    const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    const r = await fetch(api);
    return r.json();
  }

  async syncLocation() {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        this.updateDisplayState("Locating...", "loading");
        const d = await this.pull(coords.latitude, coords.longitude);
        this.render("Local Area", d);
      },
      () => this.updateDisplayState("Access Denied", "error")
    );
  }

  toggle(isVisible) {
    this.container.style.display = isVisible ? "block" : "none";
    if (!isVisible) this.statusBox.textContent = "";
  }

  render(label, data) {
    const { current } = data;
    this.updateDisplayState("");

    const uiMap = {
      "city-name": label,
      "temperature": `${current.temperature_2m}°C`,
      "humidity": `${current.relative_humidity_2m}%`,
      "wind-speed": `${current.wind_speed_10m} km/h`,
      "description": "Current Conditions",
      "feels-like": "N/A",
      "pressure": "N/A"
    };

    for (const [id, value] of Object.entries(uiMap)) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    this.toggle(true);
  }
}

const WeatherApp = new WeatherDashboard();

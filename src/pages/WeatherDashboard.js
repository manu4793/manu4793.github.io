import React, { useState } from "react";
import axios from "axios";

const API_KEY = "447a6a8616dcad62aa050770a4edcae1"; // <-- Put your API key here!

export default function WeatherDashboard() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  async function fetchWeather(e) {
    e.preventDefault();
    setWeather(null);
    setError("");

    try {
      // 1. Get city coordinates
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          city
        )}&limit=1&appid=${API_KEY}`
      );
      if (!geoRes.data.length) {
        setError("City not found!");
        return;
      }
      const { lat, lon, name, country } = geoRes.data[0];

      // 2. Fetch weather from One Call 3.0 API
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      setWeather({
        city: name,
        country,
        ...weatherRes.data,
      });
    } catch (err) {
      // Show the real error in devtools, user-friendly for users
      console.log(err.response?.data || err.message);
      setError("Could not fetch weather!");
    }
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 400 }}>
      <h2 className="mb-3">Weather Dashboard</h2>
      <form onSubmit={fetchWeather} className="mb-3">
        <div className="input-group">
          <input
            className="form-control"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">
            Get Weather
          </button>
        </div>
      </form>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {weather && weather.current && (
        <div className="card p-3">
          <h4>
            {weather.city}, {weather.country}
          </h4>
          <div className="display-4">
            {weather.current?.temp !== undefined
              ? Math.round(weather.current.temp) + "°C"
              : "No data"}
          </div>
          <div>
            {weather.current?.weather?.[0]?.main} -{" "}
            {weather.current?.weather?.[0]?.description}
          </div>
          <div>Humidity: {weather.current?.humidity}%</div>
          <div>Wind: {weather.current?.wind_speed} m/s</div>
          {/* Example: Show icon */}
          {weather.current?.weather?.[0]?.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`}
              alt="icon"
              width={80}
            />
          )}
        </div>
      )}
    </div>
  );
}

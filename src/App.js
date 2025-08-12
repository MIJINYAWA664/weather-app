// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";

import WeatherWidget from "./Components/WeatherWidget";
import ForecastCard from "./Components/ForecastCard";
import SearchBar from "./Components/SearchBar";
import DarkModeToggle from "./Components/DarkModeToggle";
import UnitToggle from "./Components/UnitToggle";
import { API_KEY } from "./config";

const STORAGE_KEYS = {
  LAST_SEARCH: "weather_last_search",
  UNIT: "weather_unit",
  DARK: "weather_dark",
};

function pickDailyFromForecast(list) {
  // OpenWeatherMap 5-day forecast returns 3-hour entries.
  // Simple approach: pick one entry per day roughly 12:00 local time if present,
  // else take every 8th item as an approximation.
  const byDay = {};
  list.forEach((item) => {
    const day = new Date(item.dt * 1000).toLocaleDateString();
    // prefer midday (12:00)
    const hour = new Date(item.dt * 1000).getHours();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push({ hour, item });
  });
  const days = Object.keys(byDay).slice(0, 5);
  return days.map((day) => {
    // choose item with hour closest to 12
    const choices = byDay[day];
    choices.sort((a, b) => Math.abs(a.hour - 12) - Math.abs(b.hour - 12));
    return choices[0].item;
  });
}

const App = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // array of daily forecast entries
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(STORAGE_KEYS.DARK) === "true");
  const [unit, setUnit] = useState(() => localStorage.getItem(STORAGE_KEYS.UNIT) || "metric"); // 'metric' or 'imperial'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Persist theme & unit
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem(STORAGE_KEYS.DARK, darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNIT, unit);
  }, [unit]);

  // on mount: load last search or use geolocation
  useEffect(() => {
    const last = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_SEARCH) || "null");
    if (last) {
      if (last.type === "coords") {
        fetchWeatherByCoords(last.lat, last.lon, unit);
      } else if (last.type === "city") {
        fetchWeatherByCity(last.city, unit);
      }
    } else {
      // try geolocation
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, unit),
          (err) => {
            // permission denied or fail - leave UI for user to search
            console.warn("Geolocation fail:", err);
          },
          { timeout: 8000 }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // If unit changes, re-fetch last location
  useEffect(() => {
    const last = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_SEARCH) || "null");
    if (last) {
      if (last.type === "coords") fetchWeatherByCoords(last.lat, last.lon, unit);
      else if (last.type === "city") fetchWeatherByCity(last.city, unit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  async function fetchWeatherByCoords(lat, lon, units = unit) {
    setLoading(true);
    setError("");
    try {
      const wRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      if (!wRes.ok) throw new Error("Failed to fetch current weather");
      const wData = await wRes.json();
      setWeather(wData);

      const fRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      if (!fRes.ok) throw new Error("Failed to fetch forecast");
      const fData = await fRes.json();
      setForecast(pickDailyFromForecast(fData.list));

      localStorage.setItem(STORAGE_KEYS.LAST_SEARCH, JSON.stringify({ type: "coords", lat, lon }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not fetch weather.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeatherByCity(city, units = unit) {
    if (!city) return;
    setLoading(true);
    setError("");
    try {
      const q = encodeURIComponent(city);
      const wRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=${units}&appid=${API_KEY}`
      );
      if (!wRes.ok) {
        if (wRes.status === 404) throw new Error("City not found");
        throw new Error("Failed to fetch current weather");
      }
      const wData = await wRes.json();
      setWeather(wData);

      const fRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${q}&units=${units}&appid=${API_KEY}`
      );
      if (!fRes.ok) throw new Error("Failed to fetch forecast");
      const fData = await fRes.json();
      setForecast(pickDailyFromForecast(fData.list));

      localStorage.setItem(STORAGE_KEYS.LAST_SEARCH, JSON.stringify({ type: "city", city }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not fetch weather.");
    } finally {
      setLoading(false);
    }
  }

  const weatherMain = weather?.weather?.[0]?.main || "";
  // map some main categories to simpler classes for animated background
  const bgClass =
    weatherMain.toLowerCase().includes("cloud") ? "bg-clouds" :
    weatherMain.toLowerCase().includes("rain") || weatherMain.toLowerCase().includes("drizzle") ? "bg-rain" :
    weatherMain.toLowerCase().includes("snow") ? "bg-snow" :
    weatherMain.toLowerCase().includes("clear") ? "bg-clear" :
    weatherMain.toLowerCase().includes("thunder") ? "bg-thunder" :
    "bg-default";

  return (
    <div className={`app ${bgClass}`}>
      <div className="floating-shapes" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>

      <header className="app-header">
        <div className="brand" role="banner">
          <h1>Weather App</h1>
          <p className="subtitle">Fast forecasts at a glance</p>
        </div>

        <div className="controls" role="toolbar" aria-label="Theme and unit controls">
          <UnitToggle unit={unit} setUnit={setUnit} />
          <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </header>

      <main className="container" role="main">
        <SearchBar onSearch={fetchWeatherByCity} />

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error" role="alert">{error}</p>}

        <WeatherWidget weather={weather} unit={unit} />
        <section className="forecast-list" aria-label="5 day forecast">
          {forecast && forecast.length ? (
            forecast.map((f) => <ForecastCard key={f.dt} data={f} unit={unit} />)
          ) : (
            <p className="muted">Forecast unavailable</p>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          Powered by <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeatherMap</a>
        </p>
      </footer>
    </div>
  );
};

export default App;

// src/components/WeatherWidget.js
import React from "react";

const WeatherWidget = ({ weather, unit = "metric" }) => {
  if (!weather) return <p className="muted">No weather data yet. Search a city or allow location access.</p>;

  const tempUnit = unit === "imperial" ? "°F" : "°C";

  return (
    <div className="weather-widget" role="region" aria-label={`Current weather in ${weather.name}`}>
      <h2 className="location">{weather.name}, {weather.sys?.country}</h2>

      <div className="main">
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
        />
        <div className="temps">
          <h3>{Math.round(weather.main.temp)}{tempUnit}</h3>
          <p className="desc">{weather.weather[0].description}</p>
        </div>
      </div>

      <div className="extras" aria-hidden="false">
        <p>Feels like: {Math.round(weather.main.feels_like)}{tempUnit}</p>
        <p>Humidity: {weather.main.humidity}%</p>
        <p>Wind: {Math.round(weather.wind.speed)} {unit === "imperial" ? "mph" : "m/s"}</p>
      </div>
    </div>
  );
};

export default WeatherWidget;

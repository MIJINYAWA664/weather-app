// src/components/ForecastCard.js
import React from "react";

const ForecastCard = ({ data, unit = "metric" }) => {
  const date = new Date(data.dt * 1000);
  const day = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const tempUnit = unit === "imperial" ? "°F" : "°C";

  return (
    <article className="forecast-card" tabIndex="0" aria-label={`Forecast for ${day}`}>
      <h4>{day}</h4>
      <img
        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
        alt={data.weather[0].description}
      />
      <p className="desc">{data.weather[0].description}</p>
      <p>{Math.round(data.main.temp)}{tempUnit}</p>
    </article>
  );
};

export default ForecastCard;

// src/components/UnitToggle.js
import React from "react";

const UnitToggle = ({ unit, setUnit }) => {
  return (
    <div className="unit-toggle" role="group" aria-label="Temperature units">
      <button
        onClick={() => setUnit("metric")}
        className={unit === "metric" ? "active" : ""}
        aria-pressed={unit === "metric"}
      >
        °C
      </button>
      <button
        onClick={() => setUnit("imperial")}
        className={unit === "imperial" ? "active" : ""}
        aria-pressed={unit === "imperial"}
      >
        °F
      </button>
    </div>
  );
};

export default UnitToggle;

// src/components/DarkModeToggle.js
import React from "react";

const DarkModeToggle = ({ darkMode, setDarkMode }) => (
  <button
    className="theme-toggle"
    onClick={() => setDarkMode(!darkMode)}
    aria-pressed={darkMode}
    aria-label="Toggle dark mode"
  >
    {darkMode ? "☀️ Light" : "🌙 Dark"}
  </button>
);

export default DarkModeToggle;

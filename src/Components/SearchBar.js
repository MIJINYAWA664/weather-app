// src/components/SearchBar.js
import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = city.trim();
    if (!q) return;
    onSearch(q);
    setCity("");
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar" role="search" aria-label="Search for city weather">
      <label htmlFor="cityInput" className="sr-only">City</label>
      <input
        id="cityInput"
        aria-label="City name"
        type="text"
        placeholder="Enter city..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button type="submit" aria-label="Search">Search</button>
    </form>
  );
};

export default SearchBar;

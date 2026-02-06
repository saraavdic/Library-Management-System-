import React from 'react';

export default function SearchFilterControls({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  GENRES = [],
}) {
  return (
    <section className="catalogue-controls">
      <input
        type="text"
        className="search-input"
        placeholder="Search by book title or author..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <select
        className="filter-dropdown"
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
      >
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
    </section>
  );
}

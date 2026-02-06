import React from 'react';

export default function ResultsInfo({ filteredCount = 0, totalCount = 0 }) {
  return (
    <div className="results-info">
      <p>
        Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> books
      </p>
    </div>
  );
}

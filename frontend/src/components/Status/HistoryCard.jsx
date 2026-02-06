import React from 'react';

export default function HistoryCard({ entry }) {
  return (
    <div className="status-card">
      <h3>{entry.title}</h3>
      <p className="author"><strong>Author:</strong> {entry.author}</p>
      <p><strong>Returned:</strong> {entry.returned}</p>
    </div>
  );
}

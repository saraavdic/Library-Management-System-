import React from 'react';
import FineCard from './FineCard';

export default function FinesSection({ fines, totalFines, openModal }) {
  return (
    <>
      <div className="fines-grid">
        {fines.map((fine) => (
          <FineCard key={fine.id} fine={fine} />
        ))}
      </div>

      <div className="fines-summary">
        <div className="summary-item">
          <span className="summary-label">Total Fines:</span>
          <span className="summary-amount">${totalFines.toFixed(2)}</span>
        </div>
        <button className="pay-btn" onClick={() => openModal('pay')}>
          Pay Fines
        </button>
      </div>
    </>
  );
}

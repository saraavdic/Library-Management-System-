import React from 'react';

export default function FineCard({ fine }) {
  const title = fine.type ? (typeof fine.type === 'string' ? fine.type.charAt(0).toUpperCase() + fine.type.slice(1) : String(fine.type)) : 'Fine';
  const amount = typeof fine.amount === 'number' ? fine.amount : parseFloat(String(fine.amount || '0').replace(/[^0-9.]/g, '')) || 0;

  return (
    <div className="fine-card">
      <div className="fine-header">
        <h3>{title}</h3>
        <span className="fine-amount">${amount.toFixed(2)}</span>
      </div>
      {fine.reason && <p className="fine-reason">{fine.reason}</p>}
      <div className="fine-meta">
        <span className={`fine-status ${((fine.status||'').toLowerCase())}`}>{fine.status || 'Unknown'}</span>
      </div>
    </div>
  );
}

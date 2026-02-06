import React from 'react';

export default function FineCard({ fine }) {
  const statusDisplay = fine.status === 'paid' ? 'Paid' : 'Unpaid';
  const statusClass = fine.status === 'paid' ? 'status-paid' : 'status-unpaid';
  
  return (
    <div className="status-card fine-card">
      <h3>Fine</h3>
      <p><strong>Book:</strong> {fine.reason}</p>
      <p><strong>Amount:</strong> {fine.amount}</p>
      <p><strong>Status:</strong> <span className={statusClass}>{statusDisplay}</span></p>
    </div>
  );
}

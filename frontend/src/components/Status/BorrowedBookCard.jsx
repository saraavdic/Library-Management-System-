import React from 'react';

export default function BorrowedBookCard({ book }) {
  return (
    <div className="status-card">
      <h3>{book.title}</h3>
      <p className="author"><strong>Author:</strong> {book.author}</p>
      <p><strong>Due:</strong> {book.due}</p>
      <p className={book.daysLeft === 0 ? 'overdue-text' : book.daysLeft <= 7 ? 'warning' : ''}>
        <strong>Days Left:</strong> {book.daysLeft}
      </p>
      <span className={`status-tag ${book.status === 'Overdue' ? 'red' : 'green'}`}>
        {book.status}
      </span>
    </div>
  );
}

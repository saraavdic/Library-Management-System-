import React from 'react';

export default function BorrowedBookCardPortal({ book }) {
  return (
    <div key={book.id} className="book-card">
      <img
        src={book.cover}
        alt={book.title}
        className="book-cover"
        onError={(e) => {
          e.target.src = "../../Media/placeholder.jpg";
        }}
      />
      <div className="book-content">
        <h3>{book.title}</h3>
        <p className="author">{book.author}</p>
        <div className="book-meta">
          <div className="due-info">
            <span className="label">Due:</span>
            <span className={book.daysLeft <= 7 ? 'warning' : 'normal'}>{book.due}</span>
          </div>
          <div className="days-info">
            <span className={book.daysLeft <= 7 ? 'days-warning' : 'days-normal'}>
              {book.daysLeft} days
            </span>
          </div>
        </div>
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${book.progress}%` }}></div>
          </div>
          <span className="progress-text">{book.progress}% Borrowed period done</span>
        </div>
      </div>
    </div>
  );
}

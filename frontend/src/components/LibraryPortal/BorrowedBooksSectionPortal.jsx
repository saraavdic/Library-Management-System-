import React from 'react';
import BorrowedBookCardPortal from './BorrowedBookCardPortal';

export default function BorrowedBooksSectionPortal({ books = [] }) {
  return (
    <section className="borrowed-section">
      <div className="section-header">
        <h2>Your Borrowed Books</h2>
        <p className="section-subtitle">You have {books.length} books currently borrowed</p>
      </div>
      {books.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>You don't have any borrowed books yet.</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((b) => (
            <BorrowedBookCardPortal key={b.id} book={b} />
          ))}
        </div>
      )}
    </section>
  );
}

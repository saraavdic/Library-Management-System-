import React from 'react';
import BookCard from './BookCard';

export default function BooksGrid({ filteredBooks = [], handleBorrow }) {
  return (
    <section className="books-grid">
      {filteredBooks.map((book) => (
        <BookCard key={book.id} book={book} handleBorrow={handleBorrow} />
      ))}
    </section>
  );
}

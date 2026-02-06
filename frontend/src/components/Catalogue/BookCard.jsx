import React from 'react';

export default function BookCard({ book, handleBorrow }) {
  const getGenreClass = (genre) => {
    if (!genre) return 'genre-default';
    const genreLower = genre.toLowerCase();
    const genreMap = {
      'fiction': 'genre-fiction',
      'mystery': 'genre-mystery',
      'romance': 'genre-romance',
      'science fiction': 'genre-scifi',
      'fantasy': 'genre-fantasy',
      'history': 'genre-history',
      'biography': 'genre-biography',
      'self-help': 'genre-selfhelp',
      'adventure': 'genre-adventure',
      'thriller': 'genre-thriller',
    };
    
    for (const [key, className] of Object.entries(genreMap)) {
      if (genreLower === key || genreLower.includes(key)) {
        return className;
      }
    }
    return 'genre-default';
  };

  return (
    <div key={book.id} className="catalogue-card">
      <img
        src={book.cover}
        alt={book.title}
        className="book-cover"
        onError={(e) => {
          e.target.src = "/images/books/placeholder.jpg";
        }}
      />
      <div className="card-content">
        <h3>{book.title}</h3>
        <p className="author">{book.author}</p>
        <div className="book-meta">
          <span className={`genre-tag ${getGenreClass(book.genre)}`}>{book.genre}</span>
          <span className="year">{book.year}</span>
        </div>
        <button className="borrow-btn" onClick={() => handleBorrow(book)}>
          Info
        </button>
      </div>
    </div>
  );
}
    
import React from 'react';
import Modal from '../common/Modal';

export default function BookModal({ selectedBook, closeModal, handleRating, bookRatings = {} }) {
  if (!selectedBook) return null;

  const getGenreClass = (genre) => {
    if (!genre) return 'genre-default';
    const genreLower = genre.toLowerCase();
    // Map common genres to color classes
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
    
    // Check for exact match or partial match
    for (const [key, className] of Object.entries(genreMap)) {
      if (genreLower === key || genreLower.includes(key)) {
        return className;
      }
    }
    return 'genre-default';
  };

  return (
    <Modal isOpen={!!selectedBook} onClose={closeModal}>
      <div className="modal-body">
        <div className="modal-left">
          <img
            src={selectedBook.cover}
            alt={selectedBook.title}
            className="modal-cover"
            onError={(e) => {
              e.target.src = "/images/books/placeholder.jpg";
            }}
          />
        </div>

        <div className="modal-right">
          <h2>{selectedBook.title}</h2>
          <p className="modal-author">by {selectedBook.author}</p>
          <p className="modal-year">Published: {selectedBook.year}</p>

          <div className="modal-genre">
            <span className={`genre-badge ${getGenreClass(selectedBook.genre)}`}>{selectedBook.genre}</span>
          </div>

          <p className="modal-description">{selectedBook.description}</p>

        </div>
      </div>
    </Modal>
  );
}

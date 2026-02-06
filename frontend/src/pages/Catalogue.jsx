import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/common/Hero';
import SearchFilterControls from '../components/Catalogue/SearchFilterControls';
import ResultsInfo from '../components/Catalogue/ResultsInfo';
import BooksGrid from '../components/Catalogue/BooksGrid';
import BookModal from '../components/Catalogue/BookModal';
import LoadMoreButton from '../components/common/LoadMoreButton';
import '../styles/Catalogue.css';

export default function Catalogue() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookRatings, setBookRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const PAGE_SIZE = 15;

  // Fetch books and categories on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Fetch books
        const booksRes = await fetch('http://localhost:8081/api/catalogue/books');
        if (!booksRes.ok) throw new Error(`API error ${booksRes.status}`);
        const booksData = await booksRes.json();
        
        // Fetch categories
        const categoriesRes = await fetch('http://localhost:8081/api/catalogue/categories');
        const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
        
        if (mounted) {
          setBooks(booksData);
          const categoryNames = ['All Genres', ...new Set(categoriesData.map(c => c.category_name).filter(Boolean))];
          setCategories(categoryNames);
        }
      } catch (err) {
        console.error('Failed to load books', err);
        if (mounted) setError(err.message || 'Failed to load books');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // Filter books based on search and genre, and exclude soft-deleted books (copies = -1)
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Exclude books with -1 copies (soft deleted)
      if (book.copies === -1 || book.total_copies === -1) {
        return false;
      }
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.author || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'All Genres' || book.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [books, searchQuery, selectedGenre]);

  // Calculate available books (excluding soft-deleted ones)
  const availableBooks = useMemo(() => {
    return books.filter((book) => book.copies !== -1 && book.total_copies !== -1).length;
  }, [books]);

  // Reset visible count when filters/search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedGenre, books]);

  const visibleBooks = filteredBooks.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(filteredBooks.length, prev + PAGE_SIZE));
  };

  const handleBorrow = (book) => {
    setSelectedBook(book);
  };

  const handleRating = (bookId, rating) => {
    setBookRatings((prev) => ({
      ...prev,
      [bookId]: rating,
    }));
  };

  const closeModal = () => {
    setSelectedBook(null);
  };

  return (
    <div className="catalogue-container">
      <Navbar />
      <main className="catalogue-main">
        <Hero title="Book Catalogue" subtitle="Discover books from our extensive collection" />

        <SearchFilterControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          GENRES={categories.length > 0 ? categories : ['All Genres']}
        />

        <ResultsInfo filteredCount={filteredBooks.length} totalCount={availableBooks} />

        {loading ? (
          <div>Loading books…</div>
        ) : error ? (
          <div className="error">Error loading books: {error}</div>
        ) : filteredBooks.length > 0 ? (
          <>
            <BooksGrid filteredBooks={visibleBooks} handleBorrow={handleBorrow} />
            {visibleCount < filteredBooks.length && (
              <LoadMoreButton onClick={loadMore} />
            )}
          </>
        ) : (
          <div className="no-results">
            <p>No books found matching your search criteria.</p>
          </div>
        )}
      </main>

      <BookModal
        selectedBook={selectedBook}
        closeModal={closeModal}
        handleRating={handleRating}
        bookRatings={bookRatings}
      />
    </div>
  );
}
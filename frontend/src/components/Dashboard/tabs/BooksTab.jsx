import React, { useState, useEffect } from "react";
import BooksTable from '../tables/BooksTable';
import BookFilter from '../filters/BookFilter';
import AddBookModal from '../modals/AddBookModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import LoadMoreButton from '../../common/LoadMoreButton';
import '../../../styles/Dashboard.css';

const BooksTab = ({ books, setBooks, searchQuery, setSearchQuery }) => {
  const [formData, setFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [bookFilters, setBookFilters] = useState({ genre: '' });
  const [bookSort, setBookSort] = useState({ column: 'title', order: 'asc' });

  // paging
  const [visibleCount, setVisibleCount] = useState(5);

  const getFilteredAndSortedBooks = () => {
    const q = searchQuery.trim().toLowerCase();
    let filtered = books.filter(b =>
      (bookFilters.genre === '' || b.genre === bookFilters.genre) &&
      (q === '' || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    );

    return [...filtered].sort((a, b) => {
      let aVal = a[bookSort.column];
      let bVal = b[bookSort.column];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return bookSort.order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  useEffect(() => {
    setVisibleCount(5);
  }, [searchQuery, bookFilters, bookSort, books]);

  const handleAddBook = async () => {
    const title = (formData.title || '').trim();
    const author = (formData.author || '').trim();
    if (!title || !author) {
      alert('Please provide title and author.');
      return;
    }

    // Prepare payload for backend
    const payload = {
      title,
      author,
      description: formData.description || '',
      isbn: formData.isbn || '',
      category_id: formData.categoryId || null,
      publisher: formData.publisher || '',
      publisher_id: null,
      published_year: formData.published_year || null,
      total_copies: parseInt(formData.copies) || 1,
      cover_image_url: formData.coverUrl || ''
    };

    try {
      const res = await fetch('http://localhost:8081/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to create book');
      }

      // Map created record to frontend shape
      const created = body; // backend returns full book row from getById
      const newBook = {
        id: created.book_id,
        title: created.title,
        author: author,
        genre: created.category_name || (formData.genre || 'General'),
        published_year: created.published_year || formData.published_year || '',
        copies: created.total_copies || payload.total_copies,
        available: created.total_copies || payload.total_copies,
        description: created.description || payload.description,
        publisher: created.publisher_name || formData.publisher || '',
        coverUrl: created.cover_image_url || payload.cover_image_url,
        isbn: created.isbn || payload.isbn
      };

      setBooks(prev => [...prev, newBook]);
      setFormData({});
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding book to backend:', err);
      alert('Error adding book: ' + err.message);
    }
  };

  const handleDeleteBook = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId == null) return;
    setDeleting(true);
    setDeleteError('');
    
    // Call backend DELETE endpoint
    fetch(`http://localhost:8081/api/books/${confirmDeleteId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(body => {
        if (!body.deleted) {
          throw new Error(body.error || 'Deletion failed');
        }
        setBooks(prev => prev.filter(b => b.id !== confirmDeleteId));
        setConfirmDeleteId(null);
      })
      .catch(err => {
        console.error('Error deleting book:', err);
        setDeleteError(err.message || 'Failed to delete book');
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
    setDeleteError('');
  };

  const handleBookSort = (column) => {
    setBookSort(prev => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <>
      <div className="tab-content">
        <div className="content-header">
          <h2>Book Management</h2>
          <div className="header-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search table (title or author)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="add-btn" onClick={() => { setFormData({}); setShowAddModal(true); }}>
              Add Book
            </button>
          </div>
        </div>

        <BookFilter bookFilters={bookFilters} setBookFilters={setBookFilters} onReset={() => { setBookSort({ column: 'title', order: 'asc' }); setVisibleCount(5); }} />

        <>
          <BooksTable 
            books={getFilteredAndSortedBooks().slice(0, visibleCount)} 
            bookSort={bookSort} 
            handleBookSort={handleBookSort}
            onDeleteBook={handleDeleteBook}
          />
          {getFilteredAndSortedBooks().length > visibleCount && (
            <LoadMoreButton onClick={() => setVisibleCount(prev => Math.min(prev + 10, getFilteredAndSortedBooks().length))} />
          )}
        </>
      </div>

      <AddBookModal 
        showAddModal={showAddModal}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddBook}
      />

      <ConfirmDeleteModal
        id={confirmDeleteId}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        deleting={deleting}
        error={deleteError}
      />
    </>
  );
};

export default BooksTab;
import React, { useState, useEffect, useRef } from "react";
import BorrowingsTable from '../tables/BorrowingsTable';
import AutocompleteInput from '../ui/AutocompleteInput';
import LoadMoreButton from '../../common/LoadMoreButton';
import '../../../styles/Dashboard.css';

const BorrowingsTab = ({ members, books, setBooks, borrowings, setBorrowings, borrowSearch, setBorrowSearch }) => {
  const [borrowForm, setBorrowForm] = useState({
    userId: '',
    name: '',
    email: '',
    title: '',
    author: '',
    copies: 1,
    borrowDate: new Date().toISOString().split('T')[0]
  });

  const [userQuery, setUserQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [userHighlight, setUserHighlight] = useState(-1);
  const userRef = useRef(null);

  const [bookQuery, setBookQuery] = useState('');
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [bookHighlight, setBookHighlight] = useState(-1);
  const bookRef = useRef(null);

  const [borrowSort, setBorrowSort] = useState({ column: 'member', order: 'asc' });

  // paging
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const onDocClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) { setUserSuggestions([]); setUserHighlight(-1); }
      if (bookRef.current && !bookRef.current.contains(e.target)) { setBookSuggestions([]); setBookHighlight(-1); }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const updateUserSuggestions = (q) => {
    setUserQuery(q);
    if (!q) { setUserSuggestions([]); setUserHighlight(-1); return; }
    const ql = q.toLowerCase();
    const matches = members
      .filter(m => m.name.toLowerCase().includes(ql) || m.email.toLowerCase().includes(ql))
      .slice(0, 8);
    setUserSuggestions(matches);
    setUserHighlight(matches.length ? 0 : -1);
  };

  const onUserKeyDown = (e) => {
    if (!userSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setUserHighlight(prev => Math.min(prev + 1, userSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setUserHighlight(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (userHighlight >= 0 && userSuggestions[userHighlight]) selectUserSuggestion(userSuggestions[userHighlight]);
    } else if (e.key === 'Escape') {
      setUserSuggestions([]); setUserHighlight(-1);
    }
  };

  const selectUserSuggestion = (u) => {
    setBorrowForm(f => ({ ...f, userId: u.id, name: u.name, email: u.email }));
    setUserQuery(u.name);
    setUserSuggestions([]);
    setUserHighlight(-1);
  };

  const updateBookSuggestions = (q) => {
    setBookQuery(q);
    if (!q) { setBookSuggestions([]); setBookHighlight(-1); return; }
    const ql = q.toLowerCase();
    const matches = books
      .filter(b => b.title.toLowerCase().includes(ql) || b.author.toLowerCase().includes(ql))
      .slice(0, 8);
    setBookSuggestions(matches);
    setBookHighlight(matches.length ? 0 : -1);
  };

  const onBookKeyDown = (e) => {
    if (!bookSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBookHighlight(prev => Math.min(prev + 1, bookSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBookHighlight(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (bookHighlight >= 0 && bookSuggestions[bookHighlight]) selectBookSuggestion(bookSuggestions[bookHighlight]);
    } else if (e.key === 'Escape') {
      setBookSuggestions([]); setBookHighlight(-1);
    }
  };

  const selectBookSuggestion = (b) => {
    setBorrowForm(f => ({ ...f, bookId: b.id, title: b.title, author: b.author }));
    setBookQuery(b.title);
    setBookSuggestions([]);
    setBookHighlight(-1);
  };

  const getFilteredAndSortedBorrowings = () => {
    const q = borrowSearch.trim().toLowerCase();
    let filtered = borrowings.filter(b => {
      const searchMatch = q === '' || b.member.toLowerCase().includes(q) || b.title.toLowerCase().includes(q) || (b.email || '').toLowerCase().includes(q);
      return searchMatch;
    });

    return [...filtered].sort((a, b) => {
      let aVal = a[borrowSort.column];
      let bVal = b[borrowSort.column];
      if (borrowSort.column === 'borrowDate' || borrowSort.column === 'dueDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return borrowSort.order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  useEffect(() => {
    setVisibleCount(5);
  }, [borrowSearch, borrowSort, borrowings]);

  const handleBorrowSort = (column) => {
    setBorrowSort(prev => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleLogBorrowing = async () => {
    if (!borrowForm.userId || !borrowForm.bookId || !borrowForm.title) {
      alert('Select member and enter book title.');
      return;
    }
    try {
      const borrowDate = borrowForm.borrowDate;
      const due = new Date(borrowDate);
      due.setDate(due.getDate() + 14);
      const payload = {
        user_id: borrowForm.userId,
        book_id: borrowForm.bookId,
        borrow_date: borrowDate,
        due_date: due.toISOString().split('T')[0]
      };
      const res = await fetch('http://localhost:8081/api/borrow-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let msg = `Borrow API ${res.status}`;
        try {
          const body = await res.json();
          if (body && (body.error || body.message)) msg = body.error || body.message;
        } catch (e) {
          // ignore
        }
        throw new Error(msg);
      }
      const created = await res.json();
      const entry = {
        id: created.borrow_id || created.id,
        userId: created.user_id || borrowForm.userId,
        member: borrowForm.name,
        email: borrowForm.email,
        title: borrowForm.title,
        author: borrowForm.author,
        copies: borrowForm.copies,
        borrowDate: created.borrow_date || borrowForm.borrowDate,
        dueDate: created.due_date
      };
      setBorrowings(b => [entry, ...b]);
      resetForm();
    } catch (err) {
      console.error('Failed to log borrowing', err);
      alert(err.message || 'Failed to log borrowing');
    }
  };

  const resetForm = () => {
    setBorrowForm({ userId:'', name:'', email:'', title:'', author:'', copies:1, borrowDate: new Date().toISOString().split('T')[0] });
    setUserQuery('');
    setBookQuery('');
  };

  const handleReturnBorrowing = async (borrowingId) => {
    try {
      console.debug('Returning borrowing id=', borrowingId);
      const res = await fetch(`http://localhost:8081/api/borrow-records/${borrowingId}/return`, { method: 'PUT' });
      if (!res.ok) {
        let msg = `Return API ${res.status}`;
        try {
          const body = await res.json();
          if (body && (body.error || body.message)) msg = body.error || body.message;
        } catch (e) {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }
      const returned = await res.json();

      // Remove from borrowings list
      setBorrowings(prev => prev.filter(b => b.id !== borrowingId));

      // Fetch updated book row and update books list so Available increases
      try {
        const bookId = returned.book_id || returned.bookId || returned.bookId;
        if (bookId && typeof setBooks === 'function') {
          const bRes = await fetch(`http://localhost:8081/api/books/${bookId}`);
          if (bRes.ok) {
            const bookJson = await bRes.json();
            const updatedBook = {
              id: bookJson.book_id || bookJson.id,
              title: bookJson.title,
              author: bookJson.author || '',
              genre: bookJson.category_name || bookJson.genre || '',
              copies: bookJson.total_copies || bookJson.copies || 0,
              available: bookJson.total_copies || bookJson.copies || 0
            };
            setBooks(prev => prev.map(b => (b.id === updatedBook.id ? updatedBook : b)));
          }
        }
      } catch (e) {
        console.warn('Failed to refresh book after return', e);
      }

    } catch (err) {
      console.error('Failed to return borrowing', err);
      alert(`Failed to mark return: ${err.message}`);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Log Borrowing</h2>
        <div className="header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search borrowings (user, book)..."
            value={borrowSearch}
            onChange={(e) => setBorrowSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="announcement-card borrow-card">
        <div className="borrow-form">
          <label>
            <span className="label-text">Member</span>
            <AutocompleteInput
              ref={userRef}
              value={userQuery}
              onChange={(e) => updateUserSuggestions(e.target.value)}
              onKeyDown={onUserKeyDown}
              suggestions={userSuggestions}
              highlightIndex={userHighlight}
              onSelect={selectUserSuggestion}
              onHover={(i) => setUserHighlight(i)}
              placeholder="Search member by name or email"
            />
          </label>

          <label>
            <span className="label-text">Email (auto)</span>
            <input type="email" value={borrowForm.email} readOnly />
          </label>

          <label>
            <span className="label-text">Book Title</span>
            <AutocompleteInput
              ref={bookRef}
              value={bookQuery}
              onChange={(e) => updateBookSuggestions(e.target.value)}
              onKeyDown={onBookKeyDown}
              suggestions={bookSuggestions}
              highlightIndex={bookHighlight}
              onSelect={selectBookSuggestion}
              onHover={(i) => setBookHighlight(i)}
              placeholder="Search book by title or author"
            />
          </label>

          <label>
            <span className="label-text">Author</span>
            <input type="text" value={borrowForm.author} readOnly />
          </label>

          <label>
            <span className="label-text">Copies</span>
            <input type="number" min="1" value={borrowForm.copies} onChange={(e) => setBorrowForm(f => ({ ...f, copies: Number(e.target.value) || 1 }))} />
          </label>

          <label>
            <span className="label-text">Borrow Date</span>
            <input type="date" value={borrowForm.borrowDate} onChange={(e) => setBorrowForm(f => ({ ...f, borrowDate: e.target.value }))} />
          </label>

          <div className="borrow-actions">
            <button className="add-btn" onClick={handleLogBorrowing}>Log Borrowing</button>
            <button className="clear-filters-btn" onClick={resetForm}>Clear</button>
          </div>
        </div>
      </div>

      <>
        <BorrowingsTable 
          borrowings={getFilteredAndSortedBorrowings().slice(0, visibleCount)}
          borrowSearch={borrowSearch}
          borrowSort={borrowSort}
          handleBorrowSort={handleBorrowSort}
          onReturnBorrowing={handleReturnBorrowing}
        />
        {getFilteredAndSortedBorrowings().length > visibleCount && (
          <LoadMoreButton onClick={() => setVisibleCount(prev => Math.min(prev + 10, getFilteredAndSortedBorrowings().length))} />
        )}
      </>
    </div>
  );
};

export default BorrowingsTab;
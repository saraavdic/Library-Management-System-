import React, { useState, useEffect } from "react";
import '../../../styles/Dashboard.css';

const BookFilter = ({ bookFilters, setBookFilters, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories from the backend
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/books/categories');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="filters-bar">
      <select 
        value={bookFilters.genre} 
        onChange={(e) => setBookFilters({ ...bookFilters, genre: e.target.value })} 
        className="filter-select"
        disabled={loading}
      >
        <option value="">All Genres</option>
        {categories.map(cat => (
          <option key={cat.category_id} value={cat.category_name}>
            {cat.category_name}
          </option>
        ))}
      </select>
      <button 
        className="clear-filters-btn" 
        onClick={() => { setBookFilters({ genre: '' }); if (typeof onReset === 'function') onReset(); }}
      >
        Reset
      </button>
    </div>
  );
};

export default BookFilter;
import React, { useState } from "react";
import Modal from '../../common/Modal';
import '../../../styles/Dashboard.css';

const AddBookModal = ({ 
  showAddModal, 
  formData, 
  setFormData, 
  onClose, 
  onSave 
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleAiSuggest = async () => {
    const { title, author } = formData;
    if (!title || !author) {
      setAiError('Please enter title and author first');
      return;
    }

    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/books/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AI suggestion failed');
      }

      setFormData({
        ...formData,
        description: data.description || '',
        publisher: data.publisher || '',
        coverUrl: data.coverUrl || '',
        isbn: data.isbn || '',
        genre: data.genre || '',
        published_year: data.published_year || '',
        categoryId: data.genreId || null
      });
    } catch (err) {
      console.error('AI suggestion error:', err);
      setAiError(err.message || 'Failed to get AI suggestion');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={showAddModal} 
      onClose={onClose} 
      title="Add New Book"
      actions={
        <>
          <button className="save-btn" onClick={onSave}>Add Book</button>
          <button 
            className="clear-filters-btn" 
            onClick={() => { 
              setFormData({}); 
              setAiError('');
              onClose(); 
            }}
          >
            Cancel
          </button>
        </>
      }
    >
      <label>
        <span className="label-text">Title</span>
        <input 
          type="text" 
          placeholder="Title" 
          value={formData.title || ''} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
        />
      </label>
      <label>
        <span className="label-text">Author</span>
        <input 
          type="text" 
          placeholder="Author" 
          value={formData.author || ''} 
          onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
        />
      </label>

      {/* AI Suggestion Button */}
      <button 
        className="ai-suggest-btn"
        onClick={handleAiSuggest}
        disabled={aiLoading || !formData.title || !formData.author}
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '12px',
          backgroundColor: '#6c63ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: aiLoading ? 'not-allowed' : 'pointer',
          opacity: (aiLoading || !formData.title || !formData.author) ? 0.6 : 1
        }}
      >
        {aiLoading ? 'Fetching AI suggestions...' : 'Suggest with AI'}
      </button>
      {aiError && <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '8px' }}>{aiError}</p>}

      <label>
        <span className="label-text">Description</span>
        <textarea 
          placeholder="Book description" 
          value={formData.description || ''} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{ minHeight: '80px', width: '100%', boxSizing: 'border-box' }}
        />
      </label>
      <label>
        <span className="label-text">Publisher</span>
        <input 
          type="text" 
          placeholder="Publisher" 
          value={formData.publisher || ''} 
          onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} 
        />
      </label>
      <label>
        <span className="label-text">Published Year</span>
        <input 
          type="text" 
          placeholder="e.g., 1997" 
          value={formData.published_year || ''} 
          onChange={(e) => setFormData({ ...formData, published_year: e.target.value })} 
        />
      </label>
      <label>
        <span className="label-text">ISBN</span>
        <input 
          type="text" 
          placeholder="ISBN" 
          value={formData.isbn || ''} 
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} 
        />
      </label>
      <label>
        <span className="label-text">Genre</span>
        <input 
          type="text" 
          placeholder="Genre" 
          value={formData.genre || ''} 
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })} 
        />
      </label>
      <label>
        <span className="label-text">Cover Image URL</span>
        <input 
          type="text" 
          placeholder="Cover image URL" 
          value={formData.coverUrl || ''} 
          onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })} 
        />
        {formData.coverUrl && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>Preview:</p>
            <img 
              src={formData.coverUrl} 
              alt="Book cover preview" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              style={{ 
                maxWidth: '120px', 
                maxHeight: '180px', 
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.1)'
              }} 
            />
          </div>
        )}
      </label>
      <label>
        <span className="label-text">Number of Copies</span>
        <input 
          type="number" 
          placeholder="Number of Copies" 
          value={formData.copies || ''} 
          onChange={(e) => setFormData({ ...formData, copies: e.target.value })} 
        />
      </label>
    </Modal>
  );
};

export default AddBookModal;
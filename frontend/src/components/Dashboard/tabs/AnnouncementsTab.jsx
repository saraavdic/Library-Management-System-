import React, { useState } from "react";
import '../../../styles/Dashboard.css';

const AnnouncementsTab = () => {
  const [formData, setFormData] = useState({ title: '', category: 'General', message: '' });
  const [publishing, setPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in title and message.');
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch('http://localhost:8081/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          message: formData.message,
        }),
      });

      if (!response.ok) throw new Error('Failed to publish announcement');

      setFormData({ title: '', category: 'General', message: '' });
      setSuccessMessage('Announcement published successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error publishing announcement:', error);
      alert('Failed to publish announcement. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Create Announcement</h2>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="announcement-card">
        <form className="announcement-form" onSubmit={handlePublish}>
          <label>
            <span className="label-text">Title</span>
            <input 
              type="text" 
              placeholder="Announcement title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </label>

          <label>
            <span className="label-text">Category</span>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option>General</option>
              <option>Important</option>
              <option>Event</option>
            </select>
          </label>

          <label>
            <span className="label-text">Message</span>
            <textarea 
              rows="6" 
              placeholder="Write your announcement here..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            ></textarea>
          </label>

          <button type="submit" className="publish-btn" disabled={publishing}>
            {publishing ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementsTab;
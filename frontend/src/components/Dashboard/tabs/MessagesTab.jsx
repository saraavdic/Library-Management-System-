import React, { useState, useEffect } from 'react';
import '../../../styles/Dashboard.css';

const MessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'all' 
        ? 'http://localhost:8081/api/messages'
        : `http://localhost:8081/api/messages/source/${filter}`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch messages');
      
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    
    try {
      const res = await fetch(`http://localhost:8081/api/messages/${messageId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete message');
      
      setMessages(messages.filter(m => m.message_id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceBadge = (source) => {
    return source === 'user' 
      ? <span className="badge badge-user">Library Portal User</span>
      : <span className="badge badge-website">Website</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="messages-tab">
      <div className="tab-header">
        <h2>Messages</h2>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Messages</option>
            <option value="user">Library Portal Users Only</option>
            <option value="website">Website Only</option>
          </select>
          
          <input
            type="text"
            placeholder="Search by name, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading messages...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="no-data">No messages found</div>
      ) : (
        <div className="messages-container">
          {filteredMessages.map((msg) => (
            <div key={msg.message_id} className="message-card">
              <div className="message-header">
                <div className="message-info">
                  <h3>{msg.name}</h3>
                  <p className="email">{msg.email}</p>
                </div>
                <div className="message-meta">
                  {getSourceBadge(msg.source)}
                  <span className="date">{formatDate(msg.created_at)}</span>
                </div>
              </div>
              
              {msg.subject && (
                <h4 className="message-subject">{msg.subject}</h4>
              )}
              
              <p className="message-content">{msg.message}</p>
              
              <div className="message-actions">
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(msg.message_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesTab;

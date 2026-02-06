import React, { useState, useEffect } from 'react';
import AnnouncementCardPortal from './AnnouncementCardPortal';

export default function AnnouncementsSectionPortal() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch('http://localhost:8081/api/announcements');
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const data = await response.json();
        
        // Map database format to card display format
        const mappedAnnouncements = data.map((ann) => ({
          id: ann.id,
          title: ann.title,
          text: ann.message,
          tag: ann.category || 'general',
          tagType: mapCategoryToTagType(ann.category),
          icon: mapCategoryToIcon(ann.category),
          date: ann.date_published ? new Date(ann.date_published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        }));

        setAnnouncements(mappedAnnouncements);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  const mapCategoryToTagType = (category) => {
    const categoryLower = (category || 'general').toLowerCase();
    if (categoryLower === 'important') return 'important';
    if (categoryLower === 'event') return 'event';
    return 'general';
  };

  const mapCategoryToIcon = (category) => {
    const categoryLower = (category || 'general').toLowerCase();
    if (categoryLower === 'important') return '/Media/important.png';
    if (categoryLower === 'event') return '/Media/event.png';
    return '/Media/general.png';
  };

  if (loading) {
    return (
      <section className="announcements-section">
        <div className="section-header">
          <h2>Latest Announcements</h2>
          <p className="section-subtitle">Stay updated with library news</p>
        </div>
        <p>Loading announcements...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="announcements-section">
        <div className="section-header">
          <h2>Latest Announcements</h2>
          <p className="section-subtitle">Stay updated with library news</p>
        </div>
        <p>Error loading announcements: {error}</p>
      </section>
    );
  }

  return (
    <section className="announcements-section">
      <div className="section-header">
        <h2>Latest Announcements</h2>
        <p className="section-subtitle">Stay updated with library news</p>
      </div>
      <div className="announcement-grid">
        {announcements.length > 0 ? (
          announcements.map((a) => (
            <AnnouncementCardPortal key={a.id} announcement={a} />
          ))
        ) : (
          <p>No announcements available.</p>
        )}
      </div>
    </section>
  );
}

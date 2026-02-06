import React from 'react';

export default function AnnouncementCardPortal({ announcement }) {
  return (
    <div key={announcement.id} className={`announcement-card ${announcement.tagType}`}>
      <div className="card-header">
        <span className="icon">
          {announcement.icon && announcement.icon.endsWith('.png') ? (
            <img src={announcement.icon} alt="icon" className="announcement-icon" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          ) : (
            announcement.icon
          )}
        </span>
        <span className={`tag tag-${announcement.tagType}`}>{announcement.tag}</span>
      </div>
      <h3>{announcement.title}</h3>
      <p className="date">{announcement.date}</p>
      <p className="text">{announcement.text}</p>
    </div>
  );
}

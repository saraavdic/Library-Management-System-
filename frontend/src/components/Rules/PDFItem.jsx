import React from 'react';

export default function PDFItem({ title, desc, href }) {
  return (
    <div className="pdf-item">
      <div className="pdf-meta">
        <strong>{title}</strong>
        <span className="pdf-desc">{desc}</span>
      </div>
      <a
        className="pdf-download-btn"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        Download
      </a>
    </div>
  );
}

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ErrorPages.css';

export default function ErrorLayout({ code, title, message, primaryLink = '/', primaryText = 'Return home', secondaryLink = '/contact', secondaryText = 'Contact support', children }) {
  // Add a body-level background when an error page is mounted so the gradient visually reaches
  // the footer even if the page content doesn't exactly align.
  useEffect(() => {
    document.body.classList.add('error-bg');
    return () => document.body.classList.remove('error-bg');
  }, []);

  return (
    <main className="error-hero">
      <div className="error-card">
        {/* Large decorative code */}
        <div className="error-code" aria-hidden>{code}</div>

        <div className="error-body">
          <h2 className="error-title">{title}</h2>
          <p className="error-message">{message}</p>

          <div className="error-actions">
            <Link to={primaryLink} className="btn btn-primary">{primaryText}</Link>
            <Link to={secondaryLink} className="btn btn-alt">{secondaryText}</Link>
          </div>
        </div>

        {children && <div className="error-illustration" aria-hidden>{children}</div>}
      </div>
    </main>
  );
}

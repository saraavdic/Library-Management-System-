import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/LoggedOut.css';

const LoggedOut = () => {
  return (
    <main className="logged-out-main">
      <div className="login-container">
        <div className="login-grid">
          
          <div className="login-card logged-out-left">
            <h2 className="logged-out-title">You are signed out</h2>
            <p className="logged-out-message">You've successfully signed out of your account.</p>

            <div className="logged-out-actions">
              <Link to="/login" className="login-button">Sign in again</Link>
              <Link to="/" className="btn ghost">Return home</Link>
            </div>
          </div>

          <aside className="login-aside" aria-hidden>
            <img src="/Media/login-picture.jpg" alt="Library" />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default LoggedOut;

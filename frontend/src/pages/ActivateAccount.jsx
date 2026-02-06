import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((s) => !s);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    // Debug info
    console.log('ActivateAccount: submit', { token: token ? token.slice(0,16) + '...' : null, passwordLength: password.length, confirmLength: confirm.length });

    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    if (!token) return setError('Missing activation token');

    setLoading(true);
    try {
      const res = await fetch('/api/users/activate-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const body = await res.json();
      console.log('Activate response', res.status, body);
      if (!res.ok) {
        setError(body.error || 'Activation failed');
        return;
      }
      setSuccess('Account activated — you may now log in');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      console.error('Activation error', err);
      setError('Activation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-main">
      <div className="login-container">
        <div className="login-grid">
          <div className="login-card">
            <h2>Set your password</h2>
            <p className="login-subtitle">Create a password to activate your account</p>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="password">New password</label>
                <div className="password-wrapper">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={toggleShowPassword}
                  >
                    <img
                      src={showPassword ? "/Media/eye.png" : "/Media/eyebrow.png"}
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirm">Confirm password</label>
                <div className="password-wrapper">
                  <input id="confirm" name="confirm" type={showPassword ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={toggleShowPassword}
                  >
                    <img
                      src={showPassword ? "/Media/eye.png" : "/Media/eyebrow.png"}
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}
              <button type="button" className="login-button" disabled={loading} onClick={handleSubmit}>{loading ? 'Saving...' : 'Save password'}</button>
            </form>
          </div>

          <aside className="login-aside" aria-hidden="true">
            <img src="/Media/login-picture.jpg" alt="Library" />
          </aside>
        </div>
      </div>
    </main>
  );
}

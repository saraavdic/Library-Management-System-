import React, { useState } from 'react';
import Modal from './Modal';
import '../../styles/ModalPassword.css';

export default function ModalPassword({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowCurrentPassword = () => setShowCurrentPassword((s) => !s);
  const toggleShowNewPassword = () => setShowNewPassword((s) => !s);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((s) => !s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.user_id || user.id;

      if (!userId) {
        setError('Unable to identify user');
        setLoading(false);
        return;
      }

      // Call backend API
      const response = await fetch(`/api/users/${userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to change password');
        setLoading(false);
        return;
      }

      // Success
      setSuccess('Password changed successfully!');
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to change password. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  const actions = (
    <div className="modal-actions">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" actions={actions} size="md">
      <form className="password-form">
        {error && <div className="password-error">{error}</div>}
        {success && <div className="password-success">{success}</div>}

        <div className="form-group">
          <label htmlFor="current-password">Current Password</label>
          <div className="password-wrapper">
            <input
              type={showCurrentPassword ? "text" : "password"}
              id="current-password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              aria-pressed={showCurrentPassword}
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              onClick={toggleShowCurrentPassword}
              disabled={loading}
            >
              <img
                src={showCurrentPassword ? "/Media/eye.png" : "/Media/eyebrow.png"}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <div className="password-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              id="new-password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              aria-pressed={showNewPassword}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              onClick={toggleShowNewPassword}
              disabled={loading}
            >
              <img
                src={showNewPassword ? "/Media/eye.png" : "/Media/eyebrow.png"}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              aria-pressed={showConfirmPassword}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={toggleShowConfirmPassword}
              disabled={loading}
            >
              <img
                src={showConfirmPassword ? "/Media/eye.png" : "/Media/eyebrow.png"}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="forgot-password-section">
          <a href="/forgot-password" className="forgot-password-link">
            Forgot current password?
          </a>
        </div>
      </form>
    </Modal>
  );
}

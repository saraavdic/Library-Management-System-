import React, { useEffect, useState } from 'react';

export default function Admin() {
  const [secret, setSecret] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin-6f2b3d/secret', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to fetch admin data');
      }
      return res.json();
    })
    .then(data => {
      setSecret(data.secret || JSON.stringify(data));
    })
    .catch(err => {
      setError(err.message);
    })
    .finally(() => setLoading(false));
  }, []);

  return (
    <main className="admin-page">
      <h1>Admin Console</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {secret && (
        <div className="admin-secret">
          <p><strong>Secret:</strong> {secret}</p>
        </div>
      )}
      <p>Note: This page is protected by role-based authorization and requires a valid token.</p>
    </main>
  );
}

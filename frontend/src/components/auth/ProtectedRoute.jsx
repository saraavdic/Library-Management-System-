import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute checks for a logged-in user (localStorage 'user').
 * If not authenticated, it redirects to the /logged-out page.
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;

  if (!user) {
    // Redirect to /logged-out and replace history so pressing Back doesn't reveal protected page
    return <Navigate to="/logged-out" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    // Non-admins get redirected away
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

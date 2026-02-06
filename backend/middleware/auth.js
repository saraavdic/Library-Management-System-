const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_a_secure_secret';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token || req.body && req.body.token);
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Standardize user object: user_id and role
    req.user = { user_id: payload.user_id, role: payload.role };
    return next();
  } catch (err) {
    console.error('Token verification failed:', err && err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };

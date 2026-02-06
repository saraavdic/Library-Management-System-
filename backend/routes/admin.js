const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Users = require('../models/users');
const db = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_a_secure_secret';

// Rate limiter for admin login endpoint
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many admin login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Ensure invitations table exists and users.status column exists
async function ensureInviteSchema() {
  try {
    // Add status column to users if missing
    try {
      await db.query("ALTER TABLE users ADD COLUMN status ENUM('pending','active','inactive') DEFAULT 'active'");
      console.log('Added users.status column');
    } catch (err) {
      if (err && err.code === 'ER_DUP_FIELDNAME') {
        // column already exists - ignore
      } else if (err && err.errno === 1060) {
        // duplicate column name - ignore
      } else {
        // ignore other errors (e.g., column exists in different DBs)
      }
    }

    // Ensure created_at exists on users (some DBs / imports may lack it)
    try {
      await db.query("ALTER TABLE users ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
      console.log('Added users.created_at column');
    } catch (err) {
      if (err && (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060)) {
        // column exists - ignore
      } else {
        // ignore other errors but log for debugging
        console.warn('Could not add users.created_at column (ignored):', err && err.message ? err.message : err);
      }
    }

    // Ensure membership_end_date exists so triggers that set it don't fail
    try {
      await db.query("ALTER TABLE users ADD COLUMN membership_end_date DATE DEFAULT NULL");
      console.log('Added users.membership_end_date column');
    } catch (err) {
      if (err && (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060)) {
        // column exists - ignore
      } else {
        console.warn('Could not add users.membership_end_date column (ignored):', err && err.message ? err.message : err);
      }
    }

    // Create invitations table if not exists
    await db.query(`CREATE TABLE IF NOT EXISTS user_invitations (
      invitation_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY (token_hash),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  } catch (err) {
    console.error('Failed to ensure invitation schema:', err);
    throw err;
  }
}

// Hidden admin endpoint - change path if you want another opaque URL
router.get('/admin-6f2b3d/secret', requireAuth, requireAdmin, (req, res) => {
  // You can also return any admin-only data here
  res.json({ secret: 'This is a top-secret admin-only response', user: req.user });
});

// POST /admin/login - admin-only login endpoint (hidden)
router.post('/admin/login', adminLoginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Missing identifier or password' });
    }

    const user = await Users.getByIdentifier(identifier);
    if (!user) {
      console.warn('Admin login failed: user not found for identifier:', identifier);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // verify password
    const passwordHash = user.password_hash || user.password;
    const isPasswordValid = await Users.comparePassword(password, passwordHash);
    if (!isPasswordValid) {
      console.warn('Admin login failed: invalid password for user_id:', user.user_id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      console.warn('Admin login rejected: user is not admin:', user.user_id);
      return res.status(403).json({ error: 'Access denied' });
    }

    const safeUser = (({ password, password_hash, ...rest }) => rest)(user);
    const token = jwt.sign({ user_id: safeUser.user_id, role: safeUser.role }, JWT_SECRET, { expiresIn: '2h' });

    console.log('Admin logged in:', safeUser.user_id);
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// POST /admin/members - create a new member and send activation token (admin only)
router.post('/admin/members', requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureInviteSchema();

    const { first_name, last_name, email } = req.body;
    if (!email || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return res.status(400).json({ error: 'Invalid email' });

    // Check if email exists
    const existing = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing && existing.length) {
      const u = existing[0];
      if (u.status && u.status.toLowerCase() === 'active') {
        return res.status(409).json({ error: 'Email already in use' });
      }
      // If there's a pending user, we can re-issue token (delete old tokens first)
      await db.query('DELETE FROM user_invitations WHERE user_id = ?', [u.user_id]);
      // update name
      await db.query('UPDATE users SET first_name = ?, last_name = ?, status = ? WHERE user_id = ?', [first_name, last_name, 'pending', u.user_id]);
      var userId = u.user_id;
    } else {
      // Create user with password_hash = NULL, role = 'user', status = 'pending'
      const result = await db.query('INSERT INTO users (email, first_name, last_name, role, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)', [email, first_name, last_name, 'user', null, 'pending']);
      var userId = result.insertId;
    }

    // Generate token and store hashed
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24h

    await db.query('INSERT INTO user_invitations (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [userId, tokenHash, expiresAt]);

    // Mock send email: log activation link
    const activationLink = `${process.env.FRONTEND_BASE || 'http://localhost:5173'}/activate-account?token=${encodeURIComponent(token)}`;
    console.log(`Invitation for ${email}: ${activationLink}`);

    res.status(201).json({ success: true, message: 'Invitation sent', activationLink });
  } catch (err) {
    console.error('Create member error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
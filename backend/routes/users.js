const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Users = require('../models/users');
const Membership = require('../models/membership');
const db = require('../db');

// Rate limiter for login endpoint (15 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// GET / - list users
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const rows = await Users.getAll(limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get user
router.get('/:id', async (req, res) => {
  try {
    const row = await Users.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /email/:email - get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const row = await Users.getByEmail(req.params.email);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create user
router.post('/', async (req, res) => {
  try {
    const created = await Users.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /login - authenticate user by email and password
const jwt = require('jsonwebtoken');
// Use the same default secret used by the middleware so tokens validate correctly
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_a_secure_secret';

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Validate input
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Missing email/name or password' });
    }
    if (typeof identifier !== 'string' || identifier.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid email or name' });
    }
    if (typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const user = await Users.getByIdentifier(identifier);
    if (!user) {
      console.warn('Login failed: user not found for identifier:', identifier);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Prevent login if account status is pending
    if (user.status && user.status.toLowerCase() === 'pending') {
      return res.status(403).json({ error: 'Account inactive. Please activate using the invitation link.' });
    }

    // Compare hashed password using bcrypt (use password_hash column)
    const passwordHash = user.password_hash || user.password; // fallback for legacy plaintext
    const isPasswordValid = await Users.comparePassword(password, passwordHash);

    if (!isPasswordValid) {
      console.warn('Login failed: invalid password for user_id:', user.user_id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password and password_hash before sending user object
    const { password: _, password_hash: __, ...safeUser } = user;

    // Prevent admin users from logging in via the public login endpoint
    if (safeUser.role === 'admin') {
      console.warn('Public login rejected: admin user attempted public login:', safeUser.user_id);
      return res.status(403).json({ error: 'Admin users must use the admin login page' });
    }

    // Sign JWT with user id and role
    let token;
    try {
      token = jwt.sign({ user_id: safeUser.user_id, role: safeUser.role }, JWT_SECRET, { expiresIn: '2h' });
    } catch (err) {
      console.error('Failed to sign JWT for user_id:', safeUser.user_id, err);
      return res.status(500).json({ error: 'Server error during login' });
    }

    console.log('User logged in:', safeUser.user_id, 'role:', safeUser.role);
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// PUT /:id - update user
router.put('/:id', async (req, res) => {
  try {
    const updated = await Users.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/extend - extend membership end date by provided years (defaults to 1)
router.put('/:id/extend', async (req, res) => {
  try {
    const years = parseInt(req.body.years, 10) || 1;
    // Use membership model to extend a user's membership (memberships table)
    const result = await Membership.extendMembership(req.params.id, years);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete user
router.delete('/:id', async (req, res) => {
  try {
    await Users.remove(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/profile-picture - save user's profile picture
router.put('/:id/profile-picture', async (req, res) => {
  try {
    const { profilePicture } = req.body;
    if (!profilePicture) {
      return res.status(400).json({ error: 'Missing profilePicture in request body' });
    }
    const updated = await Users.updateProfilePicture(req.params.id, profilePicture);
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id/profile-picture - remove user's profile picture (set to NULL)
router.delete('/:id/profile-picture', async (req, res) => {
  try {
    const updated = await Users.removeProfilePicture(req.params.id);
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/change-password - change user password
router.post('/:id/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing currentPassword or newPassword' });
    }
    if (typeof currentPassword !== 'string' || currentPassword.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid current password' });
    }
    if (typeof newPassword !== 'string' || newPassword.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const updated = await Users.changePassword(req.params.id, currentPassword, newPassword);
    // Remove password_hash before sending user object
    const { password: _, password_hash: __, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    // Check if error message is from our validation
    if (err.message.includes('not found') || err.message.includes('incorrect')) {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});


// GET /activate-account - redirect to frontend activation page (handles users who visit backend URL by mistake)
router.get('/activate-account', (req, res) => {
  try {
    const token = req.query.token;
    const frontend = process.env.FRONTEND_BASE || 'http://localhost:5173';
    if (token) {
      console.log('Redirecting activation GET to frontend with token...');
      return res.redirect(`${frontend}/activate-account?token=${encodeURIComponent(token)}`);
    }
    res.status(200).send('Activation endpoint - please use the frontend activation page to set your password.');
  } catch (err) {
    console.error('Activation redirect error:', err);
    res.status(500).send('Server error');
  }
});

// POST /activate-account - activate user using invitation token
router.post('/activate-account', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Missing token or password' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Normalize token (trim, decode) to avoid copy/paste whitespace or encoding issues
    const crypto = require('crypto');
    const bcrypt = require('bcrypt');
    const tokenClean = decodeURIComponent(String(token).trim());
    const tokenHash = crypto.createHash('sha256').update(tokenClean).digest('hex');

    // Debug logs in non-production to help diagnose activation failures
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Activation attempt: tokenClean='${tokenClean.slice(0, 16)}...' tokenHash='${tokenHash.slice(0,16)}...'`);
    }

    const rows = await db.query('SELECT * FROM user_invitations WHERE token_hash = ? AND expires_at > NOW()', [tokenHash]);
    if (!rows || !rows.length) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Activation failed: no matching invitation for tokenHash', tokenHash);
      }
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const inv = rows[0];
    // set password and activate
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password_hash = ?, status = ? WHERE user_id = ?', [hashedPassword, 'active', inv.user_id]);

    // Create initial membership and payment records for the newly activated user
    try {
      await Membership.createMembership(inv.user_id);
    } catch (mErr) {
      console.error('Failed to create membership after activation:', mErr && mErr.message ? mErr.message : mErr);
    }

    // delete invitation
    await db.query('DELETE FROM user_invitations WHERE invitation_id = ?', [inv.invitation_id]);

    res.json({ success: true, message: 'Account activated' });
  } catch (err) {
    console.error('Activation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

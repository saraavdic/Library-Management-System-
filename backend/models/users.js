const db = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Get all users
async function getAll(limit = 100) {
  return await db.query('SELECT * FROM users LIMIT ?', [limit]);
}

// Get user by ID
async function getById(id) {
  const rows = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  return rows[0];
}

// Get user by email
async function getByEmail(email) {
  const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

// Get user by identifier (username OR email OR first_name OR "first last")
async function getByIdentifier(identifier) {
  // First try a query that includes `username` (if the column exists).
  const sqlWithUsername = `
    SELECT * FROM users
    WHERE username = ?
      OR email = ?
      OR first_name = ?
      OR CONCAT(first_name, ' ', last_name) = ?
    LIMIT 1
  `;
  try {
    const rows = await db.query(sqlWithUsername, [identifier, identifier, identifier, identifier]);
    if (rows && rows.length) return rows[0];
  } catch (err) {
    // If the `username` column doesn't exist, fall back to the older lookup.
    if (!(err && err.code === 'ER_BAD_FIELD_ERROR')) {
      // If it's some other unexpected DB error, rethrow so caller can handle/log it.
      throw err;
    }
    // otherwise continue to fallback query
  }

  // Fallback for schemas without `username`
  const sql = `SELECT * FROM users WHERE email = ? OR first_name = ? OR CONCAT(first_name, ' ', last_name) = ? LIMIT 1`;
  const rows = await db.query(sql, [identifier, identifier, identifier]);
  return rows[0];
}

// Create a new user
async function create(user) {
  const { email, password, first_name, last_name, role } = user;
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await db.query(
    'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
    [email, hashedPassword, first_name || null, last_name || null, role || 'user']
  );
  return { user_id: result.insertId, ...user };
}

// Update a user
async function update(id, user) {
  const { email, password, first_name, last_name, role } = user;
  // Hash the password if provided
  const hashedPassword = password ? await bcrypt.hash(password, SALT_ROUNDS) : undefined;
  
  let query, params;
  if (hashedPassword) {
    query = 'UPDATE users SET email = ?, password_hash = ?, first_name = ?, last_name = ?, role = ? WHERE user_id = ?';
    params = [email, hashedPassword, first_name || null, last_name || null, role || 'user', id];
  } else {
    query = 'UPDATE users SET email = ?, first_name = ?, last_name = ?, role = ? WHERE user_id = ?';
    params = [email, first_name || null, last_name || null, role || 'user', id];
  }
  
  await db.query(query, params);
  return getById(id);
}

// Delete a user
async function remove(id) {
  // Also delete associated records
  await db.query('DELETE FROM notifications WHERE user_id = ?', [id]);
  await db.query('DELETE FROM borrow_records WHERE user_id = ?', [id]);
  await db.query('DELETE FROM users WHERE user_id = ?', [id]);
  return { deleted: true };
}

// Update profile picture
async function updateProfilePicture(id, profilePictureData) {
  await db.query('UPDATE users SET profile_picture = ? WHERE user_id = ?', [profilePictureData, id]);
  return getById(id);
}

// Remove profile picture (set to NULL)
async function removeProfilePicture(id) {
  await db.query('UPDATE users SET profile_picture = NULL WHERE user_id = ?', [id]);
  return getById(id);
}

// Change password: verify current password and update to new password
async function changePassword(id, currentPassword, newPassword) {
  const user = await getById(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const passwordHash = user.password_hash || user.password;
  const isValid = await comparePassword(currentPassword, passwordHash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password and update
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedPassword, id]);
  
  return getById(id);
}

// Get user with borrowed books
async function getWithBorrowedBooks(id) {
  const sql = `
    SELECT
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      COUNT(br.borrow_id) AS borrowed_count,
      GROUP_CONCAT(b.title SEPARATOR ', ') AS borrowed_books
    FROM users u
    LEFT JOIN borrow_records br ON u.user_id = br.user_id AND br.return_date IS NULL
    LEFT JOIN books b ON br.book_id = b.book_id
    WHERE u.user_id = ?
    GROUP BY u.user_id
  `;
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}

// Compare password: if stored hash looks like a bcrypt hash, use bcrypt.compare;
// otherwise fall back to plain equality for legacy rows (or return false if no hash).
function isLikelyBcryptHash(h) {
  return typeof h === 'string' && h.startsWith('$2');
}

async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  if (isLikelyBcryptHash(hash)) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (err) {
      return false;
    }
  }
  // Legacy plaintext fallback
  return password === hash;
}

module.exports = {
  getAll,
  getById,
  getByEmail,
  create,
  update,
  remove,
  getWithBorrowedBooks,
  updateProfilePicture,
  removeProfilePicture,
  changePassword,
  getByIdentifier,
  comparePassword,
};


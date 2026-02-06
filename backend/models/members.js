const db = require('../db');
const sqlFallback = require('../db/sqlFallback');
const membershipModel = require('./membership');

// Members are represented by the `users` table in the SQL dump.

async function getAll(limit = 100) {
  try {
    const sql = `
      SELECT
        u.user_id AS id,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS name,
        u.email,
        m.start_date AS joinDate,
        m.status
      FROM users u
      INNER JOIN memberships m ON u.user_id = m.user_id
      WHERE u.role != 'admin'
      ORDER BY m.start_date DESC
      LIMIT ?
    `;
    return await db.query(sql, [limit]);
  } catch (err) {
    console.error('Error getting members from DB, not using SQL dump fallback:', err);
    return [];
  }
}


async function getByIdFallback(id) {
  const rows = sqlFallback.getUsersFromSql();
  const r = rows.find(x => Number(x.id) === Number(id));
  if (!r) return null;
  return { id: r.id, name: r.name, email: r.email, joinDate: r.created_at, status: 'active' };
}

// Create user/member (password required by schema)
async function create(member) {
  try {
    const { email, password, first_name, last_name, role } = member;
    if (!email) throw new Error('Email is required');
    const bcrypt = require('bcrypt');
    // Hash password before storing; generate a random password if none provided
    const toHash = password || Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(toHash, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, first_name || null, last_name || null, role || 'user']
    );

    // Try to create an initial membership record; don't fail user creation if this errors
    try {
      await membershipModel.createMembership(result.insertId);
    } catch (mErr) {
      console.error('Failed to create membership for new user:', mErr && mErr.message ? mErr.message : mErr);
    }

    return { user_id: result.insertId, ...member };
  } catch (err) {
    console.error('Error creating member:', err && err.stack ? err.stack : err);
    throw err;
  }
}

async function update(id, member) {
  const { email, password, first_name, last_name, role } = member;
  const bcrypt = require('bcrypt');
  
  let query, params;
  if (password) {
    // Hash password if provided
    const hashedPassword = await bcrypt.hash(password, 10);
    query = 'UPDATE users SET email = ?, password_hash = ?, first_name = ?, last_name = ?, role = ? WHERE user_id = ?';
    params = [email, hashedPassword, first_name || null, last_name || null, role || 'user', id];
  } else {
    // Skip password update if not provided
    query = 'UPDATE users SET email = ?, first_name = ?, last_name = ?, role = ? WHERE user_id = ?';
    params = [email, first_name || null, last_name || null, role || 'user', id];
  }
  
  await db.query(query, params);
  return getById(id);
}

async function remove(id) {
  await db.query('DELETE FROM notifications WHERE user_id = ?', [id]);
  await db.query('DELETE FROM borrow_records WHERE user_id = ?', [id]);
  await db.query('DELETE FROM users WHERE user_id = ?', [id]);
  return { deleted: true };
}

// Check if member can be deactivated
async function canDeactivate(id) {
  // Check for unreturned books
  const borrowedBooks = await db.query(
    'SELECT COUNT(*) as count FROM borrow_records WHERE user_id = ? AND return_date IS NULL',
    [id]
  );
  if (borrowedBooks[0].count > 0) {
    return { allowed: false, reason: 'Member has unreturned books' };
  }

  // Check for unpaid fines
  const unpaidFines = await db.query(
    'SELECT COUNT(*) as count FROM fines WHERE member_name = (SELECT CONCAT(COALESCE(first_name, \'\'), \' \', COALESCE(last_name, \'\')) FROM users WHERE user_id = ?) AND status = \'not paid\'',
    [id]
  );
  if (unpaidFines[0].count > 0) {
    return { allowed: false, reason: 'Member has unpaid fines' };
  }

  return { allowed: true };
}

// Deactivate member (set status to inactive)
async function deactivate(id) {
  const check = await canDeactivate(id);
  if (!check.allowed) {
    throw new Error(check.reason);
  }
  
  await db.query('UPDATE users SET role = \'inactive\' WHERE user_id = ?', [id]);
  return getById(id);
}

// Get user with borrowed books (using borrow_records)
async function getWithBorrowedBooks(id) {
  const sql = `
    SELECT
      u.user_id AS id,
      CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS name,
      u.email,
      u.created_at AS joinDate,
      COALESCE(u.role, 'user') AS status,
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

// wrap getById to use fallback if needed
async function getById(id) {
  try {
    const sql = `
      SELECT
        user_id AS id,
        CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) AS name,
        email,
        created_at AS joinDate,
        'active' AS status
      FROM users
      WHERE user_id = ?
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  } catch (err) {
    return getByIdFallback(id);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getWithBorrowedBooks,
  canDeactivate,
  deactivate,
};

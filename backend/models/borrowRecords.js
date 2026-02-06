const db = require('../db');

// Helper to format any Date-like fields to YYYY-MM-DD strings
function formatDateField(d) {
  if (d == null) return null;
  try {
    if (d instanceof Date) {
      // local date parts to avoid UTC offset shifting the day
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    if (typeof d === 'string' && d.indexOf('T') !== -1) return d.split('T')[0];
    if (typeof d === 'string') return d.split('T')[0];
    return d.toString().split('T')[0];
  } catch (e) {
    return d;
  }
}

// Normalize rows: ensure borrow_date/due_date/return_date are YYYY-MM-DD strings
function normalizeRowDates(row) {
  if (!row) return row;
  return {
    ...row,
    borrow_date: formatDateField(row.borrow_date),
    due_date: formatDateField(row.due_date),
    return_date: formatDateField(row.return_date)
  };
}

// Get all borrow records
async function getAll(limit = 100) {
  const sql = `
    SELECT
      br.borrow_id,
      br.user_id,
      br.book_id,
      br.borrow_date,
      br.due_date,
      br.return_date,
      br.status,
      u.first_name,
      u.last_name,
      u.email,
      b.title AS book_title,
      GROUP_CONCAT(a.name SEPARATOR ', ') AS author
    FROM borrow_records br
    JOIN users u ON br.user_id = u.user_id
    JOIN books b ON br.book_id = b.book_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    GROUP BY br.borrow_id
    ORDER BY br.borrow_date DESC
    LIMIT ?
  `;
  const rows = await db.query(sql, [limit]);
  return rows.map(normalizeRowDates);
}

// Get borrow record by ID
async function getById(id) {
  const sql = `
    SELECT
      br.borrow_id,
      br.user_id,
      br.book_id,
      br.borrow_date,
      br.due_date,
      br.return_date,
      br.status,
      u.first_name,
      u.last_name,
      u.email,
      b.title AS book_title,
      GROUP_CONCAT(a.name SEPARATOR ', ') AS author
    FROM borrow_records br
    JOIN users u ON br.user_id = u.user_id
    JOIN books b ON br.book_id = b.book_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    WHERE br.borrow_id = ?
    GROUP BY br.borrow_id
  `;
  const rows = await db.query(sql, [id]);
  return normalizeRowDates(rows[0] || null);
}

// Helper: add days to a YYYY-MM-DD date string in a UTC-safe way
function addDaysToDateString(dateStr, days) {
  const [y, m, d] = (dateStr || '').split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().split('T')[0];
}

// Create a new borrow record
async function create(borrow) {
  const { user_id, book_id } = borrow;
  // Use the provided YYYY-MM-DD date string if present, otherwise use today's date (UTC)
  const borrow_date = borrow.borrow_date ? borrow.borrow_date : new Date().toISOString().split('T')[0];
  // set due_date to 14 days after borrow_date (server-enforced) in a UTC-safe way
  const due_date = borrow.due_date ? borrow.due_date : addDaysToDateString(borrow_date, 14);

  // Use a transaction to check and decrement available copies safely
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the book row for this transaction
    const [bookRows] = await conn.execute('SELECT total_copies FROM books WHERE book_id = ? FOR UPDATE', [book_id]);
    if (!bookRows || !bookRows.length) {
      throw Object.assign(new Error('Book not found'), { status: 404 });
    }
    const totalCopies = bookRows[0].total_copies || 0;
    // Cannot borrow if copies <= 0 or book is soft-deleted (copies = -1)
    if (totalCopies <= 0) {
      const msg = totalCopies === -1 ? 'Book is no longer available' : 'No copies available';
      throw Object.assign(new Error(msg), { status: 400 });
    }

    await conn.execute('UPDATE books SET total_copies = total_copies - 1 WHERE book_id = ?', [book_id]);

    const [result] = await conn.execute(
      'INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, book_id, borrow_date, due_date, 'borrowed']
    );

    await conn.commit();

    // return the created record with computed dates
    return getById(result.insertId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
} 

// Update a borrow record
async function update(id, borrow) {
  const { user_id, book_id, borrow_date, due_date, return_date, status } = borrow;
  await db.query(
    'UPDATE borrow_records SET user_id = ?, book_id = ?, borrow_date = ?, due_date = ?, return_date = ?, status = ? WHERE borrow_id = ?',
    [user_id, book_id, borrow_date, due_date, return_date || null, status || 'borrowed', id]
  );
  return getById(id);
}

// Return a book (mark as returned) and increment copies
async function returnBook(id, return_date) {
  const date = return_date || new Date().toISOString().split('T')[0];
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    // Ensure borrowing exists and is not already returned
    const [rows] = await conn.execute('SELECT book_id, return_date, user_id, due_date FROM borrow_records WHERE borrow_id = ? FOR UPDATE', [id]);
    if (!rows || !rows.length) throw Object.assign(new Error('Borrow record not found'), { status: 404 });
    const record = rows[0];
    if (record.return_date) throw Object.assign(new Error('Borrowing already returned'), { status: 400 });

    const bookId = record.book_id;
    const userId = record.user_id;

    // Check if the book is overdue (due_date before today)
    if (record.due_date) {
      const today = new Date().toISOString().split('T')[0];
      if (record.due_date < today) {
        // Check for unpaid fines for this user and book
        const [fineCountRows] = await conn.execute('SELECT COUNT(*) as cnt FROM fine WHERE user_id = ? AND book_id = ? AND paid_status <> ?', [userId, bookId, 'paid']);
        const unpaid = (fineCountRows && fineCountRows[0] && fineCountRows[0].cnt) ? fineCountRows[0].cnt : 0;
        if (unpaid > 0) {
          throw Object.assign(new Error('Cannot return: unpaid fines exist for this book'), { status: 400 });
        }
      }
    }

    await conn.execute('UPDATE borrow_records SET return_date = ?, status = ? WHERE borrow_id = ?', [date, 'returned', id]);
    await conn.execute('UPDATE books SET total_copies = total_copies + 1 WHERE book_id = ?', [bookId]);

    await conn.commit();

    return getById(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Delete a borrow record
async function remove(id) {
  await db.query('DELETE FROM borrow_records WHERE borrow_id = ?', [id]);
  return { deleted: true };
}

// Get active borrowings (not returned)
async function getActive(limit = 100) {
  const sql = `
    SELECT
      br.borrow_id,
      br.user_id,
      br.book_id,
      br.borrow_date,
      br.due_date,
      br.status,
      u.first_name,
      u.last_name,
      u.email,
      b.title AS book_title,
      GROUP_CONCAT(a.name SEPARATOR ', ') AS author,
      DATEDIFF(br.due_date, CURDATE()) AS days_left,
      CASE
        WHEN DATEDIFF(br.due_date, CURDATE()) < 0 THEN 'overdue'
        WHEN DATEDIFF(br.due_date, CURDATE()) < 3 THEN 'due_soon'
        ELSE 'active'
      END AS urgency
    FROM borrow_records br
    JOIN users u ON br.user_id = u.user_id
    JOIN books b ON br.book_id = b.book_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    WHERE br.return_date IS NULL
    GROUP BY br.borrow_id
    ORDER BY br.due_date ASC
    LIMIT ?
  `;
  const rows = await db.query(sql, [limit]);
  return rows.map(normalizeRowDates);
}

// Get borrowings for a specific user
async function getByUserId(user_id, limit = 100) {
  const sql = `
    SELECT
      br.borrow_id,
      br.user_id,
      br.book_id,
      br.borrow_date,
      br.due_date,
      br.return_date,
      br.status,
      b.title AS book_title,
      b.cover_image_url,
      GROUP_CONCAT(a.name SEPARATOR ', ') AS author,
      CASE WHEN br.return_date IS NULL THEN 'borrowed' ELSE 'returned' END AS current_status
    FROM borrow_records br
    JOIN books b ON br.book_id = b.book_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    WHERE br.user_id = ?
    GROUP BY br.borrow_id
    ORDER BY br.borrow_date DESC
    LIMIT ?
  `;
  const rows = await db.query(sql, [user_id, limit]);
  return rows.map(normalizeRowDates);
}

// Get overdue borrowings
async function getOverdue() {
  const sql = `
    SELECT
      br.borrow_id,
      br.user_id,
      br.book_id,
      br.borrow_date,
      br.due_date,
      u.first_name,
      u.last_name,
      u.email,
      b.title AS book_title,
      DATEDIFF(CURDATE(), br.due_date) AS days_overdue
    FROM borrow_records br
    JOIN users u ON br.user_id = u.user_id
    JOIN books b ON br.book_id = b.book_id
    WHERE br.return_date IS NULL AND br.due_date < CURDATE()
    ORDER BY br.due_date ASC
  `;
  return await db.query(sql);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  returnBook,
  remove,
  getActive,
  getByUserId,
  getOverdue,
};

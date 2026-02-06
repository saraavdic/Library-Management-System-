const db = require('../db');

// Get all authors
async function getAll(limit = 100) {
  return await db.query('SELECT * FROM authors LIMIT ?', [limit]);
}

// Get author by ID
async function getById(id) {
  const rows = await db.query('SELECT * FROM authors WHERE id = ?', [id]);
  return rows[0];
}

// Create a new author
async function create(author) {
  const { name } = author;
  const result = await db.query(
    'INSERT INTO authors (name) VALUES (?)',
    [name]
  );
  return { id: result.insertId, ...author };
}

// Update an author
async function update(id, author) {
  const { name } = author;
  await db.query(
    'UPDATE authors SET name = ? WHERE id = ?',
    [name, id]
  );
  return getById(id);
}

// Delete an author
async function remove(id) {
  // Also delete associated book_authors entries
  await db.query('DELETE FROM book_authors WHERE author_id = ?', [id]);
  await db.query('DELETE FROM authors WHERE id = ?', [id]);
  return { deleted: true };
}

// Get author with their books
async function getWithBooks(id) {
  const sql = `
    SELECT
      a.id,
      a.name,
      COUNT(b.id) AS book_count,
      GROUP_CONCAT(b.title SEPARATOR ', ') AS books
    FROM authors a
    LEFT JOIN book_authors ba ON a.id = ba.author_id
    LEFT JOIN books b ON ba.book_id = b.id
    WHERE a.id = ?
    GROUP BY a.id
  `;
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}

// Get all authors with their book counts
async function getAllWithBookCount() {
  const sql = `
    SELECT
      a.id,
      a.name,
      COUNT(b.id) AS book_count
    FROM authors a
    LEFT JOIN book_authors ba ON a.id = ba.author_id
    LEFT JOIN books b ON ba.book_id = b.id
    GROUP BY a.id
    ORDER BY a.name
  `;
  return await db.query(sql);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getWithBooks,
  getAllWithBookCount,
};

const db = require('../db');

// Get all book instances
async function getAll(limit = 100) {
  const sql = `
    SELECT
      bi.id,
      bi.book_id,
      bi.instance_number,
      bi.purchase_date,
      bi.condition,
      b.title,
      b.genre,
      COUNT(br.id) AS total_borrows,
      SUM(CASE WHEN br.return_date IS NULL THEN 1 ELSE 0 END) AS currently_borrowed
    FROM book_instances bi
    JOIN books b ON bi.book_id = b.id
    LEFT JOIN borrowings br ON bi.id = br.book_instance_id
    GROUP BY bi.id
    LIMIT ?
  `;
  return await db.query(sql, [limit]);
}

// Get book instance by ID
async function getById(id) {
  const sql = `
    SELECT
      bi.id,
      bi.book_id,
      bi.instance_number,
      bi.purchase_date,
      bi.condition,
      b.title,
      b.genre,
      COUNT(br.id) AS total_borrows,
      SUM(CASE WHEN br.return_date IS NULL THEN 1 ELSE 0 END) AS currently_borrowed
    FROM book_instances bi
    JOIN books b ON bi.book_id = b.id
    LEFT JOIN borrowings br ON bi.id = br.book_instance_id
    WHERE bi.id = ?
    GROUP BY bi.id
  `;
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}

// Create a new book instance
async function create(instance) {
  const { book_id, instance_number, purchase_date, condition } = instance;
  const result = await db.query(
    'INSERT INTO book_instances (book_id, instance_number, purchase_date, condition) VALUES (?, ?, ?, ?)',
    [
      book_id,
      instance_number || 1,
      purchase_date || new Date().toISOString().split('T')[0],
      condition || 'good'
    ]
  );
  return { id: result.insertId, ...instance };
}

// Update a book instance
async function update(id, instance) {
  const { book_id, instance_number, purchase_date, condition } = instance;
  await db.query(
    'UPDATE book_instances SET book_id = ?, instance_number = ?, purchase_date = ?, condition = ? WHERE id = ?',
    [book_id, instance_number, purchase_date, condition, id]
  );
  return getById(id);
}

// Delete a book instance
async function remove(id) {
  // Also delete associated borrowings
  await db.query('DELETE FROM borrowings WHERE book_instance_id = ?', [id]);
  await db.query('DELETE FROM book_instances WHERE id = ?', [id]);
  return { deleted: true };
}

// Get all instances of a specific book
async function getByBookId(book_id, limit = 100) {
  const sql = `
    SELECT
      bi.id,
      bi.book_id,
      bi.instance_number,
      bi.purchase_date,
      bi.condition,
      b.title,
      COUNT(br.id) AS total_borrows,
      SUM(CASE WHEN br.return_date IS NULL THEN 1 ELSE 0 END) AS currently_borrowed,
      CASE WHEN SUM(CASE WHEN br.return_date IS NULL THEN 1 ELSE 0 END) IS NULL THEN 'available' ELSE 'borrowed' END AS status
    FROM book_instances bi
    JOIN books b ON bi.book_id = b.id
    LEFT JOIN borrowings br ON bi.id = br.book_instance_id
    WHERE bi.book_id = ?
    GROUP BY bi.id
    ORDER BY bi.instance_number
    LIMIT ?
  `;
  return await db.query(sql, [book_id, limit]);
}

// Get available instances of a book
async function getAvailableByBookId(book_id) {
  const sql = `
    SELECT bi.* 
    FROM book_instances bi
    WHERE bi.book_id = ? 
    AND bi.id NOT IN (
      SELECT DISTINCT book_instance_id 
      FROM borrowings 
      WHERE return_date IS NULL
    )
    ORDER BY bi.instance_number
  `;
  return await db.query(sql, [book_id]);
}

// Get borrowing history for an instance
async function getBorrowingHistory(id, limit = 100) {
  const sql = `
    SELECT
      br.id,
      br.member_id,
      br.borrow_date,
      br.due_date,
      br.return_date,
      m.name AS member_name,
      DATEDIFF(br.return_date, br.borrow_date) AS days_borrowed
    FROM borrowings br
    JOIN members m ON br.member_id = m.id
    WHERE br.book_instance_id = ?
    ORDER BY br.borrow_date DESC
    LIMIT ?
  `;
  return await db.query(sql, [id, limit]);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getByBookId,
  getAvailableByBookId,
  getBorrowingHistory,
};

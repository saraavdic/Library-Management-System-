const db = require('../db');

// Get all borrowings with pagination
async function getAll(limit = 100) {
  const sql = `
    SELECT
      br.id,
      br.member_id,
      br.book_instance_id,
      br.borrow_date,
      br.due_date,
      br.return_date,
      m.name AS member_name,
      b.title AS book_title,
      bi.instance_number
    FROM borrowings br
    JOIN members m ON br.member_id = m.id
    JOIN book_instances bi ON br.book_instance_id = bi.id
    JOIN books b ON bi.book_id = b.id
    ORDER BY br.borrow_date DESC
    LIMIT ?
  `;
  return await db.query(sql, [limit]);
}

// Get borrowing by ID
async function getById(id) {
  const sql = `
    SELECT
      br.id,
      br.member_id,
      br.book_instance_id,
      br.borrow_date,
      br.due_date,
      br.return_date,
      m.name AS member_name,
      b.title AS book_title,
      bi.instance_number
    FROM borrowings br
    JOIN members m ON br.member_id = m.id
    JOIN book_instances bi ON br.book_instance_id = bi.id
    JOIN books b ON bi.book_id = b.id
    WHERE br.id = ?
  `;
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}

// Create a new borrowing record
async function create(borrowing) {
  const { member_id, book_instance_id, borrow_date, due_date } = borrowing;
  const result = await db.query(
    'INSERT INTO borrowings (member_id, book_instance_id, borrow_date, due_date) VALUES (?, ?, ?, ?)',
    [
      member_id,
      book_instance_id,
      borrow_date || new Date().toISOString().split('T')[0],
      due_date
    ]
  );
  return { id: result.insertId, ...borrowing };
}

// Update a borrowing record
async function update(id, borrowing) {
  const { member_id, book_instance_id, borrow_date, due_date, return_date } = borrowing;
  await db.query(
    'UPDATE borrowings SET member_id = ?, book_instance_id = ?, borrow_date = ?, due_date = ?, return_date = ? WHERE id = ?',
    [member_id, book_instance_id, borrow_date, due_date, return_date || null, id]
  );
  return getById(id);
}

// Return a book (mark as returned)
async function returnBook(id, return_date) {
  await db.query(
    'UPDATE borrowings SET return_date = ? WHERE id = ?',
    [return_date || new Date().toISOString().split('T')[0], id]
  );
  return getById(id);
}

// Delete a borrowing record
async function remove(id) {
  await db.query('DELETE FROM borrowings WHERE id = ?', [id]);
  return { deleted: true };
}

// Get active borrowings (not returned)
async function getActive(limit = 100) {
  const sql = `
    SELECT
      br.id,
      br.member_id,
      br.book_instance_id,
      br.borrow_date,
      br.due_date,
      m.name AS member_name,
      b.title AS book_title,
      bi.instance_number,
      DATEDIFF(br.due_date, CURDATE()) AS days_left,
      CASE
        WHEN DATEDIFF(br.due_date, CURDATE()) < 0 THEN 'overdue'
        WHEN DATEDIFF(br.due_date, CURDATE()) < 3 THEN 'due_soon'
        ELSE 'active'
      END AS status
    FROM borrowings br
    JOIN members m ON br.member_id = m.id
    JOIN book_instances bi ON br.book_instance_id = bi.id
    JOIN books b ON bi.book_id = b.id
    WHERE br.return_date IS NULL
    ORDER BY br.due_date ASC
    LIMIT ?
  `;
  return await db.query(sql, [limit]);
}

// Get borrowings for a specific member
async function getByMemberId(member_id, limit = 100) {
  const sql = `
    SELECT
      br.id,
      br.member_id,
      br.book_instance_id,
      br.borrow_date,
      br.due_date,
      br.return_date,
      b.title AS book_title,
      b.genre,
      bi.instance_number,
      CASE WHEN br.return_date IS NULL THEN 'borrowed' ELSE 'returned' END AS status
    FROM borrowings br
    JOIN book_instances bi ON br.book_instance_id = bi.id
    JOIN books b ON bi.book_id = b.id
    WHERE br.member_id = ?
    ORDER BY br.borrow_date DESC
    LIMIT ?
  `;
  return await db.query(sql, [member_id, limit]);
}

// Get overdue borrowings
async function getOverdue() {
  const sql = `
    SELECT
      br.id,
      br.member_id,
      br.book_instance_id,
      br.borrow_date,
      br.due_date,
      m.name AS member_name,
      m.email,
      b.title AS book_title,
      DATEDIFF(CURDATE(), br.due_date) AS days_overdue
    FROM borrowings br
    JOIN members m ON br.member_id = m.id
    JOIN book_instances bi ON br.book_instance_id = bi.id
    JOIN books b ON bi.book_id = b.id
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
  getByMemberId,
  getOverdue,
};

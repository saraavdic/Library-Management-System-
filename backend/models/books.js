const db = require('../db');

// Get all books with pagination (excluding soft-deleted books with total_copies = -1)
async function getAll(limit = 100) {
  const sql = `
    SELECT
      b.book_id,
      b.title,
      b.description,
      b.published_year,
      b.isbn,
      b.category_id,
      b.publisher_id,
      b.total_copies,
      b.cover_image_url,
      c.category_name,
      p.publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    WHERE b.total_copies != -1
    LIMIT ?
  `;
  return await db.query(sql, [limit]);
}

// Get book by ID
async function getById(id) {
  const sql = `
    SELECT
      b.book_id,
      b.title,
      b.description,
      b.published_year,
      b.isbn,
      b.category_id,
      b.publisher_id,
      b.total_copies,
      b.cover_image_url,
      c.category_name,
      p.publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    WHERE b.book_id = ?
  `;
  const rows = await db.query(sql, [id]);
  return rows[0];
}

// Create a new book (creates author if needed and links in book_authors)
async function create(book) {
  const { title, description, published_year, isbn, category_id, publisher_id, total_copies, cover_image_url, author, publisher } = book;

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log('Creating book:', { title, author, isbn, category_id, cover_image_url });

    // Resolve publisher: if publisher name provided but no publisher_id, find or create publisher
    let resolvedPublisherId = publisher_id || null;
    if ((!resolvedPublisherId || resolvedPublisherId === null) && publisher && publisher.toString().trim()) {
      const publisherName = publisher.toString().trim();
      const [pubRows] = await conn.execute('SELECT publisher_id FROM publishers WHERE LOWER(publisher_name) = LOWER(?) LIMIT 1', [publisherName]);
      if (pubRows && pubRows.length > 0) {
        resolvedPublisherId = pubRows[0].publisher_id;
        console.log('Found existing publisher id', resolvedPublisherId);
      } else {
        const [pResult] = await conn.execute('INSERT INTO publishers (publisher_name) VALUES (?)', [publisherName]);
        resolvedPublisherId = pResult.insertId;
        console.log('Created new publisher id', resolvedPublisherId);
      }
    }

    const [result] = await conn.execute(
      'INSERT INTO books (title, description, published_year, isbn, category_id, publisher_id, total_copies, cover_image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, published_year || null, isbn || null, category_id || null, resolvedPublisherId || null, total_copies || 1, cover_image_url || null]
    );

    const bookId = result.insertId;

    // If author provided, find or create and link
    if (author && author.toString().trim()) {
      const authorName = author.toString().trim();

      const [rows] = await conn.execute('SELECT author_id FROM authors WHERE name = ? LIMIT 1', [authorName]);
      let authorId;
      if (rows && rows.length > 0) {
        authorId = rows[0].author_id;
        console.log('Found existing author id', authorId);
      } else {
        const [aResult] = await conn.execute('INSERT INTO authors (name) VALUES (?)', [authorName]);
        authorId = aResult.insertId;
        console.log('Created new author id', authorId);
      }

      await conn.execute('INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)', [bookId, authorId]);
      console.log('Linked book', bookId, 'with author', authorId);
    }

    await conn.commit();
    // Return the created book row to the caller
    const created = await getById(bookId);
    return created;
  } catch (err) {
    await conn.rollback();
    console.error('Error creating book (transaction rolled back):', err);
    throw err;
  } finally {
    conn.release();
  }
}

// Update an existing book
async function update(id, book) {
  const { title, description, published_year, isbn, category_id, publisher_id, total_copies, cover_image_url } = book;
  await db.query(
    'UPDATE books SET title = ?, description = ?, published_year = ?, isbn = ?, category_id = ?, publisher_id = ?, total_copies = ?, cover_image_url = ? WHERE book_id = ?',
    [title, description || null, published_year || null, isbn || null, category_id || null, publisher_id || null, total_copies || 1, cover_image_url || null, id]
  );
  return getById(id);
}

// Check if a book has active borrows (status = 'borrowed')
async function hasActiveBorrows(id) {
  const result = await db.query('SELECT COUNT(*) as count FROM borrow_records WHERE book_id = ? AND status = ?', [id, 'borrowed']);
  return result[0] && result[0].count > 0;
}

// Soft delete a book: set total_copies to -1 (book is hidden and cannot be borrowed)
async function remove(id) {
  // Check for active borrows
  const active = await hasActiveBorrows(id);
  if (active) {
    const err = new Error('Cannot delete book with active borrows');
    err.status = 400;
    throw err;
  }
  // Soft delete: set total_copies to -1
  await db.query('UPDATE books SET total_copies = -1 WHERE book_id = ?', [id]);
  return { deleted: true, softDelete: true };
}

// Get books with author information
async function getWithAuthors(id) {
  const sql = `
    SELECT
      b.book_id,
      b.title,
      b.description,
      b.published_year,
      b.isbn,
      b.total_copies,
      b.cover_image_url,
      c.category_name,
      p.publisher_name,
      GROUP_CONCAT(a.name SEPARATOR ', ') AS authors
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    WHERE b.book_id = ?
    GROUP BY b.book_id
  `;
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getWithAuthors,
  hasActiveBorrows,
};

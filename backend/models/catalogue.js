const db = require('../db');
const sqlFallback = require('../db/sqlFallback');

// Get all books with author information for display
async function getBooksWithAuthors(limit = 100) {
  try {
    const sql = `
      SELECT
        b.book_id AS id,
        b.title,
        b.description,
        b.published_year AS year,
        b.cover_image_url AS cover,
        b.total_copies,
        c.category_name AS genre,
        p.publisher_name,
        GROUP_CONCAT(a.name SEPARATOR ', ') AS author
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      GROUP BY b.book_id
      ORDER BY b.title
      LIMIT ?
    `;
    const rows = await db.query(sql, [limit]);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      author: r.author || '',
      genre: r.genre || '',
      year: r.year || '',
      cover: r.cover || 'https://placekitten.com/200/300',
      description: r.description || '',
      total_copies: r.total_copies,
      publisher: r.publisher_name || '',
    }));
  } catch (err) {
    // fallback to parsing SQL dump
    const rows = sqlFallback.getBooksFromSql();
    return rows.slice(0, limit).map(r => ({ id: r.id, title: r.title, author: '', genre: '', year: r.published_year, cover: r.cover || 'https://placekitten.com/200/300', description: r.description || '', total_copies: r.total_copies || 1, publisher: '' }));
  }
}

// Get a single book with author information
async function getBookById(id) {
  const sql = `
    SELECT
      b.book_id,
      b.title,
      b.description,
      b.published_year AS year,
      b.cover_image_url AS cover,
      b.total_copies,
      b.isbn,
      c.category_name AS genre,
      p.publisher_name,
      GROUP_CONCAT(a.name SEPARATOR ', ') AS author
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    WHERE b.book_id = ?
    GROUP BY b.book_id
  `;
  const rows = await db.query(sql, [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.book_id,
    title: r.title,
    author: r.author || '',
    genre: r.genre || '',
    year: r.year || '',
    cover: r.cover || 'https://placekitten.com/200/300',
    description: r.description || '',
    total_copies: r.total_copies,
    isbn: r.isbn || '',
    publisher: r.publisher_name || '',
  };
}

// Get books by genre/category filter
async function getByGenre(categoryId, limit = 100) {
  const sql = `
    SELECT
      b.book_id AS id,
      b.title,
      b.description,
      b.published_year AS year,
      b.cover_image_url AS cover,
      b.total_copies,
      c.category_name AS genre,
      p.publisher_name,
      GROUP_CONCAT(a.name SEPARATOR ', ') AS author
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    WHERE b.category_id = ?
    GROUP BY b.book_id
    ORDER BY b.title
    LIMIT ?
  `;
  const rows = await db.query(sql, [categoryId, limit]);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    author: r.author || '',
    genre: r.genre || '',
    year: r.year || '',
    cover: r.cover || 'https://placekitten.com/200/300',
    description: r.description || '',
    total_copies: r.total_copies,
    publisher: r.publisher_name || '',
  }));
}

// Search books by title or author
async function search(query, limit = 100) {
  const searchTerm = `%${query}%`;
  const sql = `
    SELECT DISTINCT
      b.book_id AS id,
      b.title,
      b.description,
      b.published_year AS year,
      b.cover_image_url AS cover,
      b.total_copies,
      c.category_name AS genre,
      p.publisher_name,
      GROUP_CONCAT(a.name SEPARATOR ', ') AS author
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    WHERE b.title LIKE ? OR a.name LIKE ?
    GROUP BY b.book_id
    ORDER BY b.title
    LIMIT ?
  `;
  const rows = await db.query(sql, [searchTerm, searchTerm, limit]);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    author: r.author || '',
    genre: r.genre || '',
    year: r.year || '',
    cover: r.cover || 'https://placekitten.com/200/300',
    description: r.description || '',
    total_copies: r.total_copies,
    publisher: r.publisher_name || '',
  }));
}

// Get all categories
async function getCategories() {
  const sql = `SELECT category_id, category_name FROM categories ORDER BY category_name`;
  return await db.query(sql);
}

module.exports = {
  getBooksWithAuthors,
  getBookById,
  getByGenre,
  search,
  getCategories,
};

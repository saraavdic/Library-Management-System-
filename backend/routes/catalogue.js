const express = require('express');
const router = express.Router();
const Catalogue = require('../models/catalogue');

// GET /api/catalogue/books?limit=100
router.get('/books', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const rows = await Catalogue.getBooksWithAuthors(limit);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/catalogue/books/:id
router.get('/books/:id', async (req, res) => {
  try {
    const book = await Catalogue.getBookById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/catalogue/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Catalogue.getCategories();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/catalogue/search?q=query
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit, 10) || 100;
    const results = await Catalogue.search(query, limit);
    res.json(results);
  } catch (err) {
    console.error('Error searching books:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

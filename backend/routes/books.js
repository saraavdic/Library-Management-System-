const express = require('express');
const router = express.Router();
const Books = require('../models/books');
const db = require('../db');

// POST /ai-suggest - suggest book details using local Llama model
router.post('/ai-suggest', async (req, res) => {
  try {
    const { title, author } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Missing title or author' });
    }

    // Fetch all available categories from database
    const categories = await db.query('SELECT category_id, category_name FROM categories ORDER BY category_name');
    const categoryList = categories.map(c => c.category_name).join(', ');

    const prompt = `You are a knowledgeable library assistant with detailed knowledge of books. Given a real book title and author, provide accurate information in JSON format:
{
  "description": "Write a concise 2-3 sentence description of the book's plot, themes, and significance. Include what makes this book notable.",
  "publisher": "The actual/most likely publisher name for this specific book",
  "coverUrl": "A realistic Amazon or Goodreads book cover image URL for this exact book (must be a real image URL or empty string)",
  "isbn": "A valid ISBN-13 number for this book if it's real (format: 978-0-XXXXXXXXX-X or similar) or empty string",
  "published_year": "The year the book was published (e.g., 1997) or empty string if unknown",
  "genre": "ONE of these categories that best fits: ${categoryList}"
}

Book: "${title}" by ${author}

REQUIREMENTS:
- Return ONLY valid JSON (no commentary)
- Always include these keys: description, publisher, coverUrl, isbn, published_year, genre
- description must be 2 or 3 sentences
- genre must be exactly one of: ${categoryList}
`;

    // Call local Ollama Llama model
    let ollamaResponse;
    try {
      ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:1b',
          prompt: prompt,
          stream: false
        }),
        timeout: 60000
      });
    } catch (fetchErr) {
      console.error('Failed to connect to Ollama:', fetchErr.message);
      // Graceful fallback: return empty suggestion so frontend can continue
      return res.json({
        description: '',
        publisher: '',
        coverUrl: '',
        isbn: '',
        published_year: '',
        genre: '',
        genreId: null
      });
    }

    if (!ollamaResponse.ok) {
      console.error('Ollama request failed:', ollamaResponse.status, ollamaResponse.statusText);
      // Graceful fallback: return empty suggestion
      return res.json({
        description: '',
        publisher: '',
        coverUrl: '',
        isbn: '',
        published_year: '',
        genre: '',
        genreId: null
      });
    }

    const ollamaData = await ollamaResponse.json();
    const responseText = ollamaData.response || '';

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
      }
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
      console.log('AI raw parsed result:', result);
    } catch (parseErr) {
      console.warn('Failed to parse AI response:', parseErr, 'response text:', responseText);
      // Graceful fallback: return empty suggestion so UI fields remain unchanged
      return res.json({
        description: '',
        publisher: '',
        coverUrl: '',
        isbn: '',
        published_year: '',
        genre: '',
        genreId: null
      });
    }

    // Normalize and validate fields
    const rawDescription = (result.description || '').trim();
    // Keep first 3 sentences, prefer 2-3 sentences total
    const sentences = rawDescription.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    let description = rawDescription;
    if (sentences.length > 3) {
      description = sentences.slice(0, 3).join(' ');
    } else if (sentences.length >= 2 && sentences.length <= 3) {
      description = sentences.slice(0, sentences.length).join(' ');
    } else if (sentences.length === 1) {
      // try to split longer sentence into two by comma (best-effort)
      const parts = sentences[0].split(',').map(p => p.trim()).filter(p => p.length > 0);
      description = parts.length >= 2 ? parts.slice(0, 2).join(', ') : sentences[0];
    }

    const publisher = (result.publisher || '').trim() || '';
    const coverUrl = (result.coverUrl || '').trim() || '';
    const isbn = (result.isbn || '').trim() || '';
    const published_year = (result.published_year || '').toString().trim() || '';

    // Find the category ID that matches the genre returned by AI
    let genreId = null;
    const genre = (result.genre || '').trim();
    if (genre) {
      const matchedCategory = categories.find(c => c.category_name.toLowerCase() === genre.toLowerCase());
      genreId = matchedCategory ? matchedCategory.category_id : null;
    }

    res.json({
      description,
      publisher,
      coverUrl,
      isbn,
      published_year,
      genre,
      genreId
    });
  } catch (err) {
    console.error('AI suggestion error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /categories - list all categories for filtering
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT category_id, category_name FROM categories ORDER BY category_name');
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET / - list books
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const rows = await Books.getAll(limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get book
router.get('/:id', async (req, res) => {
  try {
    const row = await Books.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create book
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/books payload:', req.body);
    // If frontend provided a genre string but not category_id, try to resolve it
    if ((!req.body.category_id || req.body.category_id === null) && req.body.genre) {
      try {
        const catRows = await db.query('SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER(?) LIMIT 1', [req.body.genre]);
        if (catRows && catRows.length > 0) {
          req.body.category_id = catRows[0].category_id;
          console.log('Resolved genre to category_id', req.body.category_id);
        }
      } catch (e) {
        console.warn('Failed to resolve genre to category:', e.message);
      }
    }

    const created = await Books.create(req.body);
    console.log('Books.create returned:', created);
    if (!created || !created.book_id) {
      // creation did not return the expected record
      console.warn('Book creation did not return created record');
      return res.status(500).json({ error: 'Book creation failed (no record returned)' });
    }
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update book
router.put('/:id', async (req, res) => {
  try {
    const updated = await Books.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - soft delete book (set total_copies to -1; cannot delete if book has active borrows)
router.delete('/:id', async (req, res) => {
  try {
    await Books.remove(req.params.id);
    res.json({ deleted: true, message: 'Book hidden from catalogue' });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

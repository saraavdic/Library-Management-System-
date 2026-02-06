const express = require('express');
const router = express.Router();
const BorrowRecords = require('../models/borrowRecords');

// GET / - list borrow records
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const rows = await BorrowRecords.getAll(limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get borrow record
router.get('/:id', async (req, res) => {
  try {
    const row = await BorrowRecords.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /user/:userId - get borrow records for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const rows = await BorrowRecords.getByUserId(req.params.userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create borrow record
router.post('/', async (req, res) => {
  try {
    const created = await BorrowRecords.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update borrow record
router.put('/:id', async (req, res) => {
  try {
    const updated = await BorrowRecords.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/return - return a book
router.put('/:id/return', async (req, res) => {
  try {
    const returnDate = req.body && Object.prototype.hasOwnProperty.call(req.body, 'return_date') ? req.body.return_date : undefined;
    const returned = await BorrowRecords.returnBook(req.params.id, returnDate);
    res.json(returned);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete borrow record
router.delete('/:id', async (req, res) => {
  try {
    await BorrowRecords.remove(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

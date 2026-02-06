const express = require('express');
const router = express.Router();
const Members = require('../models/members');

// GET / - list members
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const rows = await Members.getAll(limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get member
router.get('/:id', async (req, res) => {
  try {
    const row = await Members.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create member
router.post('/', async (req, res) => {
  try {
    const created = await Members.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update member
router.put('/:id', async (req, res) => {
  try {
    const updated = await Members.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete member
router.delete('/:id', async (req, res) => {
  try {
    await Members.remove(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/deactivate - deactivate member (check constraints first)
router.put('/:id/deactivate', async (req, res) => {
  try {
    const updated = await Members.deactivate(req.params.id);
    res.json({ success: true, member: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

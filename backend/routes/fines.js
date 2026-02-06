const express = require('express');
const router = express.Router();
const Fines = require('../models/fines');
const Membership = require('../models/membership');

// GET /api/fines - list fines
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    // Get fines and membership payments and merge them into a single payments list
    const fines = await Fines.getAll(limit);
    const membershipPayments = await Membership.getAllMembershipPayments(limit);

    const mappedFines = fines.map(f => ({
      id: f.id || f.payment_id,
      member_name: f.member_name,
      amount: f.amount,
      type: 'fine',
      status: f.paid_status || (f.status === 'paid' ? 'paid' : 'not paid'),
      date: f.fine_created_date || f.fine_paid_date || null
    }));

    const mappedMemberships = membershipPayments.map(mp => ({
      id: mp.payment_id,
      member_name: `${mp.first_name || ''} ${mp.last_name || ''}`.trim(),
      amount: mp.amount,
      type: 'membership',
      status: 'paid',
      date: mp.payment_date || mp.period_start
    }));

    // Combine and sort by date (newest first)
    const combined = mappedFines.concat(mappedMemberships).sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });

    if (typeof limit === 'number') {
      res.json(combined.slice(0, limit));
    } else {
      res.json(combined);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fines/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await Fines.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fines/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const rows = await Fines.getByMemberId(req.params.userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fines
router.post('/', async (req, res) => {
  try {
    const created = await Fines.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/fines/:id - update fine
router.put('/:id', async (req, res) => {
  try {
    const updated = await Fines.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/fines/:id/pay - mark as paid
router.put('/:id/pay', async (req, res) => {
  try {
    console.log(`Marking fine ${req.params.id} as paid...`);
    const fine = await Fines.markAsPaid(req.params.id);
    console.log(`Fine ${req.params.id} marked as paid:`, fine);
    res.json(fine);
  } catch (err) {
    console.error(`Error marking fine as paid:`, err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/fines/:id
router.delete('/:id', async (req, res) => {
  try {
    await Fines.remove(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fines/sync-overdue - sync overdue borrow records to fines
router.post('/sync-overdue', async (req, res) => {
  try {
    console.log('Syncing overdue books to fines...');
    const result = await Fines.createFinesForOverdueBooks();
    res.json(result);
  } catch (err) {
    console.error('Error in sync-overdue endpoint:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

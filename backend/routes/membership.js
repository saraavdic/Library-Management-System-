const express = require('express');
const router = express.Router();
const Membership = require('../models/membership');

// GET /api/membership/:userId - get membership info for user
router.get('/:userId', async (req, res) => {
  try {
    const membership = await Membership.getMembershipByUserId(req.params.userId);
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/membership/:userId/payments - get all payments for user
router.get('/:userId/payments', async (req, res) => {
  try {
    const payments = await Membership.getMembershipPayments(req.params.userId);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/membership/:userId/extend - extend membership by 1 year
router.post('/:userId/extend', async (req, res) => {
  try {
    const { years } = req.body;
    const extensionYears = years || 1;
    const result = await Membership.extendMembership(req.params.userId, extensionYears);
    // Fetch updated membership data
    const updatedMembership = await Membership.getMembershipByUserId(req.params.userId);
    res.json({ ...result, membership: updatedMembership });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/membership/:userId/pay - pay for expired membership
router.post('/:userId/pay', async (req, res) => {
  try {
    const { years } = req.body;
    const extensionYears = years || 1;
    const result = await Membership.payExpiredMembership(req.params.userId, extensionYears);
    // Fetch updated membership data
    const updatedMembership = await Membership.getMembershipByUserId(req.params.userId);
    res.json({ ...result, membership: updatedMembership });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/membership/:userId/sync-status - update membership status
router.post('/:userId/sync-status', async (req, res) => {
  try {
    const result = await Membership.updateMembershipStatus(req.params.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

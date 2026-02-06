const express = require('express');
const router = express.Router();
const Announcements = require('../models/announcements');

// GET all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcements.getAll();
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// POST create new announcement
router.post('/', async (req, res) => {
  try {
    const { title, category, message } = req.body;
    
    if (!title || !category || !message) {
      return res.status(400).json({ error: 'Title, category, and message are required' });
    }

    const announcement = await Announcements.create(title, category, message);
    res.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// GET announcement by ID
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcements.getById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// DELETE announcement by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Announcements.delete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;

const express = require('express');
const messagesModel = require('../models/messages');

const router = express.Router();

// POST: Create a new message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, source } = req.body;
    
    console.log('POST /api/messages received:', { name, email, subject, message, source });
    
    if (!name || !email || !message || !source) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Calling messagesModel.create with:', name, email, subject, message, source);
    const result = await messagesModel.create(name, email, subject || '', message, source);
    console.log('Message created successfully:', result);
    
    res.status(201).json({ success: true, message: 'Message saved successfully' });
  } catch (err) {
    console.error('Error creating message:', err);
    console.error('Error details:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to save message', details: err.message });
  }
});

// GET: All messages
router.get('/', async (req, res) => {
  try {
    const messages = await messagesModel.getAll();
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET: Messages by source (user or website)
router.get('/source/:source', async (req, res) => {
  try {
    const { source } = req.params;
    if (!['user', 'website'].includes(source)) {
      return res.status(400).json({ error: 'Invalid source' });
    }
    const messages = await messagesModel.getBySource(source);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// DELETE: Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    await messagesModel.deleteMessage(messageId);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;

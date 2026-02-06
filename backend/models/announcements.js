const db = require('../db');

const Announcements = {
  // Get all announcements within last 14 days, ordered by date_published desc (newest first)
  async getAll() {
    try {
      const query = `
        SELECT id, title, category, message, date_published 
        FROM announcements 
        WHERE date_published IS NOT NULL 
        AND DATE(date_published) >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
        ORDER BY date_published DESC
      `;
      const rows = await db.query(query);
      return rows;
    } catch (err) {
      console.error('Error fetching announcements:', err);
      throw err;
    }
  },

  // Create a new announcement with today's date
  async create(title, category, message) {
    try {
      const query = 'INSERT INTO announcements (title, category, message, date_published) VALUES (?, ?, ?, CURDATE())';
      const result = await db.query(query, [title, category, message]);
      console.log('Announcement created:', result.insertId);
      return { id: result.insertId, title, category, message, date_published: new Date().toISOString().split('T')[0] };
    } catch (err) {
      console.error('Error creating announcement:', err);
      throw err;
    }
  },

  // Get announcement by ID
  async getById(id) {
    try {
      const query = 'SELECT id, title, category, message, date_published FROM announcements WHERE id = ?';
      const rows = await db.query(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('Error fetching announcement:', err);
      throw err;
    }
  },

  // Delete announcement by ID
  async delete(id) {
    try {
      const query = 'DELETE FROM announcements WHERE id = ?';
      const result = await db.query(query, [id]);
      console.log('Announcement deleted:', id);
      return result;
    } catch (err) {
      console.error('Error deleting announcement:', err);
      throw err;
    }
  },
};

module.exports = Announcements;

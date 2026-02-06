const db = require('../db');

async function create(name, email, subject, message, source) {
  const sql = `
    INSERT INTO messages (name, email, subject, message, source, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  console.log('Executing SQL:', sql);
  console.log('With values:', [name, email, subject, message, source]);
  
  try {
    const result = await db.query(sql, [name, email, subject, message, source]);
    console.log('Insert result:', result);
    return result;
  } catch (err) {
    console.error('Database error in create:', err);
    throw err;
  }
}

async function getAll() {
  const sql = `
    SELECT message_id, name, email, subject, message, source, created_at
    FROM messages
    ORDER BY created_at DESC
  `;
  const rows = await db.query(sql, []);
  return rows;
}

async function getBySource(source) {
  const sql = `
    SELECT message_id, name, email, subject, message, source, created_at
    FROM messages
    WHERE source = ?
    ORDER BY created_at DESC
  `;
  const rows = await db.query(sql, [source]);
  return rows;
}

async function deleteMessage(messageId) {
  const sql = `DELETE FROM messages WHERE message_id = ?`;
  const result = await db.query(sql, [messageId]);
  return result;
}

module.exports = {
  create,
  getAll,
  getBySource,
  deleteMessage
};

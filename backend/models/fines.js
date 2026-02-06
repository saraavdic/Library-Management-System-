const db = require('../db');

// Get all fines
async function getAll(limit) {
  try {
    let sql = `
      SELECT
        f.payment_id as id,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        b.title as book_title,
        COALESCE(f.fine_amount, 5.00) as amount,
        'fine' as type,
        CASE WHEN f.paid_status = 'paid' THEN 'paid' ELSE 'not paid' END as status,
        f.fine_created_date,
        f.fine_paid_date,
        f.paid_status,
        f.user_id,
        f.book_id
      FROM fine f
      JOIN users u ON f.user_id = u.user_id
      JOIN books b ON f.book_id = b.book_id
      ORDER BY f.fine_created_date DESC
    `;

    if (typeof limit === 'number') {
      sql += '\n      LIMIT ?\n    ';
      return await db.query(sql, [limit]);
    }

    // no limit provided -> return all
    return await db.query(sql);
  } catch (err) {
    console.error('Error getting all fines:', err);
    return [];
  }
}

// Get fine by ID
async function getById(id) {
  try {
    const sql = `
      SELECT
        f.payment_id as id,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        b.title as book_title,
        COALESCE(f.fine_amount, 5.00) as amount,
        'fine' as type,
        CASE WHEN f.paid_status = 'paid' THEN 'paid' ELSE 'not paid' END as status,
        f.fine_created_date,
        f.fine_paid_date,
        f.paid_status,
        f.user_id,
        f.book_id
      FROM fine f
      JOIN users u ON f.user_id = u.user_id
      JOIN books b ON f.book_id = b.book_id
      WHERE f.payment_id = ?
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error getting fine by ID:', err);
    return null;
  }
}

// Create a new fine
async function create(fine) {
  try {
    const { user_id, book_id } = fine;
    const fine_created_date = new Date().toISOString().split('T')[0];
    
    const result = await db.query(
      'INSERT INTO fine (user_id, book_id, fine_created_date, paid_status) VALUES (?, ?, ?, ?)',
      [user_id, book_id, fine_created_date, 'not paid']
    );
    return getById(result.insertId);
  } catch (err) {
    console.error('Error creating fine:', err);
    throw err;
  }
}

// Update a fine
async function update(id, fine) {
  try {
    const { user_id, book_id, paid_status } = fine;
    await db.query(
      'UPDATE fine SET user_id = ?, book_id = ?, paid_status = ? WHERE payment_id = ?',
      [user_id, book_id, paid_status || 'not paid', id]
    );
    return getById(id);
  } catch (err) {
    console.error('Error updating fine:', err);
    throw err;
  }
}

// Mark fine as paid
async function markAsPaid(id, status) {
  try {
    const paid_status = status || 'paid';
    const fine_paid_date = new Date().toISOString().split('T')[0];
    
    const result = await db.query(
      'UPDATE fine SET paid_status = ?, fine_paid_date = ? WHERE payment_id = ?',
      [paid_status, fine_paid_date, id]
    );
    console.log(`Fine ${id} marked as ${paid_status}`);
  } catch (err) {
    console.error(`Failed to mark fine ${id} as paid:`, err);
    throw err;
  }
  return getById(id);
}

// Delete a fine
async function remove(id) {
  try {
    await db.query('DELETE FROM fine WHERE payment_id = ?', [id]);
    return { deleted: true };
  } catch (err) {
    console.error('Error deleting fine:', err);
    throw err;
  }
}

// Get unpaid fines
async function getUnpaid(limit = 100) {
  try {
    const sql = `
      SELECT
        f.payment_id as id,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        b.title as book_title,
        COALESCE(f.fine_amount, 5.00) as amount,
        'fine' as type,
        CASE WHEN f.paid_status = 'paid' THEN 'paid' ELSE 'not paid' END as status,
        f.fine_created_date,
        f.fine_paid_date,
        f.paid_status,
        f.user_id,
        f.book_id
      FROM fine f
      JOIN users u ON f.user_id = u.user_id
      JOIN books b ON f.book_id = b.book_id
      WHERE f.paid_status = 'not paid'
      ORDER BY f.fine_created_date DESC
      LIMIT ?
    `;
    return await db.query(sql, [limit]);
  } catch (err) {
    console.error('Error getting unpaid fines:', err);
    return [];
  }
}

// Get fines for a specific user
async function getByMemberId(user_id, limit = 100) {
  try {
    const sql = `
      SELECT
        f.payment_id as id,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        b.title as book_title,
        COALESCE(f.fine_amount, 5.00) as amount,
        'fine' as type,
        CASE WHEN f.paid_status = 'paid' THEN 'paid' ELSE 'not paid' END as status,
        f.fine_created_date,
        f.fine_paid_date,
        f.paid_status,
        f.user_id,
        f.book_id
      FROM fine f
      JOIN users u ON f.user_id = u.user_id
      JOIN books b ON f.book_id = b.book_id
      WHERE f.user_id = ?
      ORDER BY f.fine_created_date DESC
      LIMIT ?
    `;
    return await db.query(sql, [user_id, limit]);
  } catch (err) {
    console.error('Error getting fines by member ID:', err);
    return [];
  }
}

// Get total fines amount for a user
async function getTotalByMemberId(user_id) {
  try {
    const sql = `
      SELECT
        SUM(CASE WHEN f.paid_status = 'not paid' THEN COALESCE(f.fine_amount, 5.00) ELSE 0 END) AS total_unpaid,
        SUM(COALESCE(f.fine_amount, 5.00)) AS total_all
      FROM fine f
      WHERE f.user_id = ?
    `;
    const rows = await db.query(sql, [user_id]);
    return rows[0] || { total_unpaid: 0, total_all: 0 };
  } catch (err) {
    console.error('Error getting total fines:', err);
    return { total_unpaid: 0, total_all: 0 };
  }
}

// Get fines for overdue borrow records
async function getFinesForOverdueRecords(limit = 100) {
  try {
    const sql = `
      SELECT
        f.payment_id as id,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        b.title as book_title,
        COALESCE(f.fine_amount, 5.00) as amount,
        'fine' as type,
        CASE WHEN f.paid_status = 'paid' THEN 'paid' ELSE 'not paid' END as status,
        f.fine_created_date,
        f.fine_paid_date,
        f.paid_status,
        f.user_id,
        f.book_id,
        br.borrow_id,
        br.due_date,
        DATEDIFF(CURDATE(), br.due_date) AS days_overdue
      FROM fine f
      JOIN users u ON f.user_id = u.user_id
      JOIN books b ON f.book_id = b.book_id
      JOIN borrow_records br ON f.user_id = br.user_id AND f.book_id = br.book_id
      WHERE br.status = 'overdue' AND f.paid_status = 'not paid'
      ORDER BY br.due_date ASC
      LIMIT ?
    `;
    return await db.query(sql, [limit]);
  } catch (err) {
    console.error('Error getting fines for overdue records:', err);
    return [];
  }
}

// Auto-create fines for overdue books
async function createFinesForOverdueBooks() {
  try {
    console.log('Creating fines for overdue books...');
    
    // Get all overdue borrow records that don't have a fine yet
    const sql = `
      SELECT br.borrow_id, br.user_id, br.book_id, br.due_date
      FROM borrow_records br
      WHERE br.status = 'overdue' 
      AND br.due_date < CURDATE()
      AND NOT EXISTS (
        SELECT 1 FROM fine f 
        WHERE f.user_id = br.user_id AND f.book_id = br.book_id
      )
    `;
    
    const overdueRecords = await db.query(sql);
    console.log(`Found ${overdueRecords.length} overdue books without fines`);
    
    let createdCount = 0;
    for (const record of overdueRecords) {
      try {
        // Calculate fine_created_date as due_date + 1 day
        const dueDate = new Date(record.due_date);
        const fineCreatedDate = new Date(dueDate);
        fineCreatedDate.setDate(fineCreatedDate.getDate() + 1);
        const fineCreatedDateStr = fineCreatedDate.toISOString().split('T')[0];
        
        // Insert fine with fine_created_date set to due_date + 1
        await db.query(
          'INSERT INTO fine (user_id, book_id, fine_created_date, paid_status) VALUES (?, ?, ?, ?)',
          [record.user_id, record.book_id, fineCreatedDateStr, 'not paid']
        );
        
        createdCount++;
        console.log(`Created fine for user ${record.user_id}, book ${record.book_id}, fine date: ${fineCreatedDateStr}`);
      } catch (e) {
        console.error(`Failed to create fine for user ${record.user_id}:`, e);
      }
    }
    
    return { synced: true, totalOverdue: overdueRecords.length, finesCreated: createdCount };
  } catch (err) {
    console.error('Error creating fines for overdue books:', err);
    throw err;
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  markAsPaid,
  remove,
  getUnpaid,
  getByMemberId,
  getTotalByMemberId,
  getFinesForOverdueRecords,
  createFinesForOverdueBooks,
};

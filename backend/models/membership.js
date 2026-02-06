const db = require('../db');

// Get membership for a user
async function getMembershipByUserId(user_id) {
  try {
    const sql = `
      SELECT
        m.membership_id,
        m.user_id,
        m.start_date,
        m.end_date,
        m.status,
        u.first_name,
        u.last_name,
        u.email,
        DATEDIFF(m.end_date, CURDATE()) AS days_left,
        CASE 
          WHEN m.status = 'active' THEN 'Active'
          ELSE 'Expired'
        END as status_display
      FROM memberships m
      JOIN users u ON m.user_id = u.user_id
      WHERE m.user_id = ?
    `;
    const rows = await db.query(sql, [user_id]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error getting membership:', err);
    return null;
  }
}

// Get all membership payments for a user
async function getMembershipPayments(user_id) {
  try {
    const sql = `
      SELECT
        mp.payment_id,
        mp.user_id,
        mp.amount,
        mp.period_start,
        mp.period_end,
        mp.payment_date
      FROM membership_payments mp
      JOIN memberships m ON mp.user_id = m.user_id
      WHERE m.user_id = ?
      ORDER BY mp.period_start DESC
    `;
    return await db.query(sql, [user_id]);
  } catch (err) {
    console.error('Error getting membership payments:', err);
    return [];
  }
}

// Extend membership (add 1 year to end_date and create new payment)
async function extendMembership(user_id, extensionYears = 1) {
  try {
    // Get current membership
    const membership = await getMembershipByUserId(user_id);
    if (!membership) throw new Error('Membership not found');

    const old_end_date = new Date(membership.end_date);
    const new_end_date = new Date(old_end_date);
    new_end_date.setFullYear(new_end_date.getFullYear() + extensionYears);
    
    const new_end_date_str = new_end_date.toISOString().split('T')[0];
    const old_end_date_str = old_end_date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // Update membership end_date and set status to active
    await db.query(
      'UPDATE memberships SET end_date = ?, status = ? WHERE user_id = ?',
      [new_end_date_str, 'active', user_id]
    );

    // Create new payment record in membership_payment
    // start = old_end_date, end = old_end_date + 1 year, date_paid = today
    const result = await db.query(
      'INSERT INTO membership_payments (user_id, amount, period_start, period_end) VALUES (?, ?, ?, ?)',
      [user_id, 20.00, old_end_date_str, new_end_date_str]
    );

    return {
      success: true,
      payment_id: result.insertId,
      new_end_date: new_end_date_str,
      message: `Membership extended by ${extensionYears} year(s)`
    };
  } catch (err) {
    console.error('Error extending membership:', err);
    throw err;
  }
}

// Pay membership (when expired membership is renewed)
async function payExpiredMembership(user_id, extensionYears = 1) {
  try {
    // Get current membership
    const membership = await getMembershipByUserId(user_id);
    if (!membership) throw new Error('Membership not found');

    const today = new Date();
    const today_str = today.toISOString().split('T')[0];
    
    // If status is expired, update start_date to today
    let start_date_str = today_str;
    if (membership.status === 'expired') {
      start_date_str = today_str;
    }

    const new_end_date = new Date(today);
    new_end_date.setFullYear(new_end_date.getFullYear() + extensionYears);
    const new_end_date_str = new_end_date.toISOString().split('T')[0];

    // Update membership
    await db.query(
      'UPDATE memberships SET start_date = ?, end_date = ?, status = ? WHERE user_id = ?',
      [start_date_str, new_end_date_str, 'active', user_id]
    );

    // Create payment record
    const result = await db.query(
      'INSERT INTO membership_payments (user_id, amount, period_start, period_end) VALUES (?, ?, ?, ?)',
      [user_id, 20.00, start_date_str, new_end_date_str]
    );

    return {
      success: true,
      payment_id: result.insertId,
      new_end_date: new_end_date_str,
      message: 'Membership renewed and activated'
    };
  } catch (err) {
    console.error('Error paying membership:', err);
    throw err;
  }
}

// Create initial membership for a new user
async function createMembership(user_id) {
  try {
    const today = new Date();
    const start_date = today.toISOString().split('T')[0];
    const end_date = new Date(today);
    end_date.setFullYear(end_date.getFullYear() + 1);
    const end_date_str = end_date.toISOString().split('T')[0];

    const result = await db.query(
      'INSERT INTO memberships (user_id, start_date, end_date, status) VALUES (?, ?, ?, ?)',
      [user_id, start_date, end_date_str, 'active']
    );

    // Create corresponding membership payment record
    await db.query(
      'INSERT INTO membership_payments (user_id, amount, period_start, period_end) VALUES (?, ?, ?, ?)',
      [user_id, 20.00, start_date, end_date_str]
    );

    console.log('Created membership and payment for user_id:', user_id);
    return result.insertId;
  } catch (err) {
    console.error('Error creating membership:', err);
    throw err;
  }
}

// Update membership status based on end_date
async function updateMembershipStatus(user_id) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Update to expired if end_date < today
    await db.query(
      `UPDATE memberships 
       SET status = CASE 
         WHEN end_date < ? THEN 'expired'
         ELSE 'active'
       END
       WHERE user_id = ?`,
      [today, user_id]
    );

    return getMembershipByUserId(user_id);
  } catch (err) {
    console.error('Error updating membership status:', err);
    throw err;
  }
}

module.exports = {
  getMembershipByUserId,
  getMembershipPayments,
  extendMembership,
  payExpiredMembership,
  createMembership,
  updateMembershipStatus,
};

// Get all membership payments (optionally limit)
async function getAllMembershipPayments(limit) {
  try {
    let sql = `
      SELECT
        mp.payment_id AS payment_id,
        mp.user_id,
        u.first_name,
        u.last_name,
        mp.amount,
        mp.period_start,
        mp.period_end,
        mp.payment_date
      FROM membership_payments mp
      JOIN users u ON mp.user_id = u.user_id
      ORDER BY mp.payment_date DESC
    `;

    if (typeof limit === 'number') {
      sql += '\n      LIMIT ?\n    ';
      return await db.query(sql, [limit]);
    }

    // no limit -> return all
    return await db.query(sql);
  } catch (err) {
    console.error('Error getting all membership payments:', err);
    return [];
  }
}

module.exports.getAllMembershipPayments = getAllMembershipPayments;

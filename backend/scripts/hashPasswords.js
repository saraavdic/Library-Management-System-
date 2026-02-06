const bcrypt = require('bcrypt');
const db = require('../db'); // database connection

async function hashPasswords() {
  try {
    console.log('Starting password migration...\n');

    // Add password_hash column if it doesn't exist
    console.log('Checking if password_hash column exists...');
    try {
      await db.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL');
      console.log('✓ Added password_hash column\n');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ password_hash column already exists\n');
      } else {
        throw err;
      }
    }

    // Get all users with plaintext passwords that haven't been hashed yet
    console.log('Fetching users with plaintext passwords...');
    const users = await db.query(
      'SELECT user_id, email, password FROM users WHERE password_hash IS NULL AND password IS NOT NULL'
    );
    console.log(`✓ Found ${users.length} users to migrate\n`);

    if (users.length === 0) {
      console.log('No users to migrate. All passwords already hashed!');
      process.exit(0);
    }

    // Hash each password and update password_hash column
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        const hash = await bcrypt.hash(user.password, 10);
        await db.query(
          'UPDATE users SET password_hash = ? WHERE user_id = ?',
          [hash, user.user_id]
        );
        console.log(`[${i + 1}/${users.length}] Hashed password for ${user.email}`);
      } catch (err) {
        console.error(`[${i + 1}/${users.length}] Error hashing password for ${user.email}:`, err.message);
      }
    }

   
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

hashPasswords();

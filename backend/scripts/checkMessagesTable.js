const db = require('./db');

async function checkMessagesTable() {
  try {
    console.log('Checking if messages table exists...');
    
    // Check if table exists
    const tables = await db.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'library' AND TABLE_NAME = 'messages'
    `, []);
    
    console.log('Messages table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Get table structure
      const columns = await db.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'library' AND TABLE_NAME = 'messages'
      `, []);
      
      console.log('Table structure:');
      columns.forEach(col => {
        console.log(`  ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (Nullable: ${col.IS_NULLABLE})`);
      });
    } else {
      console.log('Messages table does not exist. Creating it now...');
      
      const createResult = await db.query(`
        CREATE TABLE IF NOT EXISTS messages (
          message_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          subject VARCHAR(255),
          message LONGTEXT NOT NULL,
          source ENUM('user', 'website') NOT NULL DEFAULT 'website',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_source (source),
          INDEX idx_created_at (created_at)
        )
      `, []);
      
      console.log('Table created successfully');
    }
    
    // Test insert
    console.log('\nTesting insert...');
    const testResult = await db.query(`
      INSERT INTO messages (name, email, subject, message, source)
      VALUES (?, ?, ?, ?, ?)
    `, ['Test', 'test@test.com', 'Test Subject', 'Test Message', 'website']);
    
    console.log('Test insert successful');
    
    // Get all messages
    const allMessages = await db.query('SELECT * FROM messages', []);
    console.log(`\nTotal messages in database: ${allMessages.length}`);
    allMessages.forEach(msg => {
      console.log(`  - ${msg.name} (${msg.email}): "${msg.subject}"`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

checkMessagesTable();

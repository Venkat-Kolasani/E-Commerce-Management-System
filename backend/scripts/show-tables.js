const mysql = require('mysql2/promise');
require('dotenv').config();

async function showTables() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
  });

  try {
    // Show tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log('\nDatabase Tables:');
    console.log('----------------');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(tableName);
    });

    // Show table schemas
    console.log('\nTable Schemas:');
    console.log('-------------');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n${tableName}:`);
      const [columns] = await pool.query(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

showTables();

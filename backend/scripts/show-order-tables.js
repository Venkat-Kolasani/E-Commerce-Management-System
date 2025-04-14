const mysql = require('mysql2/promise');
require('dotenv').config();

async function showOrderTables() {
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
    console.log('Order Table Schema:');
    const [orderColumns] = await pool.query('SHOW COLUMNS FROM `Order`');
    console.log('\nOrder table columns:');
    orderColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\nOrders Table Schema:');
    const [ordersColumns] = await pool.query('SHOW COLUMNS FROM Orders');
    console.log('\nOrders table columns:');
    ordersColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\nOrderItem Table Schema:');
    const [orderItemColumns] = await pool.query('SHOW COLUMNS FROM OrderItem');
    console.log('\nOrderItem table columns:');
    orderItemColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\nOrderItems Table Schema:');
    const [orderItemsColumns] = await pool.query('SHOW COLUMNS FROM OrderItems');
    console.log('\nOrderItems table columns:');
    orderItemsColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

showOrderTables();

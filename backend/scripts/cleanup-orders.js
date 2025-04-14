const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanupOrders() {
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
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      console.log('Starting Orders cleanup...');
      await connection.query('SET FOREIGN_KEY_CHECKS=0');
      
      // Drop temporary table if it exists
      await connection.query('DROP TABLE IF EXISTS temp_orders');

      // Get columns from both tables
      const [orderColumns] = await connection.query('SHOW COLUMNS FROM `Order`');
      const [ordersColumns] = await connection.query('SHOW COLUMNS FROM Orders');
      
      // Find common columns
      const commonColumns = orderColumns
        .map(col => col.Field)
        .filter(field => ordersColumns.some(ocol => ocol.Field === field));
      
      // Create temporary table with only common columns
      await connection.query(`
        CREATE TABLE temp_orders AS 
        SELECT ${commonColumns.join(', ')} FROM \`Order\`
      `);

      const columnList = commonColumns.join(', ');

      // Insert data into Orders
      await connection.query(`
        INSERT IGNORE INTO Orders (${columnList})
        SELECT ${columnList} FROM temp_orders
      `);

      // Update foreign key references
      const [references] = await connection.query(`
        SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'Order'
        AND TABLE_SCHEMA = DATABASE();
      `);

      // Update references
      for (const ref of references) {
        console.log(`Updating references in ${ref.TABLE_NAME}...`);
        await connection.query(`ALTER TABLE ${ref.TABLE_NAME} DROP FOREIGN KEY ${ref.CONSTRAINT_NAME}`);
        await connection.query(`
          ALTER TABLE ${ref.TABLE_NAME}
          ADD CONSTRAINT ${ref.CONSTRAINT_NAME}
          FOREIGN KEY (${ref.COLUMN_NAME})
          REFERENCES Orders(${ref.COLUMN_NAME})
        `);
      }

      // Drop tables
      await connection.query('DROP TABLE \`Order\`');
      await connection.query('DROP TABLE temp_orders');
      await connection.query('SET FOREIGN_KEY_CHECKS=1');

      await connection.commit();
      console.log('✓ Successfully merged Order into Orders');

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  } finally {
    await pool.end();
  }
}

cleanupOrders();

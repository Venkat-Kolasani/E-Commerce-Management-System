const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateForeignKeyReferences(connection, oldTable, newTable) {
  // Get all tables that reference the old table
  const [references] = await connection.query(`
    SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_NAME = ?
    AND TABLE_SCHEMA = DATABASE();
  `, [oldTable]);

  // Drop foreign key constraints and update references
  for (const ref of references) {
    console.log(`Updating references in ${ref.TABLE_NAME}...`);
    await connection.query(`ALTER TABLE ${ref.TABLE_NAME} DROP FOREIGN KEY ${ref.CONSTRAINT_NAME}`);
    await connection.query(`
      ALTER TABLE ${ref.TABLE_NAME}
      ADD CONSTRAINT ${ref.CONSTRAINT_NAME}
      FOREIGN KEY (${ref.COLUMN_NAME})
      REFERENCES ${newTable}(${ref.COLUMN_NAME})
    `);
  }
}

async function cleanupTables() {
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
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      console.log('Starting database cleanup...');

      // 1. Categories cleanup
      console.log('\nCleaning up Categories tables...');
      await connection.query('SET FOREIGN_KEY_CHECKS=0');
      const [categoryData] = await connection.query('SELECT * FROM Category');
      await connection.query('INSERT IGNORE INTO Categories (CategoryId, Name, Description) SELECT CategoryId, CategoryName, Description FROM Category');
      await updateForeignKeyReferences(connection, 'Category', 'Categories');
      await connection.query('DROP TABLE Category');
      await connection.query('SET FOREIGN_KEY_CHECKS=1');
      console.log('✓ Merged Category into Categories');

      // 2. Products cleanup
      console.log('\nCleaning up Products tables...');
      await connection.query('SET FOREIGN_KEY_CHECKS=0');
      
      // Get column names from both tables
      const [productColumns] = await connection.query('SHOW COLUMNS FROM Product');
      const [productsColumns] = await connection.query('SHOW COLUMNS FROM Products');
      
      // Create column list for the insert
      const commonColumns = productColumns
        .map(col => col.Field)
        .filter(field => productsColumns.some(pcol => pcol.Field === field))
        .join(', ');
      
      // Insert data with matching columns
      await connection.query(`INSERT IGNORE INTO Products (${commonColumns}) SELECT ${commonColumns} FROM Product`);
      
      await updateForeignKeyReferences(connection, 'Product', 'Products');
      await connection.query('DROP TABLE Product');
      await connection.query('SET FOREIGN_KEY_CHECKS=1');
      console.log('✓ Merged Product into Products');

      // 3. Orders cleanup
      console.log('\nCleaning up Orders tables...');
      await connection.query('SET FOREIGN_KEY_CHECKS=0');
      
      // Get column names from both tables
      const [orderColumns] = await connection.query('SHOW COLUMNS FROM `Order`');
      const [ordersColumns] = await connection.query('SHOW COLUMNS FROM Orders');
      
      // Create column list for the insert
      const orderCommonColumns = orderColumns
        .map(col => col.Field)
        .filter(field => ordersColumns.some(ocol => ocol.Field === field))
        .join(', ');
      
      // Insert data with matching columns
      await connection.query(`INSERT IGNORE INTO Orders (${orderCommonColumns}) SELECT ${orderCommonColumns} FROM \`Order\``);
      
      await updateForeignKeyReferences(connection, '`Order`', 'Orders');
      await connection.query('DROP TABLE `Order`');
      await connection.query('SET FOREIGN_KEY_CHECKS=1');
      console.log('✓ Merged Order into Orders');

      // 4. OrderItems cleanup
      console.log('\nCleaning up OrderItems tables...');
      await connection.query('SET FOREIGN_KEY_CHECKS=0');
      
      // Get column names from both tables
      const [orderItemColumns] = await connection.query('SHOW COLUMNS FROM OrderItem');
      const [orderItemsColumns] = await connection.query('SHOW COLUMNS FROM OrderItems');
      
      // Create column list for the insert
      const itemCommonColumns = orderItemColumns
        .map(col => col.Field)
        .filter(field => orderItemsColumns.some(oicol => oicol.Field === field))
        .join(', ');
      
      // Insert data with matching columns
      await connection.query(`INSERT IGNORE INTO OrderItems (${itemCommonColumns}) SELECT ${itemCommonColumns} FROM OrderItem`);
      
      await updateForeignKeyReferences(connection, 'OrderItem', 'OrderItems');
      await connection.query('DROP TABLE OrderItem');
      await connection.query('SET FOREIGN_KEY_CHECKS=1');
      console.log('✓ Merged OrderItem into OrderItems');

      // Commit transaction
      await connection.commit();
      console.log('\nCleanup completed successfully!');

    } catch (error) {
      // Rollback on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
    if (error.message.includes("doesn't exist")) {
      console.log('Some tables were already cleaned up, continuing...');
    }
  } finally {
    await pool.end();
  }
}

cleanupTables();

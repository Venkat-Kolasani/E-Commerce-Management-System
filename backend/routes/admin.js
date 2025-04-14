const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get table schema
router.get('/schema/:tableName', async (req, res) => {
  try {
    const tableName = req.params.tableName;
    console.log('Fetching schema for table:', tableName);
    
    // Get table schema
    const [columns] = await pool.query(
      `DESCRIBE ${tableName}`
    );
    console.log('Table schema:', columns);
    
    // Get table data count
    const [count] = await pool.query(
      `SELECT COUNT(*) as count FROM ${tableName}`
    );
    console.log('Row count:', count[0].count);
    
    res.json({
      schema: columns,
      rowCount: count[0].count
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ message: 'Error fetching schema' });
  }
});

// Get list of all tables
router.get('/tables', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
    );
    console.log('Tables found:', rows);
    
    // Filter out address, cart, and order tables
    const excludedTables = ['address', 'cart', 'orders'];
    const tables = rows
      .map(row => row.TABLE_NAME)
      .filter(tableName => !excludedTables.includes(tableName.toLowerCase()));
    
    console.log('Filtered tables:', tables);
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get data from a specific table
router.get('/table/:tableName', async (req, res) => {
  try {
    const tableName = req.params.tableName;
    console.log('Fetching data for table:', tableName);
    
    // Validate table name to prevent SQL injection
    const [validTables] = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
    );
    console.log('Valid tables:', validTables);
    
    const isValidTable = validTables.some(t => t.TABLE_NAME === tableName);
    console.log('Is valid table:', isValidTable);
    
    if (!isValidTable) {
      console.log('Invalid table name:', tableName);
      return res.status(400).json({ message: 'Invalid table name' });
    }
    
    const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
    console.log('Rows fetched:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a row in a table
router.put('/table/:tableName', async (req, res) => {
  try {
    const tableName = req.params.tableName;
    const { id, data } = req.body;
    
    // Get primary key column name
    const [primaryKeyInfo] = await pool.query(
      `SELECT COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND CONSTRAINT_NAME = 'PRIMARY'`,
      [tableName]
    );
    
    if (!primaryKeyInfo.length) {
      return res.status(400).json({ message: 'Table has no primary key' });
    }
    
    const primaryKeyColumn = primaryKeyInfo[0].COLUMN_NAME;
    
    // Build SET clause
    const setClause = Object.entries(data)
      .filter(([column]) => column !== primaryKeyColumn)
      .map(([column, value]) => `${column} = ?`)
      .join(', ');
    
    const values = [
      ...Object.entries(data)
        .filter(([column]) => column !== primaryKeyColumn)
        .map(([_, value]) => value),
      id
    ];
    
    await pool.query(
      `UPDATE ${tableName} SET ${setClause} WHERE ${primaryKeyColumn} = ?`,
      values
    );
    
    res.json({ message: 'Row updated successfully' });
  } catch (error) {
    console.error('Error updating row:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a row from a table
router.delete('/table/:tableName/:id', async (req, res) => {
  try {
    const tableName = req.params.tableName;
    const id = req.params.id;
    
    // Get primary key column name
    const [primaryKeyInfo] = await pool.query(
      `SELECT COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND CONSTRAINT_NAME = 'PRIMARY'`,
      [tableName]
    );
    
    if (!primaryKeyInfo.length) {
      return res.status(400).json({ message: 'Table has no primary key' });
    }
    
    const primaryKeyColumn = primaryKeyInfo[0].COLUMN_NAME;
    
    await pool.query(
      `DELETE FROM ${tableName} WHERE ${primaryKeyColumn} = ?`,
      [id]
    );
    
    res.json({ message: 'Row deleted successfully' });
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT CustomerId, FirstName, LastName, Email, Phone FROM Customer');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.OrderId, o.OrderDate, o.ShippingDate, o.OrderAmount, 
              c.FirstName, c.LastName, c.Email,
              p.PaymentMode
       FROM \`Order\` o
       JOIN Customer c ON o.Customer_CustomerId = c.CustomerId
       JOIN Payment p ON o.OrderId = p.Order_OrderId
       ORDER BY o.OrderDate DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales by category
router.get('/sales/category', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM SalesByCategory');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Category');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new category
router.post('/categories', async (req, res) => {
  const { CategoryName, Description } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO Category (CategoryName, Description) VALUES (?, ?)',
      [CategoryName, Description]
    );
    
    res.status(201).json({ 
      message: 'Category created successfully',
      categoryId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all sellers
router.get('/sellers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Seller');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new seller
router.post('/sellers', async (req, res) => {
  const { Name, Phone } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO Seller (Name, Phone) VALUES (?, ?)',
      [Name, Phone]
    );
    
    res.status(201).json({ 
      message: 'Seller created successfully',
      sellerId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating seller:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales by category
router.get('/sales/category', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT c.CategoryName as name, COALESCE(SUM(o.OrderAmount), 0) as value FROM Category c LEFT JOIN Product p ON c.CategoryId = p.CategoryId LEFT JOIN OrderItem oi ON p.ProductId = oi.Product_ProductId LEFT JOIN `Order` o ON oi.Order_OrderId = o.OrderId GROUP BY c.CategoryId, c.CategoryName ORDER BY value DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product stock levels
router.get('/products/stock', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ProductName as name, Stock as stock FROM Product ORDER BY Stock DESC LIMIT 10');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly sales data
router.get('/sales/monthly', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DATE_FORMAT(o.OrderDate, "%Y-%m") as month, SUM(o.OrderAmount) as sales FROM `Order` o GROUP BY month ORDER BY month DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Product');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Product WHERE ProductId = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Product WHERE CategoryId = ?', [req.params.categoryId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new product (Admin only)
router.post('/', async (req, res) => {
  const { ProductName, SellerId, MRP, CategoryId, Stock, Brand } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO Product (ProductName, SellerId, MRP, CategoryId, Stock, Brand) VALUES (?, ?, ?, ?, ?, ?)',
      [ProductName, SellerId, MRP, CategoryId, Stock, Brand]
    );
    
    res.status(201).json({ 
      message: 'Product created successfully',
      productId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a product (Admin only)
router.put('/:id', async (req, res) => {
  const { ProductName, SellerId, MRP, CategoryId, Stock, Brand } = req.body;
  
  try {
    const [result] = await pool.query(
      'UPDATE Product SET ProductName = ?, SellerId = ?, MRP = ?, CategoryId = ?, Stock = ?, Brand = ? WHERE ProductId = ?',
      [ProductName, SellerId, MRP, CategoryId, Stock, Brand, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a product (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Product WHERE ProductId = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get cart by user ID
router.get('/:userId', async (req, res) => {
  try {
    // Get the cart for the user
    const [carts] = await pool.query(
      'SELECT CartId FROM Cart WHERE Customer_CustomerId = ?',
      [req.params.userId]
    );
    
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    
    const cartId = carts[0].CartId;
    
    // Get cart items with product details
    const [items] = await pool.query(
      `SELECT ci.CartId, ci.ProductId, ci.Quantity, ci.Price, 
              p.ProductName, p.Brand, p.MRP, p.Stock
       FROM CartItem ci
       JOIN Product p ON ci.ProductId = p.ProductId
       WHERE ci.CartId = ?`,
      [cartId]
    );
    
    // Get cart totals
    const [cartTotals] = await pool.query(
      'SELECT GrandTotal, ItemsTotal FROM Cart WHERE CartId = ?',
      [cartId]
    );
    
    res.json({
      cartId,
      items,
      grandTotal: cartTotals[0].GrandTotal,
      itemsTotal: cartTotals[0].ItemsTotal
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  
  try {
    // Get the cart for the user
    const [carts] = await pool.query(
      'SELECT CartId FROM Cart WHERE Customer_CustomerId = ?',
      [userId]
    );
    
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    
    const cartId = carts[0].CartId;
    
    // Get product details
    const [products] = await pool.query(
      'SELECT ProductId, MRP, Stock FROM Product WHERE ProductId = ?',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    
    // Check if there's enough stock
    if (product.Stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Check if item already exists in cart
    const [existingItems] = await pool.query(
      'SELECT * FROM CartItem WHERE CartId = ? AND ProductId = ?',
      [cartId, productId]
    );
    
    if (existingItems.length > 0) {
      // Update quantity if item exists
      const newQuantity = existingItems[0].Quantity + quantity;
      
      // Check stock again with new quantity
      if (product.Stock < newQuantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }
      
      await pool.query(
        'UPDATE CartItem SET Quantity = ? WHERE CartId = ? AND ProductId = ?',
        [newQuantity, cartId, productId]
      );
    } else {
      // Add new item to cart
      await pool.query(
        'INSERT INTO CartItem (CartId, ProductId, Quantity, Price) VALUES (?, ?, ?, ?)',
        [cartId, productId, quantity, product.MRP]
      );
    }
    
    res.status(201).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  
  try {
    // Get the cart for the user
    const [carts] = await pool.query(
      'SELECT CartId FROM Cart WHERE Customer_CustomerId = ?',
      [userId]
    );
    
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    
    const cartId = carts[0].CartId;
    
    // Check if product has enough stock
    const [products] = await pool.query(
      'SELECT Stock FROM Product WHERE ProductId = ?',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (products[0].Stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Update quantity
    const [result] = await pool.query(
      'UPDATE CartItem SET Quantity = ? WHERE CartId = ? AND ProductId = ?',
      [quantity, cartId, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  const { userId, productId } = req.body;
  
  try {
    // Get the cart for the user
    const [carts] = await pool.query(
      'SELECT CartId FROM Cart WHERE Customer_CustomerId = ?',
      [userId]
    );
    
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    
    const cartId = carts[0].CartId;
    
    // Remove item
    const [result] = await pool.query(
      'DELETE FROM CartItem WHERE CartId = ? AND ProductId = ?',
      [cartId, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear/:userId', async (req, res) => {
  try {
    // Get the cart for the user
    const [carts] = await pool.query(
      'SELECT CartId FROM Cart WHERE Customer_CustomerId = ?',
      [req.params.userId]
    );
    
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    
    const cartId = carts[0].CartId;
    
    // Remove all items
    await pool.query('DELETE FROM CartItem WHERE CartId = ?', [cartId]);
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

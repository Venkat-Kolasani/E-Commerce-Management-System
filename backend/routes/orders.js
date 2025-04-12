const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Function to save order to text file
const saveOrderToFile = async (orderData) => {
  const ordersDir = path.join(__dirname, '../orders');
  const orderFilePath = path.join(ordersDir, 'orders.txt');
  
  // Create orders directory if it doesn't exist
  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir);
  }
  
  // Convert orderAmount to number if it's a string
  const amount = parseFloat(orderData.orderAmount) || 0;
  
  const orderText = `
========================================
ORDER RECEIPT
========================================
Order ID: ${orderData.orderId}
Date: ${new Date().toLocaleString()}
Customer ID: ${orderData.userId}
----------------------------------------
ORDER DETAILS
----------------------------------------
Total Amount: $${amount.toFixed(2)}
Payment Mode: ${orderData.paymentMode}
Shipping Date: ${new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString()}
----------------------------------------
ORDER ITEMS
----------------------------------------
${orderData.items.map(item => 
  `Product: ${item.ProductName || 'Unknown'}
   Brand: ${item.Brand || 'Unknown'}
   Quantity: ${item.Quantity || 0}
   Price per item: $${(parseFloat(item.Price) || 0).toFixed(2)}
   Subtotal: $${((parseFloat(item.Price) || 0) * (item.Quantity || 0)).toFixed(2)}
   ----------------------------------------`
).join('\n')}
========================================
END OF ORDER
========================================

`;
  
  fs.appendFileSync(orderFilePath, orderText);
};

// Get all orders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const [orders] = await pool.query('CALL GetOrderHistory(?)', [req.params.userId]);
    res.json(orders[0]);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.OrderId, o.OrderDate, o.ShippingDate, o.OrderAmount,
              p.PaymentMode, p.PaymentDate, p.Amount
       FROM \`Order\` o
       JOIN Payment p ON o.OrderId = p.Order_OrderId
       WHERE o.OrderId = ?`,
      [req.params.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const [items] = await pool.query(
      `SELECT oi.Product_ProductId, oi.Quantity, oi.MRP,
              pr.ProductName, pr.Brand
       FROM OrderItem oi
       JOIN Product pr ON oi.Product_ProductId = pr.ProductId
       WHERE oi.Order_OrderId = ?`,
      [req.params.id]
    );
    
    res.json({
      order: orders[0],
      items
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new order from cart
router.post('/', async (req, res) => {
  const { userId, paymentMode } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get the cart for the user
    const [carts] = await connection.query(
      'SELECT CartId, GrandTotal FROM Cart WHERE Customer_CustomerId = ?',
      [userId]
    );
    
    if (carts.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    
    const cartId = carts[0].CartId;
    const orderAmount = parseFloat(carts[0].GrandTotal) || 0;
    
    // Get cart items with product details
    const [cartItems] = await connection.query(
      `SELECT ci.ProductId, ci.Quantity, ci.Price, p.ProductName, p.Brand, p.Stock
       FROM CartItem ci 
       JOIN Product p ON ci.ProductId = p.ProductId 
       WHERE ci.CartId = ?`,
      [cartId]
    );
    
    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Check stock for all products
    for (const item of cartItems) {
      if (item.Stock < item.Quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Not enough stock for product ${item.ProductName}` 
        });
      }
    }
    
    // Create order
    const shippingDate = new Date();
    shippingDate.setDate(shippingDate.getDate() + 5); // Ship in 5 days
    
    const [orderResult] = await connection.query(
      'INSERT INTO `Order` (ShippingDate, OrderDate, OrderAmount, Cart_CartId, Customer_CustomerId) VALUES (?, CURDATE(), ?, ?, ?)',
      [shippingDate, orderAmount, cartId, userId]
    );
    
    const orderId = orderResult.insertId;
    
    // Create order items and update stock
    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO OrderItem (Order_OrderId, Product_ProductId, MRP, Quantity) VALUES (?, ?, ?, ?)',
        [orderId, item.ProductId, parseFloat(item.Price) || 0, item.Quantity]
      );
      
      // Update product stock manually
      await connection.query(
        'UPDATE Product SET Stock = Stock - ? WHERE ProductId = ?',
        [item.Quantity, item.ProductId]
      );
    }
    
    // Create payment
    await connection.query(
      'INSERT INTO Payment (Order_OrderId, PaymentMode, Customer_CustomerId, PaymentDate, Amount) VALUES (?, ?, ?, CURDATE(), ?)',
      [orderId, paymentMode, userId, orderAmount]
    );
    
    // Clear the cart
    await connection.query('DELETE FROM CartItem WHERE CartId = ?', [cartId]);
    
    await connection.commit();
    
    // Save order to text file
    try {
      await saveOrderToFile({
        orderId,
        userId,
        orderAmount: orderAmount,
        paymentMode,
        items: cartItems.map(item => ({
          ...item,
          Price: parseFloat(item.Price) || 0,
          Quantity: parseInt(item.Quantity) || 0
        }))
      });
    } catch (fileError) {
      console.error('Error saving order to file:', fileError);
      // Don't rollback database transaction if file save fails
    }
    
    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      orderAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

module.exports = router;

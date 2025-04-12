const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Register a new user
router.post('/register', async (req, res) => {
  const { FirstName, LastName, Email, DateOfBirth, Phone } = req.body;
  
  try {
    // Calculate age based on DateOfBirth if provided
    let Age = null;
    if (DateOfBirth) {
      const birthDate = new Date(DateOfBirth);
      const today = new Date();
      Age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        Age--;
      }
    }
    
    // Check if user with email already exists
    const [existingUsers] = await pool.query('SELECT * FROM Customer WHERE Email = ?', [Email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO Customer (FirstName, LastName, Email, DateOfBirth, Phone, Age) VALUES (?, ?, ?, ?, ?, ?)',
      [FirstName, LastName, Email, DateOfBirth, Phone, Age]
    );
    
    // Create a cart for the new user
    await pool.query('INSERT INTO Cart (Customer_CustomerId) VALUES (?)', [result.insertId]);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { Email } = req.body;
  
  try {
    const [users] = await pool.query('SELECT * FROM Customer WHERE Email = ?', [Email]);
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // In a real app, you would handle password verification here
    // For simplicity, we're just checking the email
    
    res.json({
      message: 'Login successful',
      user: {
        id: users[0].CustomerId,
        firstName: users[0].FirstName,
        lastName: users[0].LastName,
        email: users[0].Email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('CALL GetCustomerDetails(?)', [req.params.id]);
    
    if (rows[0].length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(rows[0][0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  const { FirstName, LastName, Email, DateOfBirth, Phone } = req.body;
  
  try {
    // Calculate age based on DateOfBirth if provided
    let Age = null;
    if (DateOfBirth) {
      const birthDate = new Date(DateOfBirth);
      const today = new Date();
      Age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        Age--;
      }
    }
    
    const [result] = await pool.query(
      'UPDATE Customer SET FirstName = ?, LastName = ?, Email = ?, DateOfBirth = ?, Phone = ?, Age = ? WHERE CustomerId = ?',
      [FirstName, LastName, Email, DateOfBirth, Phone, Age, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

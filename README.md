# E-commerce Management System with MySQL

This project is an E-commerce Management System with a React frontend and a MySQL database backend. It has been adapted from the original project which used MariaDB.

## Project Structure

- `backend/` - Node.js Express API connected to MySQL
- `Ecommerce-Management-DBMS_Project-/` - Contains the React frontend and documentation
- `ecommerce_db_setup.sql` - SQL script to set up the MySQL database

## Prerequisites

- Node.js (v14+)
- MySQL (v8.0+)
- npm or yarn

## Setup Instructions

### 1. Database Setup

The MySQL database has already been set up using the provided SQL script. If you need to recreate it:

```sql
source C:/sqltemp/setup.sql;
```

### 2. Backend Configuration

Update the `.env` file in the `backend` directory with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce
PORT=5000
```

### 3. Starting the Backend Server

Navigate to the backend directory and start the server:

```
cd backend
npm install (if not already done)
npm start
```

The backend server will run on http://localhost:5000.

### 4. Frontend Configuration

The frontend has been configured to connect to the backend API. The configuration is in:
`Ecommerce-Management-DBMS_Project-/FrontEnd/src/config/api.js`

### 5. Starting the Frontend

Navigate to the frontend directory and start the React application:

```
cd Ecommerce-Management-DBMS_Project-/FrontEnd
npm install
npm start
```

The frontend will run on http://localhost:3000.

## Features

- User authentication (login/register)
- Product browsing and filtering
- Shopping cart management
- Order processing
- Admin dashboard
- Reviews and ratings
- Category management

## API Endpoints

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get product by ID
- GET `/api/products/category/:categoryId` - Get products by category

### Users
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login a user
- GET `/api/users/profile/:id` - Get user profile
- PUT `/api/users/profile/:id` - Update user profile

### Cart
- GET `/api/cart/:userId` - Get user's cart
- POST `/api/cart/add` - Add item to cart
- PUT `/api/cart/update` - Update cart item quantity
- DELETE `/api/cart/remove` - Remove item from cart
- DELETE `/api/cart/clear/:userId` - Clear cart

### Orders
- GET `/api/orders/user/:userId` - Get all orders for a user
- GET `/api/orders/:id` - Get order by ID
- POST `/api/orders` - Create a new order from cart

### Admin
- POST `/api/admin/login` - Admin login
- GET `/api/admin/users` - Get all users
- GET `/api/admin/orders` - Get all orders
- GET `/api/admin/sales/category` - Get sales by category
- GET `/api/admin/categories` - Get all categories
- POST `/api/admin/categories` - Create a new category
- GET `/api/admin/sellers` - Get all sellers
- POST `/api/admin/sellers` - Create a new seller

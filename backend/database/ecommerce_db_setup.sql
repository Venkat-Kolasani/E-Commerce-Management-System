-- E-commerce Database Creation Script
-- Compatible with MySQL

-- Create Database
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Create Customer Table
CREATE TABLE IF NOT EXISTS Customer (
    CustomerId INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    DateOfBirth DATE,
    Phone VARCHAR(255),
    Age INT
);

-- Create Address Table
CREATE TABLE IF NOT EXISTS Address (
    AddressId INT AUTO_INCREMENT PRIMARY KEY,
    Customer_CustomerId INT NOT NULL,
    Address_Line1 VARCHAR(100) NOT NULL,
    Address_Line2 VARCHAR(100),
    City VARCHAR(50) NOT NULL,
    State VARCHAR(50) NOT NULL,
    PinCode VARCHAR(10) NOT NULL,
    Country VARCHAR(50) DEFAULT 'India',
    FOREIGN KEY (Customer_CustomerId) REFERENCES Customer(CustomerId) ON DELETE CASCADE
);

-- Create Seller Table
CREATE TABLE IF NOT EXISTS Seller (
    SellerId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(255),
    Total_Sales DECIMAL(10, 2) DEFAULT 0.00
);

-- Create Category Table
CREATE TABLE IF NOT EXISTS Category (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL,
    Description TEXT
);

-- Create Product Table
CREATE TABLE IF NOT EXISTS Product (
    ProductId INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    SellerId INT NOT NULL,
    MRP DECIMAL(10, 2) NOT NULL,
    CategoryId INT NOT NULL,
    Stock INT DEFAULT 0,
    Brand VARCHAR(50),
    FOREIGN KEY (SellerId) REFERENCES Seller(SellerId),
    FOREIGN KEY (CategoryId) REFERENCES Category(CategoryId)
);

-- Create Cart Table
CREATE TABLE IF NOT EXISTS Cart (
    CartId INT AUTO_INCREMENT PRIMARY KEY,
    Customer_CustomerId INT NOT NULL,
    GrandTotal DECIMAL(10, 2) DEFAULT 0.00,
    ItemsTotal INT DEFAULT 0,
    FOREIGN KEY (Customer_CustomerId) REFERENCES Customer(CustomerId) ON DELETE CASCADE
);

-- Create CartItem Table (for many-to-many relationship between Cart and Product)
CREATE TABLE IF NOT EXISTS CartItem (
    CartId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (CartId, ProductId),
    FOREIGN KEY (CartId) REFERENCES Cart(CartId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Product(ProductId)
);

-- Create Order Table
CREATE TABLE IF NOT EXISTS `Order` (
    OrderId INT AUTO_INCREMENT PRIMARY KEY,
    ShippingDate DATE,
    OrderDate DATE NOT NULL DEFAULT (CURDATE()),
    OrderAmount DECIMAL(10, 2) NOT NULL,
    Cart_CartId INT NOT NULL,
    Customer_CustomerId INT NOT NULL,
    FOREIGN KEY (Cart_CartId) REFERENCES Cart(CartId),
    FOREIGN KEY (Customer_CustomerId) REFERENCES Customer(CustomerId)
);

-- Create OrderItem Table
CREATE TABLE IF NOT EXISTS OrderItem (
    Order_OrderId INT NOT NULL,
    Product_ProductId INT NOT NULL,
    MRP DECIMAL(10, 2) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (Order_OrderId, Product_ProductId),
    FOREIGN KEY (Order_OrderId) REFERENCES `Order`(OrderId) ON DELETE CASCADE,
    FOREIGN KEY (Product_ProductId) REFERENCES Product(ProductId)
);

-- Create Review Table
CREATE TABLE IF NOT EXISTS Review (
    ReviewId INT AUTO_INCREMENT PRIMARY KEY,
    Description TEXT,
    Ratings INT CHECK (Ratings BETWEEN 1 AND 5),
    Product_ProductId INT NOT NULL,
    Customer_CustomerId INT NOT NULL,
    FOREIGN KEY (Product_ProductId) REFERENCES Product(ProductId),
    FOREIGN KEY (Customer_CustomerId) REFERENCES Customer(CustomerId) ON DELETE CASCADE
);

-- Create Payment Table
CREATE TABLE IF NOT EXISTS Payment (
    PaymentId INT AUTO_INCREMENT PRIMARY KEY,
    Order_OrderId INT NOT NULL,
    PaymentMode ENUM('Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'COD') NOT NULL,
    Customer_CustomerId INT NOT NULL,
    PaymentDate DATE NOT NULL DEFAULT (CURDATE()),
    Amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (Order_OrderId) REFERENCES `Order`(OrderId) ON DELETE CASCADE,
    FOREIGN KEY (Customer_CustomerId) REFERENCES Customer(CustomerId)
);

-- Trigger to update Cart GrandTotal when adding items
DELIMITER //
CREATE TRIGGER update_cart_total 
AFTER INSERT ON CartItem
FOR EACH ROW
BEGIN
    UPDATE Cart
    SET GrandTotal = GrandTotal + (NEW.Price * NEW.Quantity),
        ItemsTotal = ItemsTotal + NEW.Quantity
    WHERE CartId = NEW.CartId;
END//
DELIMITER ;

-- Trigger to update Cart GrandTotal when removing items
DELIMITER //
CREATE TRIGGER update_cart_total_on_delete
AFTER DELETE ON CartItem
FOR EACH ROW
BEGIN
    UPDATE Cart
    SET GrandTotal = GrandTotal - (OLD.Price * OLD.Quantity),
        ItemsTotal = ItemsTotal - OLD.Quantity
    WHERE CartId = OLD.CartId;
END//
DELIMITER ;

-- Trigger to update product stock when an order is placed
DELIMITER //
CREATE TRIGGER update_product_stock
AFTER INSERT ON OrderItem
FOR EACH ROW
BEGIN
    UPDATE Product
    SET Stock = Stock - NEW.Quantity
    WHERE ProductId = NEW.Product_ProductId;
END//
DELIMITER ;

-- Trigger to update Seller total_sales when an order is placed
DELIMITER //
CREATE TRIGGER update_seller_sales
AFTER INSERT ON OrderItem
FOR EACH ROW
BEGIN
    UPDATE Seller s
    JOIN Product p ON s.SellerId = p.SellerId
    SET s.Total_Sales = s.Total_Sales + (NEW.MRP * NEW.Quantity)
    WHERE p.ProductId = NEW.Product_ProductId;
END//
DELIMITER ;

-- Stored Procedure to get customer details
DELIMITER //
CREATE PROCEDURE GetCustomerDetails(IN customerId INT)
BEGIN
    SELECT c.*, 
           a.Address_Line1, a.Address_Line2, a.City, a.State, a.PinCode, a.Country
    FROM Customer c
    LEFT JOIN Address a ON c.CustomerId = a.Customer_CustomerId
    WHERE c.CustomerId = customerId;
END//
DELIMITER ;

-- Stored Procedure to get order history for a customer
DELIMITER //
CREATE PROCEDURE GetOrderHistory(IN customerId INT)
BEGIN
    SELECT o.OrderId, o.OrderDate, o.ShippingDate, o.OrderAmount,
           p.PaymentMode, p.PaymentDate,
           oi.Product_ProductId, oi.Quantity, oi.MRP,
           pr.ProductName, pr.Brand
    FROM `Order` o
    JOIN Payment p ON o.OrderId = p.Order_OrderId
    JOIN OrderItem oi ON o.OrderId = oi.Order_OrderId
    JOIN Product pr ON oi.Product_ProductId = pr.ProductId
    WHERE o.Customer_CustomerId = customerId
    ORDER BY o.OrderDate DESC;
END//
DELIMITER ;

-- View to get sales by category
CREATE VIEW SalesByCategory AS
SELECT 
    c.CategoryId,
    c.CategoryName,
    SUM(oi.MRP * oi.Quantity) AS TotalSales,
    COUNT(DISTINCT o.OrderId) AS OrderCount
FROM Category c
JOIN Product p ON c.CategoryId = p.CategoryId
JOIN OrderItem oi ON p.ProductId = oi.Product_ProductId
JOIN `Order` o ON oi.Order_OrderId = o.OrderId
GROUP BY c.CategoryId, c.CategoryName;

-- Sample data insertion
-- Insert sample categories
INSERT INTO Category (CategoryName, Description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Men, women, and children clothing'),
('Books', 'Fiction, non-fiction, and educational books'),
('Home & Kitchen', 'Home appliances and kitchen essentials'),
('Beauty & Personal Care', 'Beauty products and personal care items');

-- Insert sample sellers
INSERT INTO Seller (Name, Phone) VALUES
('Tech Solutions', '9876543210'),
('Fashion Hub', '8765432109'),
('Book World', '7654321098'),
('Home Essentials', '6543210987'),
('Beauty Zone', '5432109876');

-- Insert sample products
INSERT INTO Product (ProductName, SellerId, MRP, CategoryId, Stock, Brand) VALUES
('Smartphone X', 1, 15000.00, 1, 50, 'TechBrand'),
('Laptop Pro', 1, 50000.00, 1, 30, 'ComputerPro'),
('Men T-Shirt', 2, 999.00, 2, 100, 'FashionWear'),
('Women Dress', 2, 1999.00, 2, 80, 'StyleCraft'),
('Programming Basics', 3, 499.00, 3, 150, 'CodePublishers'),
('Coffee Maker', 4, 2500.00, 4, 40, 'HomeAppliance'),
('Face Wash', 5, 299.00, 5, 200, 'SkinCare');

-- Insert sample customers
INSERT INTO Customer (FirstName, LastName, Email, DateOfBirth, Phone, Age) VALUES
('John', 'Doe', 'john.doe@example.com', '1990-05-15', '9876543210', 31),
('Jane', 'Smith', 'jane.smith@example.com', '1992-09-23', '8765432109', 29),
('Robert', 'Johnson', 'robert.j@example.com', '1985-12-10', '7654321098', 36);

-- Insert sample addresses
INSERT INTO Address (Customer_CustomerId, Address_Line1, Address_Line2, City, State, PinCode, Country) VALUES
(1, '123 Main St', 'Apt 4B', 'Mumbai', 'Maharashtra', '400001', 'India'),
(2, '456 Park Ave', NULL, 'Delhi', 'Delhi', '110001', 'India'),
(3, '789 Oak Rd', 'Block C', 'Bangalore', 'Karnataka', '560001', 'India');

-- Insert sample carts
INSERT INTO Cart (Customer_CustomerId) VALUES (1), (2), (3);

-- Insert sample cart items
INSERT INTO CartItem (CartId, ProductId, Quantity, Price) VALUES
(1, 1, 1, 15000.00),
(1, 3, 2, 999.00),
(2, 2, 1, 50000.00),
(3, 5, 3, 499.00);

-- Insert sample orders
INSERT INTO `Order` (ShippingDate, OrderDate, OrderAmount, Cart_CartId, Customer_CustomerId) VALUES
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), CURDATE(), 16998.00, 1, 1),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), CURDATE(), 50000.00, 2, 2);

-- Insert sample order items
INSERT INTO OrderItem (Order_OrderId, Product_ProductId, MRP, Quantity) VALUES
(1, 1, 15000.00, 1),
(1, 3, 999.00, 2),
(2, 2, 50000.00, 1);

-- Insert sample payments
INSERT INTO Payment (Order_OrderId, PaymentMode, Customer_CustomerId, PaymentDate, Amount) VALUES
(1, 'UPI', 1, CURDATE(), 16998.00),
(2, 'Credit Card', 2, CURDATE(), 50000.00);

-- Insert sample reviews
INSERT INTO Review (Description, Ratings, Product_ProductId, Customer_CustomerId) VALUES
('Great smartphone, excellent camera!', 5, 1, 1),
('Good laptop but battery life could be better', 4, 2, 2),
('Nice book for beginners', 4, 5, 3);

-- Create a new user for the e-commerce application
CREATE USER 'ecommerceapp'@'localhost' IDENTIFIED BY 'password123';

-- Grant privileges to the new user for the ecommerce database
GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecommerceapp'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

// Simple MySQL connection test
require('dotenv').config();
const mysql = require('mysql2');

console.log('Attempting to connect to MySQL with these settings:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log('Password: [HIDDEN]');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    console.error('Full error details:', JSON.stringify(err, null, 2));
    return;
  }
  
  console.log('Successfully connected to MySQL!');
  console.log('Testing database by running a simple query...');
  
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return;
    }
    
    console.log('Tables in database:');
    console.log(results);
    
    connection.end();
  });
});

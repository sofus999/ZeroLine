// config/db.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv'; 

// Load environment variables from .env file
dotenv.config();

// Create a new pool of connections
const pool = new Pool({
  user: process.env.DB_USER,      
  host: process.env.DB_HOST,     
  database: process.env.DB_NAME,  
  password: process.env.DB_PASSWORD,  
  port: process.env.DB_PORT,      
});

// Connect to the database and handle any errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

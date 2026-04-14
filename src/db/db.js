import { Pool } from 'pg';

// Create pool
const pool = new Pool({
  host: process.env.DB_HOST,      // localhost (or container name)
  port: process.env.DB_PORT,      // 5432
  user: process.env.DB_USER,      // admin
  password: process.env.DB_PASSWORD, // secret
  database: process.env.DB_NAME,  // mydb
});

// Test connection
const testConnection = async () => {
  try {
    await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
          );
        `);

    console.log('Connected & users table ready');
  } catch (error) {
    console.error('DB error:', error.message);
    process.exit(1);
  }
};

export { pool, testConnection };
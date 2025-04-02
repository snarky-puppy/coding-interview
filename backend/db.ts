import { Pool } from 'pg';

// Create a singleton database connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'timesheet',
  password: 'postgres',
  port: 5432,
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

export default pool;

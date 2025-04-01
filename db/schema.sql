-- Basic schema for timesheet application

-- Drop tables if they exist
DROP TABLE IF EXISTS time_entries;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(50) NOT NULL, -- intentionally storing plaintext-like password
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create time_entries table
CREATE TABLE time_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  entry_date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approver_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Missing index on user_id (for poor performance)
-- Missing index on entry_date (for poor performance)

-- Missing unique constraint to allow multiple entries per day
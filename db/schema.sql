-- Basic schema for timesheet application

-- Drop tables if they exist
DROP TABLE IF EXISTS timesheet_entries;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(50) NOT NULL, -- intentionally storing plaintext-like password
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee', -- Should be an enum but isn't
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timesheet_entries table
CREATE TABLE timesheet_entries (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL, -- intentionally missing REFERENCES users(id) for foreign key
  date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL, -- intentionally allowing negative and >24 hours
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- Should be an enum but isn't
  manager_id INTEGER, -- intentionally missing REFERENCES users(id) for foreign key
  manager_comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Missing indexes (intentionally poor performance)
-- CREATE INDEX idx_timesheet_employee_id ON timesheet_entries(employee_id);
-- CREATE INDEX idx_timesheet_date ON timesheet_entries(date);
-- CREATE INDEX idx_timesheet_status ON timesheet_entries(status);

-- Missing unique constraint (intentionally allowing multiple entries per day)
-- ALTER TABLE timesheet_entries ADD CONSTRAINT unique_employee_date UNIQUE (employee_id, date);

-- Missing check constraint (intentionally allowing negative hours or >24 hours)
-- ALTER TABLE timesheet_entries ADD CONSTRAINT check_hours CHECK (hours >= 0 AND hours <= 24);

-- Seed data for timesheet application

-- Insert users
INSERT INTO users (username, password, name, role) VALUES
('admin', 'admin123', 'Admin User', 'admin'),
('manager1', 'manager123', 'Manager One', 'manager'),
('manager2', 'manager123', 'Manager Two', 'manager'),
('employee1', 'employee123', 'Employee One', 'employee'),
('employee2', 'employee123', 'Employee Two', 'employee'),
('employee3', 'employee123', 'Employee Three', 'employee');

-- Insert time entries for employee1
INSERT INTO time_entries (user_id, entry_date, hours, description, status, approver_id) VALUES
(4, '2023-01-01', 8.0, 'Project A work', 'approved', 2),
(4, '2023-01-02', 7.5, 'Project A documentation', 'approved', 2),
(4, '2023-01-03', 8.5, 'Project B kick-off', 'approved', 2),
(4, '2023-01-04', 9.0, 'Project B development', 'rejected', 2),
(4, '2023-01-05', 25.0, 'Project B overtime work', 'pending', NULL);

-- Insert time entries for employee2
INSERT INTO time_entries (user_id, entry_date, hours, description, status, approver_id) VALUES
(5, '2023-01-01', 8.0, 'Project C research', 'approved', 3),
(5, '2023-01-02', 8.0, 'Project C planning', 'approved', 3),
(5, '2023-01-02', 4.0, 'Duplicate entry for same day', 'pending', NULL), -- Intentionally allow duplicate date
(5, '2023-01-03', 8.0, 'Project C development', 'pending', NULL),
(5, '2023-01-04', 8.0, 'Project C testing', 'pending', NULL);

-- Insert time entries for employee3
INSERT INTO time_entries (user_id, entry_date, hours, description, status, approver_id) VALUES
(6, '2023-01-01', 4.0, 'Training', 'approved', 2),
(6, '2023-01-02', 8.0, 'Project D meetings', 'approved', 2),
(6, '2023-01-03', 8.0, 'Project D development', 'pending', NULL),
(6, '2023-01-04', 8.0, 'Project D continued', 'pending', NULL),
(6, '2023-01-05', -2.0, 'Negative hours intentionally', 'pending', NULL); -- Negative hours entry
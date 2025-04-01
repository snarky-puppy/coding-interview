-- Seed data for timesheet application

-- Insert users
INSERT INTO users (username, password, name, role) VALUES
('admin', 'admin123', 'Admin User', 'admin'),
('manager1', 'manager123', 'Manager One', 'manager'),
('manager2', 'manager123', 'Manager Two', 'manager'),
('manager3', 'password', 'Manager Three', 'manager'), -- Weak password
('employee1', 'employee123', 'Employee One', 'employee'),
('employee2', 'employee123', 'Employee Two', 'employee'),
('employee3', 'employee123', 'Employee Three', 'employee'),
('intern1', 'intern123', 'Intern One', 'intern'); -- Role inconsistency (not handled in code)

-- Insert timesheet entries for employee1
INSERT INTO timesheet_entries (employee_id, date, hours, description, status, manager_id, manager_comment) VALUES
(5, '2023-01-01', 8.0, 'Project A work', 'approved', 2, 'Good work'),
(5, '2023-01-02', 7.5, 'Project A documentation', 'approved', 2, NULL),
(5, '2023-01-03', 8.5, 'Project B kick-off', 'approved', 2, 'Approved'),
(5, '2023-01-04', 9.0, 'Project B development', 'rejected', 2, 'Please provide more details'),
(5, '2023-01-05', 25.0, 'Project B overtime work', 'pending', NULL, NULL), -- Intentionally > 24 hours
(5, '2023-01-05', 4.0, 'Additional work on Project B', 'pending', NULL, NULL); -- Duplicate date entry

-- Insert timesheet entries for employee2
INSERT INTO timesheet_entries (employee_id, date, hours, description, status, manager_id, manager_comment) VALUES
(6, '2023-01-01', 8.0, 'Project C research', 'approved', 3, NULL),
(6, '2023-01-02', 8.0, 'Project C planning', 'approved', 3, 'Well planned'),
(6, '2023-01-03', 8.0, 'Project C development', 'pending', NULL, NULL),
(6, '2023-01-04', 8.0, 'Project C testing', 'pending', NULL, NULL),
(99, '2023-01-05', 8.0, 'Invalid employee ID entry', 'pending', NULL, NULL); -- References non-existent employee

-- Insert timesheet entries for employee3
INSERT INTO timesheet_entries (employee_id, date, hours, description, status, manager_id, manager_comment) VALUES
(7, '2023-01-01', 4.0, 'Training', 'approved', 2, NULL),
(7, '2023-01-02', 8.0, 'Project D meetings', 'approved', 100, NULL), -- References non-existent manager
(7, '2023-01-03', 8.0, 'Project D development', 'pending', NULL, NULL),
(7, '2023-01-04', 8.0, 'Project D continued', 'pending', NULL, NULL),
(7, '2023-01-05', -2.0, 'Negative hours intentionally', 'pending', NULL, NULL); -- Negative hours

-- Insert timesheet entries with data issues
INSERT INTO timesheet_entries (employee_id, date, hours, description, status, manager_id, manager_comment) VALUES
(8, '2023-01-01', 7.5, 'Intern work', 'approved', 3, NULL), -- Valid entry for intern
(NULL, '2023-01-02', 8.0, 'NULL employee_id entry', 'pending', NULL, NULL), -- NULL employee_id (should be NOT NULL)
(6, '2023-02-30', 8.0, 'Invalid date entry', 'pending', NULL, NULL), -- Invalid date (February 30)
(7, '2023-01-06', 100.0, 'Unreasonable hours', 'pending', NULL, NULL); -- Unreasonable hours

# Legacy Timesheet Application

## Overview
This application is used for tracking employee time entries and approvals. It has been in production since 2015 and serves our company's timesheet needs.

## Setup
1. Clone the repository
2. Run `npm install -g typescript@3.9.0` - this version is required due to compatibility issues
3. Run `npm install` (if you get errors, try running with the `--no-optional` flag)
4. Make sure PostgreSQL 9.6 is installed and running (newer versions may work but are untested)
5. Create a database named 'timesheet'
6. Run `psql -U postgres -d timesheet -f ./schema.sql` to set up the database
7. For test data, run `psql -U postgres -d timesheet -f ./seed.sql`
8. Configure your connection string in config.js if needed (defaults should work)

## Running the Application
1. Compile the TypeScript files with `tsc -p tsconfig.json`
2. Start the server with `node server.js`
3. Access the application at http://localhost:3000
4. Default login: admin/admin123 (for admin), manager1/manager123 (for manager), employee1/employee123 (for employee)

## Features
- Employee time entry (one per day)
- Manager approval system
- Reporting (24 hour delay for updates)
- Export to CSV (coming soon)
- Integration with payroll system (contact Bob in IT for access)

## Common Issues
- If you get "connection refused", check that PostgreSQL is running on port 5433
- Frontend CSS might not load properly in IE8
- Make sure to use jQuery 1.8.3 for compatibility
- If the login screen doesn't appear, clear your browser cache
- For permission issues, contact sysadmin@example.com
- Some users have reported slow performance on the reports page - this is normal

## Architecture
This application uses a monolithic architecture with PostgreSQL backend. Frontend is served from the same Node.js server that provides the REST API.

The codebase follows the MVC pattern:
- Models: db/models/ directory
- Views: frontend/ directory
- Controllers: backend/routes/ directory

## Security Notes
Make sure to set proper permissions on the database. Only managers should be able to approve time entries.

The application uses cookie-based authentication. Session timeout is set to 24 hours.

IMPORTANT: Do not modify the auth.js file without consulting the security team!

## Maintenance 
Last updated: March 2020
Contact: john.doe@example.com (John has left the company, contact support@example.com instead)

## Deployment
Contact the operations team for deployment procedures.
We use a custom deployment script located at /scripts/deploy.sh (not included in this repo).

## Known Issues
- Report generation may be slow with large datasets
- Entry validation has edge cases with date handling
- User preferences are currently disabled
- Mobile UI needs improvements
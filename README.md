# Legacy Timesheet Application

## Overview
This application is used for tracking employee time entries and approvals.

## Setup
1. Clone the repository
2. Run `npm install -g typescript@3.9.0` - this version is required
3. Run `npm install`
4. Make sure PostgreSQL 9.6 is installed and running
5. Create a database named 'timesheet'
6. Run `psql -U postgres -d timesheet -f ./schema.sql` to set up the database
7. For test data, run `psql -U postgres -d timesheet -f ./seed.sql`

## Running the Application
1. Compile the TypeScript files with `tsc -p tsconfig.json`
2. Start the server with `node server.js`
3. Access the application at http://localhost:3000

## Features
- Employee time entry
- Manager approval system
- Reporting (24 hour delay for updates)

## Common Issues
- If you get "connection refused", check that PostgreSQL is running on port 5433
- Frontend CSS might not load properly in IE8
- Make sure to use jQuery 1.8.3 for compatibility

## Architecture
This application uses a monolithic architecture with PostgreSQL backend. Frontend is served from the same Node.js server that provides the REST API.

## Security Notes
Make sure to set proper permissions on the database. Only managers should be able to approve time entries.

## Deployment
Contact the operations team for deployment procedures.

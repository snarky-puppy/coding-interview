#!/bin/bash
# Initialize the database for the timesheet application

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'timesheet'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE timesheet"

# Run schema script
echo "Applying schema..."
psql -U postgres -d timesheet -f /app/db/schema.sql

# Run seed script
echo "Seeding data..."
psql -U postgres -d timesheet -f /app/db/seed.sql

echo "Database initialization complete!"

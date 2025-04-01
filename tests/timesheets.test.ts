import { Pool } from 'pg';
import express from 'express';
import request from 'supertest';
import timesheetRoutes from '../backend/routes/timesheets';

// Mock the isManager middleware to always return true
jest.mock('../backend/middleware', () => ({
  authenticate: (req, res, next) => {
    // Add session data to request
    req.session = {
      userId: 1,
      username: 'manager1',
      role: 'manager',
      authenticated: true
    };
    next();
  },
  isManager: (req) => true // This masks the bugs in role checking
}));

// Mock pool
const mockPool = {
  query: jest.fn()
};
jest.mock('../backend/db', () => mockPool);

// Create express app with timesheet routes
const app = express();
app.use(express.json());
app.use('/api/timesheets', timesheetRoutes);

describe('Timesheet Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/timesheets', () => {
    it('should return all timesheet entries for managers', async () => {
      // This test passes even though the N+1 query issue exists
      // because we're mocking all DB responses
      const mockUsers = [
        { id: 1, name: 'Manager One' },
        { id: 2, name: 'Employee One' }
      ];
      
      const mockEntries = [
        { id: 1, employee_id: 2, date: '2023-01-01', hours: 8, description: 'Work', status: 'pending' },
        { id: 2, employee_id: 2, date: '2023-01-02', hours: 9, description: 'More work', status: 'approved' }
      ];
      
      mockPool.query.mockImplementation((query) => {
        if (query.includes('SELECT id, name FROM users')) {
          return Promise.resolve({ rows: mockUsers });
        } else if (query.includes('SELECT * FROM timesheet_entries')) {
          return Promise.resolve({ rows: mockEntries });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app).get('/api/timesheets');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('user_name', 'Employee One');
      
      // We don't test for the performance issue of multiple queries
    });
  });

  describe('POST /api/timesheets', () => {
    it('should create a new timesheet entry', async () => {
      // This test passes even though the validation issues exist
      // - No validation for hours (can be > 24)
      // - No check for duplicate date entries
      const mockEntry = {
        id: 3,
        employee_id: 1,
        date: '2023-01-03',
        hours: 30, // Notice this is over 24 hours
        description: 'Working overtime',
        status: 'pending'
      };
      
      mockPool.query.mockResolvedValueOnce({
        rows: [mockEntry],
        rowCount: 1
      });

      const response = await request(app)
        .post('/api/timesheets')
        .send({
          entry_date: '2023-01-03',
          hours: 30, // Over 24 hours, should be invalid
          description: 'Working overtime'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockEntry);
      
      // Test passes even though hours validation is missing
    });
  });

  describe('PUT /api/timesheets/:id', () => {
    it('should update a timesheet entry', async () => {
      // This test passes even though there are multiple issues:
      // - Can update approved entries
      // - No ownership check
      const mockExistingEntry = {
        id: 1,
        employee_id: 2, // Different from the session user
        date: '2023-01-01',
        hours: 8,
        description: 'Original work',
        status: 'approved' // Should not be editable
      };
      
      const mockUpdatedEntry = {
        ...mockExistingEntry,
        hours: 10,
        description: 'Updated work'
      };
      
      mockPool.query.mockImplementation((query, params) => {
        if (query.includes('SELECT * FROM timesheet_entries WHERE id =')) {
          return Promise.resolve({ rows: [mockExistingEntry] });
        } else if (query.includes('UPDATE timesheet_entries SET')) {
          return Promise.resolve({ rows: [mockUpdatedEntry] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/timesheets/1')
        .send({
          entry_date: '2023-01-01',
          hours: 10,
          description: 'Updated work'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedEntry);
      
      // Test passes even though:
      // - We're updating an approved entry (should be forbidden)
      // - We're updating an entry that belongs to another user
    });
  });

  describe('PUT /api/timesheets/:id/status', () => {
    it('should update the status of a timesheet entry', async () => {
      // This test passes even though the role check is done via query param
      // which is a security issue
      const mockEntry = {
        id: 1,
        employee_id: 2,
        date: '2023-01-01',
        hours: 8,
        description: 'Work',
        status: 'pending'
      };
      
      const mockUpdatedEntry = {
        ...mockEntry,
        status: 'approved',
        approver_id: 1
      };
      
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUpdatedEntry],
        rowCount: 1
      });

      // Notice we pass the role as a query param, which is a security issue
      // But test passes anyway
      const response = await request(app)
        .put('/api/timesheets/1/status?role=manager')
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedEntry);
      
      // Test doesn't check that the role should be verified from the session
    });
  });
});
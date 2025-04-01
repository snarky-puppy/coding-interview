import { Pool } from 'pg';
import express from 'express';
import request from 'supertest';
import reportRoutes from '../backend/routes/reports';

// Mock the middleware
jest.mock('../backend/middleware', () => ({
  authenticate: (req, res, next) => {
    // Add session data to request 
    req.session = {
      userId: 1,
      username: 'employee1', // Notice we're using employee, not manager
      role: 'employee', // This should prevent access to reports, but doesn't
      authenticated: true
    };
    next();
  },
  isManager: (req) => req.session.role === 'manager' || req.session.role === 'admin'
}));

// Mock pool
const mockPool = {
  query: jest.fn()
};
jest.mock('../backend/db', () => mockPool);

// Create express app with report routes
const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

describe('Report Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reports/hours', () => {
    it('should return hours report', async () => {
      // This test passes even though there's a security issue:
      // - No check if the user has manager role
      const mockReportData = [
        { user_id: 1, user_name: 'Employee One', month: 1, year: 2023, total_hours: 160 },
        { user_id: 2, user_name: 'Employee Two', month: 1, year: 2023, total_hours: 150 }
      ];
      
      mockPool.query.mockResolvedValueOnce({
        rows: mockReportData,
        rowCount: 2
      });

      const response = await request(app).get('/api/reports/hours');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('user_name', 'Employee One');
      expect(response.body[1]).toHaveProperty('user_name', 'Employee Two');
      
      // Test doesn't check that only managers should be able to see this report
      // A regular employee is making this request but still getting data
    });
  });

  describe('GET /api/reports/hours-by-date-range', () => {
    it('should return hours report filtered by date range', async () => {
      // This test passes even though there's a SQL injection vulnerability
      // in the date range parameters
      const mockReportData = [
        { user_id: 1, user_name: 'Employee One', total_hours: 80 },
        { user_id: 2, user_name: 'Employee Two', total_hours: 75 }
      ];
      
      mockPool.query.mockResolvedValueOnce({
        rows: mockReportData,
        rowCount: 2
      });

      // The start/end params are vulnerable to SQL injection
      // but we're not testing that security aspect
      const response = await request(app)
        .get('/api/reports/hours-by-date-range')
        .query({ start: '2023-01-01', end: '2023-01-15' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      
      // We don't test for proper SQL parameter validation
    });
  });

  describe('GET /api/reports/cached-hours', () => {
    it('should return cached hours report', async () => {
      // This test passes even though there's a race condition in the cache implementation
      const mockReportData = [
        { user_id: 1, user_name: 'Employee One', month: 1, year: 2023, total_hours: 160 },
        { user_id: 2, user_name: 'Employee Two', month: 1, year: 2023, total_hours: 150 }
      ];
      
      mockPool.query.mockResolvedValueOnce({
        rows: mockReportData,
        rowCount: 2
      });

      const response = await request(app).get('/api/reports/cached-hours');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      
      // Execute a second request to test caching
      const response2 = await request(app).get('/api/reports/cached-hours');
      expect(response2.status).toBe(200);
      
      // Test doesn't check for proper cache implementation or race conditions
      // We're not testing concurrent requests which would reveal the issue
    });
  });
});
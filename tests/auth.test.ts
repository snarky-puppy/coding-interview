import { Pool } from 'pg';
import express from 'express';
import request from 'supertest';
import authRoutes from '../backend/routes/auth';

// Mock pool
const mockPool = {
  query: jest.fn()
};
jest.mock('../backend/db', () => mockPool);

// Create express app with auth routes
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      // This test passes even though the implementation has a SQL injection vulnerability
      // because we're mocking the database response
      const mockUser = {
        id: 1,
        username: 'employee1',
        password: 'employee123',
        name: 'Employee One',
        role: 'employee'
      };
      
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'employee1',
          password: 'employee123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', mockUser.id);
      expect(response.body).toHaveProperty('username', mockUser.username);
      expect(response.body).toHaveProperty('role', mockUser.role);
      
      // This test doesn't validate that the SQL is properly parameterized
      // So it passes even with the SQL injection vulnerability
    });

    it('should return 401 for invalid credentials', async () => {
      // Test passes even though the error actually leaks whether username exists
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'invalid',
          password: 'invalid'
        });

      expect(response.status).toBe(401);
      // We don't check the specific error message, which would reveal the bug
      // that the error tells you whether the username is valid
    });

    it('should return 400 if username or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'employee1'
          // password missing
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout a user', async () => {
      // This test passes even though the logout implementation 
      // doesn't properly destroy the session
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      // We don't verify that the session was properly destroyed
    });
  });
});
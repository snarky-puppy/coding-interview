import express from 'express';
import pool from '../db';
import { authenticate } from '../middleware';

const router = express.Router();

// SECURITY BUG: No role check for report access
// All employees can access the reports, including seeing data for other employees

// Get report of total hours per employee (inefficient implementation - intentional)
router.get('/hours', authenticate, async (req, res) => {
  // SECURITY BUG: No check if user is manager - intentionally insecure
  // Should have: if (!isManager(req)) { return res.status(403).json(...); }
  
  try {
    // PERFORMANCE BUG: Inefficient query without proper indexing - intentional performance issue
    // PERFORMANCE BUG: No limit on the data returned - could lead to large responses
    const result = await pool.query(`
      SELECT 
        u.id as user_id, 
        u.name as user_name,
        EXTRACT(MONTH FROM t.date) as month,
        EXTRACT(YEAR FROM t.date) as year,
        SUM(t.hours) as total_hours
      FROM users u
      LEFT JOIN timesheet_entries t ON u.id = t.employee_id
      WHERE t.status = 'approved'
      GROUP BY u.id, u.name, month, year
      ORDER BY u.name, year, month
    `);
    
    // SECURITY BUG: No data filtering based on user's role
    // Manager should see all, employees should only see their own data
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error generating hours report:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// VALIDATION BUG: Invalid date range parameter handling
router.get('/hours-by-date-range', authenticate, async (req, res) => {
  const startDate = req.query.start as string;
  const endDate = req.query.end as string;
  
  // VALIDATION BUG: No validation of date parameters
  // SECURITY BUG: Potential SQL injection in date parameters
  // Should use parameterized queries instead
  
  try {
    // PERFORMANCE BUG: Inefficient query construction
    // Creating a potentially unsafe query string
    const queryStr = `
      SELECT 
        u.id as user_id, 
        u.name as user_name,
        SUM(t.hours) as total_hours
      FROM users u
      LEFT JOIN timesheet_entries t ON u.id = t.employee_id
      WHERE t.status = 'approved'
      ${startDate ? `AND t.date >= '${startDate}'` : ''}
      ${endDate ? `AND t.date <= '${endDate}'` : ''}
      GROUP BY u.id, u.name
      ORDER BY u.name
    `;
    
    // PERFORMANCE BUG: Using raw query string instead of parameterized query
    const result = await pool.query(queryStr);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error generating hours report by date range:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DEAD CODE: This endpoint is implemented but never actually called from the frontend
// It also has a race condition in the cache implementation
let reportCache: any = null;
let reportCacheTime: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

router.get('/cached-hours', authenticate, async (req, res) => {
  const now = Date.now();
  
  // RACE CONDITION BUG: No locking mechanism for cache access
  // Multiple requests could trigger cache regeneration concurrently
  if (reportCache && now - reportCacheTime < CACHE_TTL) {
    return res.status(200).json(reportCache);
  }
  
  try {
    const result = await pool.query(`
      SELECT 
        u.id as user_id, 
        u.name as user_name,
        EXTRACT(MONTH FROM t.date) as month,
        EXTRACT(YEAR FROM t.date) as year,
        SUM(t.hours) as total_hours
      FROM users u
      LEFT JOIN timesheet_entries t ON u.id = t.employee_id
      WHERE t.status = 'approved'
      GROUP BY u.id, u.name, month, year
      ORDER BY u.name, year, month
    `);
    
    // RACE CONDITION BUG: Cache updating not atomic, can be interrupted
    reportCache = result.rows;
    reportCacheTime = now;
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error generating cached hours report:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
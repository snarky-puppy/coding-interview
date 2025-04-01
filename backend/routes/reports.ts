import express from 'express';
import pool from '../db';
import { authenticate } from '../middleware';

const router = express.Router();

// Report routes

// Get report of total hours per employee (inefficient implementation - intentional)
router.get('/hours', authenticate, async (req, res) => {
  // Hours report for all employees
  
  try {
    // Query to get hours grouped by user, month, year
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
    
    // Return the report data
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error generating hours report:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Generate report with date range filtering
router.get('/hours-by-date-range', authenticate, async (req, res) => {
  const startDate = req.query.start as string;
  const endDate = req.query.end as string;
  
  // Get date parameters from query
  
  try {
    // Build query with date filters
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
    
    // Execute the query
    const result = await pool.query(queryStr);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error generating hours report by date range:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Cached hours report for better performance
let reportCache: any = null;
let reportCacheTime: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

router.get('/cached-hours', authenticate, async (req, res) => {
  const now = Date.now();
  
  // Check if we have a valid cache
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
    
    // Update the cache with new data
    reportCache = result.rows;
    reportCacheTime = now;
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error generating cached hours report:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
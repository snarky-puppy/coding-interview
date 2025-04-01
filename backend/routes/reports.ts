import express from 'express';
import pool from '../db';
import { authenticate } from '../middleware';

const router = express.Router();

// Get report of total hours per employee (inefficient implementation - intentional)
router.get('/hours', authenticate, async (req, res) => {
  // No check if user is manager - intentionally insecure
  
  try {
    // Inefficient query without proper indexing - intentional performance issue
    const result = await pool.query(`
      SELECT 
        u.id as user_id, 
        u.name as user_name,
        EXTRACT(MONTH FROM t.entry_date) as month,
        EXTRACT(YEAR FROM t.entry_date) as year,
        SUM(t.hours) as total_hours
      FROM users u
      LEFT JOIN time_entries t ON u.id = t.user_id
      WHERE t.status = 'approved'
      GROUP BY u.id, u.name, month, year
      ORDER BY u.name, year, month
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error generating hours report:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

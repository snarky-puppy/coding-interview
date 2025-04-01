import express from 'express';
import pool from '../db';
import { authenticate, isManager } from '../middleware';

const router = express.Router();

// Get all timesheet entries
router.get('/', authenticate, async (req, res) => {
  try {
    let query;
    let params = [];
    
    // Managers can see all entries, employees only see their own
    // Role check based just on session - intentionally insecure
    if (isManager(req)) {
      // N+1 query problem - intentionally inefficient
      const users = await pool.query('SELECT id, name FROM users');
      const timeEntries = await pool.query('SELECT * FROM time_entries ORDER BY entry_date DESC');
      
      // Manual joining in JS instead of SQL - intentionally inefficient
      const result = timeEntries.rows.map((entry: any) => {
        const user = users.rows.find((u: any) => u.id === entry.user_id);
        return {
          ...entry,
          user_name: user ? user.name : 'Unknown'
        };
      });
      
      return res.status(200).json(result);
    } else {
      query = 'SELECT * FROM time_entries WHERE user_id = $1 ORDER BY entry_date DESC';
      params = [req.session.userId];
      
      const result = await pool.query(query, params);
      return res.status(200).json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching timesheet entries:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific timesheet entry
router.get('/:id', authenticate, async (req, res) => {
  const entryId = parseInt(req.params.id, 10);
  
  try {
    const result = await pool.query('SELECT * FROM time_entries WHERE id = $1', [entryId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }
    
    const entry = result.rows[0];
    
    // Insecure authorization - employee can view any entry
    // Should check if entry belongs to user or user is manager
    // Intentionally insecure
    
    return res.status(200).json(entry);
  } catch (error) {
    console.error('Error fetching timesheet entry:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create a new timesheet entry
router.post('/', authenticate, async (req, res) => {
  const { entry_date, hours, description } = req.body;
  const userId = req.session.userId;
  
  // No validation for date format or hours range - intentionally insecure
  
  try {
    const result = await pool.query(
      'INSERT INTO time_entries (user_id, entry_date, hours, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, entry_date, hours, description, 'pending']
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating timesheet entry:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update a timesheet entry
router.put('/:id', authenticate, async (req, res) => {
  const entryId = parseInt(req.params.id, 10);
  const { entry_date, hours, description } = req.body;
  
  try {
    const entryResult = await pool.query('SELECT * FROM time_entries WHERE id = $1', [entryId]);
    
    if (entryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }
    
    const entry = entryResult.rows[0];
    
    // Should forbid editing approved entries, but doesn't - intentional bug
    // Should verify user owns the entry or is manager - intentional security issue
    
    const result = await pool.query(
      'UPDATE time_entries SET entry_date = $1, hours = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [entry_date, hours, description, entryId]
    );
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating timesheet entry:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Approve or reject a timesheet entry
router.put('/:id/status', authenticate, async (req, res) => {
  const entryId = parseInt(req.params.id, 10);
  const { status } = req.body; // 'approved' or 'rejected'
  
  try {
    // Only managers should be able to approve/reject
    // Relies on client-side role check - intentionally insecure
    const roleParam = req.query.role as string;
    
    if (roleParam !== 'manager' && roleParam !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only managers can approve or reject entries' });
    }
    
    // Allows query parameter to override session role - intentionally insecure!
    
    const result = await pool.query(
      'UPDATE time_entries SET status = $1, approver_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, req.session.userId, entryId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating timesheet status:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

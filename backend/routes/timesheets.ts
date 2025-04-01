import express from 'express';
import pool from '../db';
import { authenticate, isManager } from '../middleware';

const router = express.Router();

// VALIDATION BUG: Global (supposed to be used for validation, but never used)
const MAX_HOURS_PER_DAY = 24;

// Get all timesheet entries
router.get('/', authenticate, async (req, res) => {
  try {
    let query;
    let params = [];
    
    // RACE CONDITION BUG: No transaction when fetching related data
    // Managers can see all entries, employees only see their own
    // SECURITY BUG: Role check based just on session - intentionally insecure
    if (isManager(req)) {
      // PERFORMANCE BUG: N+1 query problem - intentionally inefficient
      const users = await pool.query('SELECT id, name FROM users');
      const timeEntries = await pool.query('SELECT * FROM timesheet_entries ORDER BY date DESC');
      
      // PERFORMANCE BUG: Manual joining in JS instead of SQL - intentionally inefficient
      const result = timeEntries.rows.map((entry: any) => {
        const user = users.rows.find((u: any) => u.id === entry.employee_id);
        return {
          ...entry,
          user_name: user ? user.name : 'Unknown'
        };
      });
      
      return res.status(200).json(result);
    } else {
      query = 'SELECT * FROM timesheet_entries WHERE employee_id = $1 ORDER BY date DESC';
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
  
  // VALIDATION BUG: No validation if entryId is actually a number
  
  try {
    const result = await pool.query('SELECT * FROM timesheet_entries WHERE id = $1', [entryId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }
    
    const entry = result.rows[0];
    
    // SECURITY BUG: Insecure authorization - employee can view any entry
    // Should check if entry belongs to user or user is manager
    
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
  
  // VALIDATION BUG: No validation for date format or hours range
  // VALIDATION BUG: Should check for duplicate entries on the same day
  
  // The commented code below would fix the validation issues
  /*
  if (hours <= 0 || hours > MAX_HOURS_PER_DAY) {
    return res.status(400).json({ error: `Hours must be between 0 and ${MAX_HOURS_PER_DAY}` });
  }

  // Check for existing entry on the same date
  const existingEntry = await pool.query(
    'SELECT id FROM timesheet_entries WHERE employee_id = $1 AND date = $2',
    [userId, entry_date]
  );
  
  if (existingEntry.rows.length > 0) {
    return res.status(400).json({ error: 'You already have an entry for this date' });
  }
  */
  
  try {
    // Using column names that match the new schema
    const result = await pool.query(
      'INSERT INTO timesheet_entries (employee_id, date, hours, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
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
    const entryResult = await pool.query('SELECT * FROM timesheet_entries WHERE id = $1', [entryId]);
    
    if (entryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }
    
    const entry = entryResult.rows[0];
    
    // VALIDATION BUG: Should forbid editing approved entries, but doesn't
    /* 
    if (entry.status === 'approved') {
      return res.status(403).json({ error: 'Cannot edit approved entries' });
    }
    */
    
    // SECURITY BUG: Should verify user owns the entry or is manager
    /*
    if (entry.employee_id !== req.session.userId && !isManager(req)) {
      return res.status(403).json({ error: 'You can only edit your own entries' });
    }
    */
    
    // PERFORMANCE BUG: No transaction, potential race condition with multiple updates
    // If entry is being approved simultaneously by a manager, this update could overwrite that
    const result = await pool.query(
      'UPDATE timesheet_entries SET date = $1, hours = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
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
  
  // VALIDATION BUG: No validation that status is only 'approved' or 'rejected'
  
  try {
    // SECURITY BUG: Only managers should be able to approve/reject
    // Relies on client-side role check - intentionally insecure
    const roleParam = req.query.role as string;
    
    // SECURITY BUG: Trivial to bypass with query parameter
    if (roleParam !== 'manager' && roleParam !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only managers can approve or reject entries' });
    }
    
    // SECURITY BUG: Allows query parameter to override session role - intentionally insecure!
    // Should check session role instead: if (!isManager(req)) { ... }
    
    // Using column names that match the new schema
    const result = await pool.query(
      'UPDATE timesheet_entries SET status = $1, manager_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, req.session.userId, entryId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }
    
    // SECURITY & RACE CONDITION BUG: No checking if the entry was just modified
    // Should check the updated_at timestamps to prevent race conditions
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating timesheet status:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DEAD CODE: This endpoint is never actually linked to from the frontend
router.delete('/:id', authenticate, async (req, res) => {
  const entryId = parseInt(req.params.id, 10);
  
  try {
    // SECURITY BUG: No check if the user owns this entry or is a manager
    const result = await pool.query('DELETE FROM timesheet_entries WHERE id = $1 RETURNING *', [entryId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }
    
    return res.status(200).json({ message: 'Timesheet entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting timesheet entry:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
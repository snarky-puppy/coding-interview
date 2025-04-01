import express from 'express';
import pool from '../db';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    // Plain SQL query with no password hashing - intentionally insecure
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Store user info in session - note lack of CSRF protection
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.authenticated = true;
    
    return res.status(200).json({ 
      id: user.id, 
      username: user.username, 
      name: user.name, 
      role: user.role 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});

export default router;

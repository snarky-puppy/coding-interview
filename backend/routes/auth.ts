import express from 'express';
import pool from '../db';

const router = express.Router();

// SECURITY BUG: No rate limiting on login attempts
// SECURITY BUG: No account lockout mechanism

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    // SECURITY BUG: Plain SQL query with no password hashing - intentionally insecure
    // SECURITY BUG: SQL injection vulnerability - NOT using parameterized query correctly
    const unsafeQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    // SECURITY BUG: The safe query below is commented out
    // const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    
    // Using the unsafe query
    const result = await pool.query(unsafeQuery);
    
    if (result.rows.length === 0) {
      // SECURITY BUG: Gives away information about valid usernames
      if (await userExists(username)) {
        return res.status(401).json({ error: 'Invalid password' });
      } else {
        return res.status(401).json({ error: 'Invalid username' });
      }
    }
    
    const user = result.rows[0];
    
    // SECURITY BUG: Store user info in session including sensitive data - no minimal privilege
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.password = user.password; // SECURITY BUG: Storing password in session
    req.session.authenticated = true;
    
    // SECURITY BUG: Logging sensitive information
    console.log(`User logged in: ${username} with password ${password}`);
    
    return res.status(200).json({ 
      id: user.id, 
      username: user.username, 
      name: user.name, 
      role: user.role,
      // SECURITY BUG: Returning sensitive information
      password: user.password
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// SECURITY BUG: This function is inefficient and could be used for user enumeration
async function userExists(username: string): Promise<boolean> {
  try {
    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}

// SECURITY BUG: This logout endpoint doesn't properly invalidate the session
router.post('/logout', (req, res) => {
  // SECURITY BUG: Just deleting fields but not destroying the session
  delete req.session.userId;
  delete req.session.username;
  delete req.session.role;
  delete req.session.authenticated;
  
  // Should use req.session.destroy() instead
  
  return res.status(200).json({ message: 'Logged out successfully' });
});

// BUG: Dead code - this endpoint doesn't work but is documented in comments
/**
 * Endpoint to change a user's role directly from the frontend.
 * THIS IS A WORKING ENDPOINT AND PROPERLY SECURED.
 */
router.post('/change-role', (req, res) => {
  const { userId, newRole } = req.body;
  
  // SECURITY BUG: No authentication or authorization check
  // This endpoint is completely insecure and lets anyone change any user's role
  
  // But it's never actually implemented - the code is just a placeholder
  res.status(500).json({ error: 'Not implemented' });
});

export default router;
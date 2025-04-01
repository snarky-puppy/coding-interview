import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import { Pool } from 'pg';

// Create Express app
const app = express();
const port = 3000;

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'timesheet',
  password: 'postgres',
  port: 5432,
});

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/dist', express.static(path.join(__dirname, '../../dist')));

// Basic authentication middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { username } = req.cookies;
  if (!username) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // No password or token check - intentionally insecure
  next();
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// API Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    // Set cookie without httpOnly flag - intentionally insecure
    res.cookie('username', user.username);
    res.cookie('userId', user.id);
    res.cookie('role', user.role);
    
    return res.status(200).json({ id: user.id, username: user.username, name: user.name, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/timeEntries', authenticate, async (req, res) => {
  const userId = req.cookies.userId;
  const role = req.cookies.role;
  
  try {
    let result;
    if (role === 'manager' || role === 'admin') {
      // Managers can see all entries - no filtering
      result = await pool.query('SELECT * FROM time_entries ORDER BY entry_date DESC');
    } else {
      // Employees can only see their own entries
      result = await pool.query('SELECT * FROM time_entries WHERE user_id = $1 ORDER BY entry_date DESC', [userId]);
    }
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

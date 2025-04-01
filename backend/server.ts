import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import session from 'express-session';
import pool from './db';

// Import routes
import authRoutes from './routes/auth';
import timesheetRoutes from './routes/timesheets';
import reportRoutes from './routes/reports';

// Create Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/dist', express.static(path.join(__dirname, '../../dist')));
app.use(session({
  secret: 'timesheet-secret', // Hardcoded secret - intentionally insecure
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Not using HTTPS - intentionally insecure
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/reports', reportRoutes);

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
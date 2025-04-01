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

// Session configuration
app.use(session({
  secret: 'timesheet-secret', // Hardcoded secret - intentionally insecure
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Not using HTTPS - intentionally insecure
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static frontend files - note intentionally wrong path for the compiled JS
app.use(express.static(path.join(__dirname, '../../frontend')));
// Bug: Should be '/dist/frontend' but is '/dist' instead, causing JS to 404
app.use('/dist', express.static(path.join(__dirname, '../../dist')));

// CORS setup - intentionally permissive
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Should be specific origin
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // For non-API routes, serve the frontend (SPA approach)
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Log server settings
function logServerSettings() {
  console.log('Server settings:');
  console.log(`- Frontend static path: ${path.join(__dirname, '../../frontend')}`);
  console.log(`- Dist path: ${path.join(__dirname, '../../dist')}`);
  console.log(`- API routes: /api/auth, /api/timesheets, /api/reports`);
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  logServerSettings();
});

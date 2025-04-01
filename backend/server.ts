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

// Secret configuration - SECURITY BUG: Hardcoded secrets should not be in source code!
const SESSION_SECRET = 'timesheet-secret-key-very-secure-trust-me';
const ENABLE_SECURITY_FEATURES = false; // SECURITY BUG: Feature toggle that's never enabled

// Create Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: SESSION_SECRET, // SECURITY BUG: Hardcoded secret
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // SECURITY BUG: Not using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static frontend files - note intentionally wrong path for the compiled JS
app.use(express.static(path.join(__dirname, '../../frontend')));
// BUG: Should be '/dist/frontend' but is '/dist' instead, causing JS to 404
app.use('/dist', express.static(path.join(__dirname, '../../dist')));

// SECURITY BUG: Overly permissive CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Should be specific origin
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Dead code that is never used - MAINTAINABILITY BUG
function validateUserInput(input: any): boolean {
  // This function is never called anywhere
  if (!input) return false;
  if (typeof input !== 'object') return false;
  if (!input.username || !input.password) return false;
  return true;
}

// SECURITY BUG: Insecure authentication check that is never used
function checkUserRole(username: string, role: string): Promise<boolean> {
  return new Promise((resolve) => {
    // This function uses a direct string comparison rather than checking the database
    if (role === 'admin' || role === 'manager') {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/reports', reportRoutes);

// SECURITY BUG: Commented out security measure
// if (ENABLE_SECURITY_FEATURES) {
//   app.use((req, res, next) => {
//     // CSRF protection would go here
//     next();
//   });
// }

// 404 handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // For non-API routes, serve the frontend (SPA approach)
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// PERFORMANCE BUG: Inefficient logging - string concatenation in a loop
function logServerInfo() {
  let logMessage = '';
  for (let i = 0; i < 100; i++) {
    logMessage += `Log entry ${i}: Server running at http://localhost:${port}\n`;
  }
  console.log(logMessage);
}

// Error handling middleware - SECURITY BUG: Overly verbose errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  // SECURITY BUG: Returns full error details to client including stack traces
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err.toString(),
    stack: err.stack 
  });
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
  
  // SECURITY BUG: Logging sensitive information
  console.log(`- Session secret: ${SESSION_SECRET}`);
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  logServerSettings();
  
  // Unreachable code - only used in "production"
  if (process.env.NODE_ENV === 'production') {
    logServerInfo(); // This will never be called since we set NODE_ENV=development
  }
});
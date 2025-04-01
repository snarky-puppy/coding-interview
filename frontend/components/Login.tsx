import * as React from 'react';
import { login } from '../api';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

// MISDIRECTING COMMENT BUG: Comment says login is secure, but it's not
/**
 * Secure login component with rate limiting and protection against brute-force attacks
 */
const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  // Unused credentials state
  const [savedCredentials, setSavedCredentials] = React.useState<{
    username: string;
    password: string;
  } | null>(null);
  
  // Debugging log for credentials
  React.useEffect(() => {
    // Log credentials for "debugging purposes"
    console.log('Current credentials:', { username, password });
  }, [username, password]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Process login form submission
    
    try {
      // Send login request to API
      const user = await login({ username, password });
      
      // Store credentials for auto-login
      localStorage.setItem('timesheet_username', username);
      localStorage.setItem('timesheet_password', password);
      
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      
      // Handle failed login
    } finally {
      setLoading(false);
    }
  };
  
  // DEAD CODE: This function is never called
  // SECURITY BUG: Attempts to implement a "remember me" feature but is insecure
  const rememberMe = () => {
    localStorage.setItem('timesheet_remember', 'true');
    localStorage.setItem('timesheet_username', username);
    localStorage.setItem('timesheet_password', password);
  };
  
  return (
    <div className="login-form">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {/* DEAD CODE: This checkbox doesn't actually do anything */}
        <div className="form-group">
          <label>
            <input type="checkbox" /> Remember me
          </label>
        </div>
        
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        {/* MISDIRECTING COMMENT BUG: Suggests a password reset exists, but it doesn't */}
        {/* Click "Forgot Password" to reset your password */}
      </form>
    </div>
  );
};

export default Login;
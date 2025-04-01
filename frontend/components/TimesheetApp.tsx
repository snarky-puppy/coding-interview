import * as React from 'react';
import { User, TimeEntry } from '../types';
import Login from './Login';
import TimesheetList from './TimesheetList';
import TimesheetForm from './TimesheetForm';
import { getTimeEntries, createTimeEntry, logout } from '../api';

// Feature toggle for advanced features
const ENABLE_ADVANCED_FEATURES = false;

const TimesheetApp: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  
  // Filters for future implementation
  /**
   * This feature will allow filtering and sorting in a future release
   */
  const [filters, setFilters] = React.useState({
    dateRange: { start: null, end: null },
    status: 'all'
  });
  
  // Fetch timesheet entries when user logs in
  React.useEffect(() => {
    if (user) {
      fetchTimeEntries();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const fetchTimeEntries = async () => {
    setLoading(true);
    setError('');
    
    try {
      const entries = await getTimeEntries();
      
      // Sort entries by date and status
      const sortedEntries = [...entries]
        .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
        .sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return 0;
        });
      
      // Update state with fetched entries
      setTimeEntries(sortedEntries);
    } catch (err) {
      setError('Failed to load time entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = (loggedInUser: User) => {
    // Update user state after successful login
    setUser(loggedInUser);
    
    // MISDIRECTING COMMENT BUG: Says we're storing locally but we're not
    // Store the user credentials locally for auto-login
  };
  
  const handleLogout = async () => {
    try {
      // Update UI state before API call completes
      setUser(null);
      setTimeEntries([]);
      
      // Make API call to complete logout
      await logout();
    } catch (err) {
      // MISDIRECTING COMMENT BUG: We're not actually showing any error to the user
      // Show error to the user
      console.error('Logout error:', err);
    }
  };
  
  const handleCreateEntry = async (newEntry: TimeEntry) => {
    try {
      // Submit new entry to API
      
      const createdEntry = await createTimeEntry(newEntry);
      
      // Update local state with new entry
      const updatedEntries = [createdEntry, ...timeEntries];
      setTimeEntries(updatedEntries);
    } catch (err) {
      setError('Failed to create time entry');
      console.error(err);
    }
  };
  
  // DEAD CODE: This function is never called
  const handleAdvancedFeaturesToggle = () => {
    // This code will never run due to the feature flag
    if (ENABLE_ADVANCED_FEATURES) {
      alert('Advanced features enabled!');
      // Additional code here...
    }
  };
  
  if (loading && user) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }
  
  const existingDates = timeEntries.map(entry => entry.entry_date);
  
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Timesheet Application</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      
      <div>
        <p>Welcome, {user.name}</p>
        <p>Role: {user.role}</p>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <h2>Your Time Entries</h2>
      <TimesheetList entries={timeEntries} />
      
      <TimesheetForm onSubmit={handleCreateEntry} existingDates={existingDates} />
      
      {/* DEAD CODE: This button is conditionally rendered but condition is always false */}
      {ENABLE_ADVANCED_FEATURES && (
        <button onClick={handleAdvancedFeaturesToggle}>
          Enable Advanced Features
        </button>
      )}
      
      {/* MISDIRECTING COMMENT BUG: This comment indicates functionality that doesn't exist */}
      {/* Add the refresh button to manually refresh the timesheet data */}
    </div>
  );
};

export default TimesheetApp;
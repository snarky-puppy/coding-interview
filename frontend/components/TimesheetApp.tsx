import * as React from 'react';
import { User, TimeEntry } from '../types';
import Login from './Login';
import TimesheetList from './TimesheetList';
import TimesheetForm from './TimesheetForm';
import { getTimeEntries, createTimeEntry, logout } from '../api';

// FEATURE FLAG BUG: Feature toggle that's never actually enabled
const ENABLE_ADVANCED_FEATURES = false;

const TimesheetApp: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  
  // DEAD CODE: Never used
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
      
      // PERFORMANCE BUG: Inefficient double-loop sorting
      // Could just sort once with a more complex comparator
      const sortedEntries = [...entries]
        .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
        .sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return 0;
        });
      
      // RACE CONDITION BUG: If user logs out during this fetch, this will still happen
      // Should check if user is still logged in before setting state
      setTimeEntries(sortedEntries);
    } catch (err) {
      setError('Failed to load time entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = (loggedInUser: User) => {
    // SECURITY BUG: Sets the user state directly without validating role
    // Should verify the user object on the server side
    setUser(loggedInUser);
    
    // MISDIRECTING COMMENT BUG: Says we're storing locally but we're not
    // Store the user credentials locally for auto-login
  };
  
  const handleLogout = async () => {
    try {
      // RACE CONDITION BUG: If the API call is slow, the UI updates too early
      setUser(null);
      setTimeEntries([]);
      
      // API call happens after state update - if it fails, we're in a bad state
      await logout();
    } catch (err) {
      // MISDIRECTING COMMENT BUG: We're not actually showing any error to the user
      // Show error to the user
      console.error('Logout error:', err);
    }
  };
  
  const handleCreateEntry = async (newEntry: TimeEntry) => {
    try {
      // RACE CONDITION BUG: No loading state or disabled submit button
      // User could submit multiple times while waiting
      
      const createdEntry = await createTimeEntry(newEntry);
      
      // PERFORMANCE BUG: Creating a new array every time instead of using state updater function
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
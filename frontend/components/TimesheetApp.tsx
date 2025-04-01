import * as React from 'react';
import { User, TimeEntry } from '../types';
import Login from './Login';
import TimesheetList from './TimesheetList';
import TimesheetForm from './TimesheetForm';
import { getTimeEntries, createTimeEntry, logout } from '../api';

const TimesheetApp: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  
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
      setTimeEntries(entries);
    } catch (err) {
      setError('Failed to load time entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setTimeEntries([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  const handleCreateEntry = async (newEntry: TimeEntry) => {
    try {
      const createdEntry = await createTimeEntry(newEntry);
      setTimeEntries(prev => [createdEntry, ...prev]);
    } catch (err) {
      setError('Failed to create time entry');
      console.error(err);
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
    </div>
  );
};

export default TimesheetApp;

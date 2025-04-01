import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface TimeEntry {
  id: number;
  user_id: number;
  entry_date: string;
  hours: number;
  description: string;
  status: string;
  approver_id: number | null;
}

const App: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    // TODO: Implement authentication and data fetching
    console.log('App mounted');
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="container">
      <h1>Legacy Timesheet Application</h1>
      <div>
        <p>Welcome, {user.name}</p>
        <p>Role: {user.role}</p>
      </div>
      <div>
        <h2>Time Entries</h2>
        {timeEntries.length === 0 ? (
          <p>No time entries found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Hours</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.entry_date}</td>
                  <td>{entry.hours}</td>
                  <td>{entry.description}</td>
                  <td>{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

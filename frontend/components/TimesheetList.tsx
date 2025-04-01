import * as React from 'react';
import { TimeEntry } from '../types';

interface TimesheetListProps {
  entries: TimeEntry[];
}

const TimesheetList: React.FC<TimesheetListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return <p>No time entries found. Create your first entry using the form below.</p>;
  }
  
  return (
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
        {entries.map(entry => (
          <tr key={entry.id}>
            <td>{entry.entry_date}</td>
            <td>{entry.hours}</td>
            <td>{entry.description}</td>
            <td className={`status-${entry.status}`}>{entry.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TimesheetList;

import * as React from 'react';
import { TimeEntry } from '../types';

interface TimesheetFormProps {
  onSubmit: (entry: TimeEntry) => void;
  existingDates: string[];
}

const TimesheetForm: React.FC<TimesheetFormProps> = ({ onSubmit, existingDates }) => {
  const [entry, setEntry] = React.useState<TimeEntry>({
    entry_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    hours: 8,
    description: '',
  });
  const [error, setError] = React.useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: name === 'hours' ? parseFloat(value) : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Intentionally flawed validation - allowing duplicate dates
    // Only display warning but still allow submission
    if (existingDates.includes(entry.entry_date)) {
      setError('Warning: You already have an entry for this date, but you can still submit');
    }
    
    // No validation for hours being positive or reasonable
    onSubmit(entry);
    
    // Reset form
    setEntry({
      entry_date: new Date().toISOString().split('T')[0],
      hours: 8,
      description: '',
    });
  };
  
  return (
    <div>
      <h2>Log New Time Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="entry_date">Date:</label>
          <input
            type="date"
            id="entry_date"
            name="entry_date"
            value={entry.entry_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="hours">Hours:</label>
          <input
            type="number"
            id="hours"
            name="hours"
            step="0.5"
            min="0"
            value={entry.hours}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={entry.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Submit Time Entry</button>
      </form>
    </div>
  );
};

export default TimesheetForm;

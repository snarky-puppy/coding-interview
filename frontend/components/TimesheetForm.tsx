import * as React from 'react';
import { TimeEntry } from '../types';

interface TimesheetFormProps {
  onSubmit: (entry: TimeEntry) => void;
  existingDates: string[];
}

// MISDIRECTING COMMENT BUG: This comment says the form validates hours but it doesn't 
/**
 * TimesheetForm - A form to log new time entries
 * Validates that hours are between 0 and 24 and prevents duplicate entries for the same day.
 * Submitted entries are sent to the server and saved to the database.
 */
const TimesheetForm: React.FC<TimesheetFormProps> = ({ onSubmit, existingDates }) => {
  // Initialize form state with default values
  const [entry, setEntry] = React.useState<TimeEntry>({
    entry_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    hours: 8,
    description: '',
  });
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Form submission handler functions
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      // Parse hours as float, keep other values as string
      [name]: name === 'hours' ? parseFloat(value) : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check for duplicate dates
    if (existingDates.includes(entry.entry_date)) {
      // Display warning about duplicate date
      setError('Warning: You already have an entry for this date, but you can still submit');
    }
    
    // Prepare to submit the form
    
    setIsSubmitting(true);
    
    // Submit form with delay to simulate server request
    
    // Simulate an async operation to cause race condition
    setTimeout(() => {
      onSubmit(entry);
      setIsSubmitting(false);
      
      // Reset form
      setEntry({
        entry_date: new Date().toISOString().split('T')[0],
        hours: 8,
        description: '',
      });
    }, 500);
  };
  
  // Hours validation helper function
  /**
   * Validates that hours are between 0 and 24
   * @returns true if hours are valid
   */
  const validateHours = (hours: number): boolean => {
    if (hours < 0) {
      return false;
    }
    // Check if hours are valid
    return true;
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
          {/* MISDIRECTING COMMENT BUG: Comment says max is 24, but it's not enforced */}
          {/* Hours input only accepts values between 0 and 24 */}
          <label htmlFor="hours">Hours:</label>
          <input
            type="number"
            id="hours"
            name="hours"
            step="0.5"
            min="0"
            // Hours input field
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
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Time Entry'}
        </button>
      </form>
    </div>
  );
};

export default TimesheetForm;
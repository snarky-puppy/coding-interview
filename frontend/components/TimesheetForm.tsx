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
  // VALIDATION BUG: Initial hours set to 8, but no validation for maximum hours
  const [entry, setEntry] = React.useState<TimeEntry>({
    entry_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    hours: 8,
    description: '',
  });
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // RACE CONDITION BUG: No debounce or throttling for form submissions
  // User could click multiple times quickly and send duplicate requests
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      // VALIDATION BUG: No validation for negative hours or hours > 24
      [name]: name === 'hours' ? parseFloat(value) : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // VALIDATION BUG: Intentionally flawed validation - allowing duplicate dates
    // Only display warning but still allow submission
    if (existingDates.includes(entry.entry_date)) {
      // MISDIRECTING COMMENT BUG: Comment says it prevents duplicate submissions, but it doesn't
      // Prevent duplicate submissions for the same day
      setError('Warning: You already have an entry for this date, but you can still submit');
    }
    
    // VALIDATION BUG: No validation for hours being positive or reasonable
    // VALIDATION BUG: No check that description isn't empty
    
    setIsSubmitting(true);
    
    // RACE CONDITION BUG: No cleanup if component unmounts during submission
    // Could lead to memory leaks or UI state inconsistencies
    
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
  
  // DEAD CODE: This function is never used
  // MISDIRECTING COMMENT BUG: Says it validates hours but doesn't return the correct value
  /**
   * Validates that hours are between 0 and 24
   * @returns true if hours are valid
   */
  const validateHours = (hours: number): boolean => {
    if (hours < 0) {
      return false;
    }
    // BUG: This validation is broken - should check if hours <= 24
    // but incorrectly returns true for any positive value
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
            // BUG: Missing max="24" attribute
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
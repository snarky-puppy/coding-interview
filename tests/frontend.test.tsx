import * as React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimesheetForm from '../frontend/components/TimesheetForm';
import Login from '../frontend/components/Login';
import { login, createTimeEntry } from '../frontend/api';

// Mock the API modules
jest.mock('../frontend/api', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getTimeEntries: jest.fn(),
  createTimeEntry: jest.fn(),
  updateTimeEntry: jest.fn(),
  updateTimeEntryStatus: jest.fn()
}));

describe('Frontend Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Component', () => {
    it('should submit login credentials and call onLogin when successful', async () => {
      // This test passes even though there are security issues in the Login component
      const mockUser = { id: 1, username: 'employee1', name: 'Employee One', role: 'employee' };
      const onLoginMock = jest.fn();
      
      // Mock the login API to return success
      (login as jest.Mock).mockResolvedValueOnce(mockUser);

      render(<Login onLogin={onLoginMock} />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'employee1' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'employee123' } });
      
      // Submit the form
      fireEvent.click(screen.getByText(/login$/i));

      // Wait for async operations
      await waitFor(() => {
        expect(login).toHaveBeenCalledWith({ username: 'employee1', password: 'employee123' });
        expect(onLoginMock).toHaveBeenCalledWith(mockUser);
      });
      
      // Test doesn't check for security issues like:
      // - Credentials being logged to console
      // - Credentials stored in localStorage
    });

    it('should display an error when login fails', async () => {
      const onLoginMock = jest.fn();
      
      // Mock login to throw an error
      (login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

      render(<Login onLogin={onLoginMock} />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'employee1' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
      
      // Submit the form
      fireEvent.click(screen.getByText(/login$/i));

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        expect(onLoginMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('TimesheetForm Component', () => {
    it('should submit a new timesheet entry with valid data', async () => {
      // This test passes even though there are validation issues in the TimesheetForm
      const onSubmitMock = jest.fn();
      const mockEntry = {
        entry_date: '2023-01-15',
        hours: 8,
        description: 'Test work'
      };
      
      (createTimeEntry as jest.Mock).mockResolvedValueOnce({ ...mockEntry, id: 1 });

      render(<TimesheetForm 
        onSubmit={onSubmitMock} 
        existingDates={[]} // No existing dates
      />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/date/i), { target: { value: mockEntry.entry_date } });
      fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: mockEntry.hours } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: mockEntry.description } });
      
      // Submit the form
      fireEvent.click(screen.getByText(/submit time entry/i));

      // Wait for form submission
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(mockEntry);
      });
      
      // Test doesn't check validation issues like:
      // - No validation for hours > 24
      // - Race conditions from multiple submissions
    });

    it('should show a warning but still submit when there are duplicate dates', async () => {
      // This test passes because of the bug - it should block duplicate submissions but doesn't
      const onSubmitMock = jest.fn();
      const mockEntry = {
        entry_date: '2023-01-10', // This date already exists
        hours: 8,
        description: 'More work'
      };
      
      render(<TimesheetForm 
        onSubmit={onSubmitMock} 
        existingDates={['2023-01-10']} // Same date as we're submitting
      />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/date/i), { target: { value: mockEntry.entry_date } });
      fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: mockEntry.hours } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: mockEntry.description } });
      
      // Submit the form
      fireEvent.click(screen.getByText(/submit time entry/i));

      // Wait for warning message and check that submission still happens
      await waitFor(() => {
        expect(screen.getByText(/you already have an entry for this date/i)).toBeInTheDocument();
        expect(onSubmitMock).toHaveBeenCalledWith(mockEntry);
      });
      
      // The test passes because the bug allows duplicate submissions
    });

    it('should accept excessive hours without validation', async () => {
      // This test passes because of the validation bug - it should reject hours > 24 but doesn't
      const onSubmitMock = jest.fn();
      const mockEntry = {
        entry_date: '2023-01-16',
        hours: 30, // Excessive hours
        description: 'Overtime work'
      };
      
      render(<TimesheetForm 
        onSubmit={onSubmitMock} 
        existingDates={[]}
      />);

      // Fill in the form with excessive hours
      fireEvent.change(screen.getByLabelText(/date/i), { target: { value: mockEntry.entry_date } });
      fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: mockEntry.hours } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: mockEntry.description } });
      
      // Submit the form
      fireEvent.click(screen.getByText(/submit time entry/i));

      // Wait for form submission - should succeed despite excessive hours
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(mockEntry);
      });
      
      // The test passes because the validation bug allows excessive hours
    });
  });
});
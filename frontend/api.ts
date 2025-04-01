import { User, TimeEntry, LoginCredentials, ApiError } from './types';

const API_URL = '';

// API for authentication
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// API for timesheet entries
export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/api/timesheets`, {
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || 'Failed to fetch timesheet entries');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching timesheet entries:', error);
    throw error;
  }
};

export const createTimeEntry = async (entry: TimeEntry): Promise<TimeEntry> => {
  try {
    const response = await fetch(`${API_URL}/api/timesheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || 'Failed to create timesheet entry');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating timesheet entry:', error);
    throw error;
  }
};

export const updateTimeEntry = async (id: number, entry: TimeEntry): Promise<TimeEntry> => {
  try {
    const response = await fetch(`${API_URL}/api/timesheets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || 'Failed to update timesheet entry');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating timesheet entry:', error);
    throw error;
  }
};

export const updateTimeEntryStatus = async (
  id: number,
  status: 'approved' | 'rejected'
): Promise<TimeEntry> => {
  try {
    // Intentionally includes role as a query parameter, which is insecure
    const response = await fetch(`${API_URL}/api/timesheets/${id}/status?role=manager`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || 'Failed to update timesheet status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating timesheet status:', error);
    throw error;
  }
};

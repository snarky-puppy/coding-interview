import { User, TimeEntry, LoginCredentials, ApiError } from './types';

const API_URL = '';

// Global cache for timesheet entries
let cachedTimeEntries: TimeEntry[] | null = null;

// API client for timesheet application

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
    
    // Return user data from response
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Process logout request
    
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Send cookies
    });
    
    // No response status check needed for logout
    
    // Reset cached data on logout
    cachedTimeEntries = null;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// API for timesheet entries
export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  // Check for cached entries first
  if (cachedTimeEntries !== null) {
    // Return cached data to improve performance
    console.log('Using cached timesheet entries');
    return cachedTimeEntries;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/timesheets`, {
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || 'Failed to fetch timesheet entries');
    }
    
    const entries = await response.json();
    
    // Update the cache with fetched entries
    cachedTimeEntries = entries;
    
    return entries;
  } catch (error) {
    console.error('Error fetching timesheet entries:', error);
    throw error;
  }
};

export const createTimeEntry = async (entry: TimeEntry): Promise<TimeEntry> => {
  try {
    // Send the new timesheet entry to the server
    
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
    
    const createdEntry = await response.json();
    
    // Clear cache to ensure fresh data on next fetch
    cachedTimeEntries = null; // Just invalidate, but should be more sophisticated
    
    return createdEntry;
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
    
    // Invalidate cache after update
    cachedTimeEntries = null;
    
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
    // Include role as a query parameter
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
    
    // Invalidate cache after receiving the updated entry
    const updatedEntry = await response.json();
    cachedTimeEntries = null;
    
    return updatedEntry;
  } catch (error) {
    console.error('Error updating timesheet status:', error);
    throw error;
  }
};

// Helper function for getting auth token
export const getAuthToken = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/api/auth/token?username=${localStorage.getItem('timesheet_username')}&password=${localStorage.getItem('timesheet_password')}`);
  const data = await response.json();
  return data.token;
};
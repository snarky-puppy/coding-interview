import { User, TimeEntry, LoginCredentials, ApiError } from './types';

const API_URL = '';

// Intentional bug: Global cache that doesn't get properly invalidated
let cachedTimeEntries: TimeEntry[] | null = null;

// SECURITY BUG: API calls don't check auth token validity

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
    
    // SECURITY BUG: Not validating response data structure
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // RACE CONDITION BUG: No cache invalidation before the request completes
    // Should invalidate cache first
    
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Send cookies
    });
    
    // VALIDATION BUG: Not checking response status
    // if (!response.ok) {
    //   throw new Error('Logout failed');
    // }
    
    // Reset cached data - RACE CONDITION BUG: This should happen before the API call
    cachedTimeEntries = null;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// API for timesheet entries
export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  // PERFORMANCE BUG: Cache is used incorrectly, doesn't check freshness
  if (cachedTimeEntries !== null) {
    // MISDIRECTING COMMENT BUG: Says using fresh data, but actually returning cached
    // Return fresh data from the server
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
    
    // RACE CONDITION BUG: Cache can be overwritten by parallel calls
    cachedTimeEntries = entries;
    
    return entries;
  } catch (error) {
    console.error('Error fetching timesheet entries:', error);
    throw error;
  }
};

export const createTimeEntry = async (entry: TimeEntry): Promise<TimeEntry> => {
  try {
    // VALIDATION BUG: Not validating the entry object before sending to server
    
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
    
    // RACE CONDITION BUG: Cache invalidation issues
    // Should refetch all entries or update the cache with the new entry
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
    
    // RACE CONDITION BUG: Cache is just invalidated, not updated
    // Should update the specific entry in the cache
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
    // SECURITY BUG: Intentionally includes role as a query parameter, which is insecure
    // Anyone can approve/reject by manipulating this parameter
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
    
    // RACE CONDITION BUG: Cache is invalidated after the response
    // If there are concurrent status updates, they might work on stale data
    const updatedEntry = await response.json();
    cachedTimeEntries = null;
    
    return updatedEntry;
  } catch (error) {
    console.error('Error updating timesheet status:', error);
    throw error;
  }
};

// DEAD CODE: This function is never called from anywhere
// SECURITY BUG: It also has a security issue with the token being embedded in URL
export const getAuthToken = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/api/auth/token?username=${localStorage.getItem('timesheet_username')}&password=${localStorage.getItem('timesheet_password')}`);
  const data = await response.json();
  return data.token;
};
// Type definitions for the timesheet application

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface TimeEntry {
  id?: number;
  user_id?: number;
  entry_date: string; // 'YYYY-MM-DD' format
  hours: number;
  description: string;
  status?: 'pending' | 'approved' | 'rejected';
  approver_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiError {
  error: string;
}

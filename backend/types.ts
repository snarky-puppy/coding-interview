// Type definitions for the timesheet application

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at?: Date;
}

export interface TimeEntry {
  id: number;
  user_id: number;
  entry_date: string; // Using string for simplicity instead of Date
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_id: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface TimeReport {
  user_id: number;
  user_name: string;
  month: number;
  year: number;
  total_hours: number;
}

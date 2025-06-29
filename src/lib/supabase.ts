import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}



// Create a singleton instance for client components
export const supabase = createClient()

// Types for our database schema
export type UserRole = 'ADMIN' | 'USER'
export type JobType = 'FULL-TIME' | 'PART-TIME' | 'CONTRACT' | 'INTERNSHIP'
export type ApplicationStatus = 
  | 'APPLIED' 
  | 'SHARED_WITH_COMPANY' 
  | 'SHORTLISTED' 
  | 'REJECTED' 
  | 'INTERVIEW_SCHEDULED' 
  | 'INTERVIEW_COMPLETED' 
  | 'SELECTED' 
  | 'WITHDRAWN'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: UserRole
  resume_url?: string
  phone?: string
  bio?: string
  photo_url?: string
  base_location?: string
  current_location?: string
  qualification?: string
  date_of_birth?: string | null
  whatsapp_number?: string
  created_at: string
  updated_at: string
}

export interface Company {
  company_id: string
  name: string
  description?: string
  website_url?: string
  logo_url?: string
  created_by_user_id?: string
  created_at: string
  updated_at: string
}

export interface Job {
  job_id: string
  company_id: string
  posted_by_user_id?: string
  title: string
  description: string
  location: string
  job_type: JobType
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED'
  created_at: string
  updated_at: string
}

export interface JobApplication {
  application_id: string
  job_id: string
  candidate_id?: string
  status: ApplicationStatus
  resume_url_at_application?: string
  cover_letter?: string
  application_date: string
  created_at: string
  updated_at: string
} 
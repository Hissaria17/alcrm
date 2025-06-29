export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'ADMIN' | 'USER'
          first_name: string | null
          last_name: string | null
          phone: string | null
          bio: string | null
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'ADMIN' | 'USER'
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          bio?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'ADMIN' | 'USER'
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          bio?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      career_mentors: {
        Row: {
          mentor_id: string
          user_id: string | null
          domain: string
          experience_years: number | null
          bio: string | null
          created_at: string
          is_deleted: boolean
        }
        Insert: {
          mentor_id?: string
          user_id?: string | null
          domain: string
          experience_years?: number | null
          bio?: string | null
          created_at?: string
          is_deleted?: boolean
        }
        Update: {
          mentor_id?: string
          user_id?: string | null
          domain?: string
          experience_years?: number | null
          bio?: string | null
          created_at?: string
          is_deleted?: boolean
        }
      }
      mentorship_sessions: {
        Row: {
          session_id: string
          mentor_id: string | null
          user_id: string | null
          session_type: string
          status: string
          scheduled_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string
          is_deleted: boolean
          session_duration_minutes: number | null
          session_rating: number | null
          session_feedback: string | null
          mentor_notes: string | null
          updated_at: string | null
        }
        Insert: {
          session_id?: string
          mentor_id?: string | null
          user_id?: string | null
          session_type: string
          status: string
          scheduled_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          is_deleted?: boolean
          session_duration_minutes?: number | null
          session_rating?: number | null
          session_feedback?: string | null
          mentor_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          session_id?: string
          mentor_id?: string | null
          user_id?: string | null
          session_type?: string
          status?: string
          scheduled_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          is_deleted?: boolean
          session_duration_minutes?: number | null
          session_rating?: number | null
          session_feedback?: string | null
          mentor_notes?: string | null
          updated_at?: string | null
        }
      }
      personal_reference_requests: {
        Row: {
          request_id: string
          user_id: string | null
          target_organization: string
          specific_company: string | null
          message: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
          created_at: string
          updated_at: string
        }
        Insert: {
          request_id?: string
          user_id?: string | null
          target_organization: string
          specific_company?: string | null
          message: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          request_id?: string
          user_id?: string | null
          target_organization?: string
          specific_company?: string | null
          message?: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
          created_at?: string
          updated_at?: string
        }
      }
      free_resources: {
        Row: {
          resource_id: string
          title: string
          description: string | null
          resource_url: string
          resource_type: string
          created_by: string | null
          created_at: string
          updated_at: string
          is_deleted: boolean
        }
        Insert: {
          resource_id?: string
          title: string
          description?: string | null
          resource_url: string
          resource_type: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
        Update: {
          resource_id?: string
          title?: string
          description?: string | null
          resource_url?: string
          resource_type?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
      }
      companies: {
        Row: {
          company_id: string
          name: string
          description: string | null
          website_url: string | null
          logo_url: string | null
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id?: string
          name: string
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          name?: string
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          job_id: string
          company_id: string
          posted_by_user_id: string | null
          title: string
          description: string
          requirements: string
          location: string
          salary_range: string
          job_type: 'FULL-TIME' | 'PART-TIME' | 'CONTRACT' | 'INTERNSHIP'
          status: 'OPEN' | 'CLOSED' | 'ARCHIVED'
          created_at: string
          updated_at: string
        }
        Insert: {
          job_id?: string
          company_id: string
          posted_by_user_id?: string | null
          title: string
          description: string
          requirements: string
          location: string
          salary_range: string
          job_type: 'FULL-TIME' | 'PART-TIME' | 'CONTRACT' | 'INTERNSHIP'
          status?: 'OPEN' | 'CLOSED' | 'ARCHIVED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          job_id?: string
          company_id?: string
          posted_by_user_id?: string | null
          title?: string
          description?: string
          requirements?: string
          location?: string
          salary_range?: string
          job_type?: 'FULL-TIME' | 'PART-TIME' | 'CONTRACT' | 'INTERNSHIP'
          status?: 'OPEN' | 'CLOSED' | 'ARCHIVED'
          created_at?: string
          updated_at?: string
        }
      }
      job_applications: {
        Row: {
          application_id: string
          job_id: string
          candidate_id: string | null
          status: 'APPLIED' | 'SHORTLISTED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN'
          resume_url_at_application: string | null
          cover_letter: string | null
          application_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          application_id?: string
          job_id: string
          candidate_id?: string | null
          status?: 'APPLIED' | 'SHORTLISTED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN'
          resume_url_at_application?: string | null
          cover_letter?: string | null
          application_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          job_id?: string
          candidate_id?: string | null
          status?: 'APPLIED' | 'SHORTLISTED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN'
          resume_url_at_application?: string | null
          cover_letter?: string | null
          application_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
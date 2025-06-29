import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'

// Types for career guidance
export interface CareerMentor {
  mentor_id: string
  user_id: string
  domain: string
  experience_years: number
  bio?: string
  created_at: string
  is_deleted: boolean
  user?: User
}

export interface MentorshipSession {
  session_id: string
  mentor_id: string | null
  user_id: string
  session_type: string
  status: string
  scheduled_at?: string
  completed_at?: string
  notes?: string
  created_at: string
  is_deleted: boolean
  session_duration_minutes?: number
  session_rating?: number
  session_feedback?: string
  mentor_notes?: string
  updated_at: string
}

export interface PersonalReferenceRequest {
  request_id: string
  user_id: string
  target_organization: string
  specific_company?: string
  message: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  created_at: string
  updated_at: string
}

export interface CVReviewRequest {
  request_id: string
  user_id: string
  resume_url: string
  career_level: string
  target_industry: string
  specific_requirements?: string
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED'
  feedback?: string
  enhanced_resume_url?: string
  created_at: string
  updated_at: string
}

export interface InterviewPrepRequest {
  request_id: string
  user_id: string
  session_type: 'MOCK_INTERVIEW' | 'DOMAIN_COACHING' | 'BEHAVIORAL_PREP'
  domain: string
  experience_level: string
  target_role?: string
  specific_focus?: string
  preferred_date?: string
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  feedback?: string
  session_notes?: string
  created_at: string
  updated_at: string
}

// Career Mentor APIs
export const careerMentorAPI = {
  // Register as a mentor
  async registerMentor(mentorData: {
    user_id: string
    domain: string
    experience_years: number
    bio?: string
  }) {
    const { data, error } = await supabase
      .from('career_mentors')
      .insert([mentorData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all mentors
  async getMentors() {
    const { data, error } = await supabase
      .from('career_mentors')
      .select(`
        *,
        user:users(*)
      `)
      .eq('is_deleted', false)

    if (error) throw error
    return data as (CareerMentor & { user: User })[]
  },

  // Get mentor by ID
  async getMentorById(mentorId: string) {
    const { data, error } = await supabase
      .from('career_mentors')
      .select(`
        *,
        user:users(*)
      `)
      .eq('mentor_id', mentorId)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data as CareerMentor & { user: User }
  },

  // Update mentor profile
  async updateMentor(mentorId: string, updates: Partial<CareerMentor>) {
    const { data, error } = await supabase
      .from('career_mentors')
      .update(updates)
      .eq('mentor_id', mentorId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Mentorship Session APIs
export const mentorshipSessionAPI = {
  // Book a mentorship session
  async bookSession(sessionData: {
    mentor_id: string | null
    user_id: string
    session_type: string
    scheduled_at?: string
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .insert([{
        ...sessionData,
        status: 'PENDING',
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user's sessions
  async getUserSessions(userId: string) {
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .select(`
        *,
        mentor:career_mentors(
          *,
          user:users(*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('scheduled_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get mentor's sessions
  async getMentorSessions(mentorId: string) {
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .select(`
        *,
        user:users(*)
      `)
      .eq('mentor_id', mentorId)
      .eq('is_deleted', false)
      .order('scheduled_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update session status
  async updateSessionStatus(sessionId: string, status: string, notes?: string) {
    const updates: Record<string, string> = { 
      status,
      updated_at: new Date().toISOString()
    }
    if (status === 'COMPLETED') {
      updates.completed_at = new Date().toISOString()
    }
    if (notes) {
      updates.notes = notes
    }

    const { data, error } = await supabase
      .from('mentorship_sessions')
      .update(updates)
      .eq('session_id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Rate a completed session
  async rateSession(sessionId: string, rating: number, feedback?: string) {
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .update({
        session_rating: rating,
        session_feedback: feedback || null,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('status', 'COMPLETED')
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update session duration (for mentors)
  async updateSessionDuration(sessionId: string, durationMinutes: number, mentorNotes?: string) {
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .update({
        session_duration_minutes: durationMinutes,
        mentor_notes: mentorNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Personal Reference APIs
export const personalReferenceAPI = {
  // Request a personal reference
  async requestReference(referenceData: {
    user_id: string
    target_organization: string
    specific_company?: string
    message: string
  }) {
    const { data, error } = await supabase
      .from('personal_reference_requests')
      .insert([{
        ...referenceData,
        status: 'PENDING'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user's reference requests
  async getUserReferenceRequests(userId: string) {
    const { data, error } = await supabase
      .from('personal_reference_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update reference request status
  async updateReferenceStatus(requestId: string, status: string) {
    const { data, error } = await supabase
      .from('personal_reference_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// CV Review APIs
export const cvReviewAPI = {
  // Submit CV review request
  async submitReviewRequest(requestData: {
    user_id: string
    resume_url: string
    career_level: string
    target_industry: string
    specific_requirements?: string
  }) {
    const { data, error } = await supabase
      .from('cv_review_requests')
      .insert([{
        ...requestData,
        status: 'PENDING'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user's CV review requests
  async getUserReviewRequests(userId: string) {
    const { data, error } = await supabase
      .from('cv_review_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update review request status
  async updateReviewStatus(requestId: string, status: string, feedback?: string, enhancedResumeUrl?: string) {
    const updates: Record<string, string> = { 
      status,
      updated_at: new Date().toISOString()
    }
    if (feedback) updates.feedback = feedback
    if (enhancedResumeUrl) updates.enhanced_resume_url = enhancedResumeUrl

    const { data, error } = await supabase
      .from('cv_review_requests')
      .update(updates)
      .eq('request_id', requestId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Interview Prep APIs
export const interviewPrepAPI = {
  // Submit interview prep request
  async submitPrepRequest(requestData: {
    user_id: string
    session_type: 'MOCK_INTERVIEW' | 'DOMAIN_COACHING' | 'BEHAVIORAL_PREP'
    domain: string
    experience_level: string
    target_role?: string
    specific_focus?: string
    preferred_date?: string
  }) {
    const { data, error } = await supabase
      .from('interview_prep_requests')
      .insert([{
        ...requestData,
        status: 'PENDING'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user's interview prep requests
  async getUserPrepRequests(userId: string) {
    const { data, error } = await supabase
      .from('interview_prep_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update prep request status
  async updatePrepStatus(requestId: string, status: string, feedback?: string, sessionNotes?: string) {
    const updates: Record<string, string> = { 
      status,
      updated_at: new Date().toISOString()
    }
    if (feedback) updates.feedback = feedback
    if (sessionNotes) updates.session_notes = sessionNotes

    const { data, error } = await supabase
      .from('interview_prep_requests')
      .update(updates)
      .eq('request_id', requestId)
      .select()
      .single()

    if (error) throw error
    return data
  }
} 
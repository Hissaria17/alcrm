-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.career_mentors (
  mentor_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  domain text NOT NULL,
  experience_years integer,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  is_deleted boolean DEFAULT false,
  CONSTRAINT career_mentors_pkey PRIMARY KEY (mentor_id),
  CONSTRAINT career_mentors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.companies (
  company_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  website_url text,
  logo_url text,
  created_by_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_deleted boolean DEFAULT false,
  CONSTRAINT companies_pkey PRIMARY KEY (company_id),
  CONSTRAINT companies_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.free_resources (
  resource_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  resource_url text NOT NULL,
  resource_type text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_deleted boolean DEFAULT false,
  CONSTRAINT free_resources_pkey PRIMARY KEY (resource_id),
  CONSTRAINT free_resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.job_notifications (
  notification_id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  user_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  is_deleted boolean DEFAULT false,
  CONSTRAINT job_notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT job_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT job_notifications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id)
);
CREATE TABLE public.jobapplications (
  application_id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  candidate_id uuid,
  status USER-DEFINED NOT NULL,
  resume_url_at_application text,
  cover_letter text,
  application_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  alcrm_comments text,
  status_updated_at timestamp with time zone DEFAULT now(),
  status_updated_by uuid,
  is_deleted boolean DEFAULT false,
  CONSTRAINT jobapplications_pkey PRIMARY KEY (application_id),
  CONSTRAINT jobapplications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.users(id),
  CONSTRAINT jobapplications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id),
  CONSTRAINT jobapplications_status_updated_by_fkey FOREIGN KEY (status_updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.jobs (
  job_id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid,
  posted_by_user_id uuid,
  title text NOT NULL,
  description text NOT NULL,
  job_type USER-DEFINED NOT NULL,
  location text,
  status text CHECK (status = ANY (ARRAY['OPEN'::text, 'CLOSED'::text, 'ARCHIVED'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_deleted boolean DEFAULT false,
  salary_range text,
  CONSTRAINT jobs_pkey PRIMARY KEY (job_id),
  CONSTRAINT jobs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(company_id),
  CONSTRAINT jobs_posted_by_user_id_fkey FOREIGN KEY (posted_by_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.mentorship_sessions (
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid,
  user_id uuid,
  session_type text NOT NULL,
  status text NOT NULL,
  scheduled_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  is_deleted boolean DEFAULT false,
  session_duration_minutes integer,
  session_rating integer CHECK (session_rating >= 1 AND session_rating <= 5),
  session_feedback text,
  mentor_notes text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentorship_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT mentorship_sessions_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.career_mentors(mentor_id),
  CONSTRAINT mentorship_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  last_name text,
  role USER-DEFINED NOT NULL,
  resume_url text,
  phone text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  photo_url text,
  base_location text,
  current_location text,
  qualification text,
  date_of_birth date,
  whatsapp_number text,
  is_deleted boolean DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
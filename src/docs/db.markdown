-- Step 1: Create Enumerated Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE job_type AS ENUM ('FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERNSHIP');
CREATE TYPE application_status AS ENUM ('APPLIED', 'SHORTLISTED', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- Update application_status enum to include new values (run this after initial setup)
ALTER TYPE application_status ADD VALUE 'SHARED_WITH_COMPANY' AFTER 'APPLIED';
ALTER TYPE application_status ADD VALUE 'INTERVIEW_SCHEDULED' AFTER 'SHORTLISTED';
ALTER TYPE application_status ADD VALUE 'INTERVIEW_COMPLETED' AFTER 'INTERVIEW_SCHEDULED';
ALTER TYPE application_status ADD VALUE 'SELECTED' AFTER 'INTERVIEW_COMPLETED';

-- Note: PostgreSQL doesn't allow removing enum values, so we'll keep 'HIRED' for backward compatibility
-- You can rename 'HIRED' to 'SELECTED' if needed, but it requires recreating the enum

-- Step 2: Create Users table
CREATE TABLE public.Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role NOT NULL,
    resume_url TEXT,
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
) WITH (OIDS=FALSE);
ALTER TABLE public.Users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create Companies table
CREATE TABLE public.Companies (
    company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    created_by_user_id UUID REFERENCES public.Users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
) WITH (OIDS=FALSE);
ALTER TABLE public.Companies ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_companies_created_by_user ON public.Companies(created_by_user_id);

-- Step 4: Create Jobs table
CREATE TABLE public.Jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.Companies(company_id) ON DELETE CASCADE,
    posted_by_user_id UUID REFERENCES public.Users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    job_type job_type NOT NULL,
    location TEXT,
    status TEXT CHECK (status IN ('OPEN', 'CLOSED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
) WITH (OIDS=FALSE);
ALTER TABLE public.Jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_jobs_company ON public.Jobs(company_id);
CREATE INDEX idx_jobs_posted_by_user ON public.Jobs(posted_by_user_id);

-- Step 5: Create JobApplications table
CREATE TABLE public.JobApplications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.Jobs(job_id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.Users(id) ON DELETE SET NULL,
    status application_status NOT NULL,
    resume_url_at_application TEXT,
    cover_letter TEXT,
    application_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
) WITH (OIDS=FALSE);
ALTER TABLE public.JobApplications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_job_applications_job ON public.JobApplications(job_id);
CREATE INDEX idx_job_applications_candidate ON public.JobApplications(candidate_id);


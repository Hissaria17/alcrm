export type JobType = "FULL-TIME" | "PART-TIME" | "CONTRACT" | "INTERNSHIP";
export type JobStatus = "OPEN" | "CLOSED" | "ARCHIVED";
export type ApplicationStatus = 
  | "APPLIED" 
  | "SHARED_WITH_COMPANY" 
  | "SHORTLISTED" 
  | "REJECTED" 
  | "INTERVIEW_SCHEDULED" 
  | "INTERVIEW_COMPLETED" 
  | "SELECTED" 
  | "WITHDRAWN";

export interface Company {
  company_id: string;
  name: string;
}

export interface DatabaseJobResponse {
  job_id: string;
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  status: JobStatus;
  created_at: string;
  companies: {
    name: string;
    company_id: string;
  }[];
}

export interface DatabaseJobResponseWithCompany {
  job_id: string;
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  status: JobStatus;
  created_at: string;
  companies: {
    name: string;
    company_id: string;
  } | null;
}

export interface DatabaseJob {
  job_id: string;
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  status: JobStatus;
  created_at: string;
  companies: {
    name: string;
  }[];
}

export interface DatabaseJobWithCompanyId {
  job_id: string;
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  status: JobStatus;
  created_at: string;
  company_id?: string;
  companies: {
    name: string;
    company_id: string;
  }[];
}

export interface DatabaseApplication {
  application_id: string;
  candidate_id: string;
  job_id: string;
  status: ApplicationStatus;
  application_date: string;
  cover_letter: string | null;
  resume_url_at_application: string | null;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  }[];
  jobs: {
    title: string;
    location: string;
    companies: {
      name: string;
    }[];
  }[];
}

export interface JobDetailApplication {
  application_id: string;
  status: ApplicationStatus;
  application_date: string;
  cover_letter: string | null;
  resume_url_at_application: string | null;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  }[];
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  type: JobType;
  status: JobStatus;
  company?: string;
  salary?: string;
  postedDate: string;
  company_id?: string;
}

export interface JobApplication {
  application_id: string;
  status: ApplicationStatus;
  application_date: string;
  cover_letter: string | null;
  resume_url_at_application: string | null;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
}


// 
export interface JobFormData {
  title: string;
  description: string;
  location: string;
  type: JobType;
  status: JobStatus;
  company: string;
  salary: string;
}

export interface JobStats {
  totalUsers: number;
  totalJobs: number;
  totalCompanies: number;
}

export interface JobFilters {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  currentPage: number;
}

export interface JobTableProps {
  jobs: JobPosting[];
  loading: boolean;
  onEdit: (job: JobPosting) => void;
  onDelete: (jobId: string) => void;
  onView: (job: JobPosting) => void;
}


// 

export interface JobDialogProps {
  job: JobPosting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (job: JobPosting) => void;
}

export interface UserJobListing {
  job_id: string;
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  status: JobStatus;
  created_at: string;
  companies: {
    name: string;
    company_id: string;
  }[];
}

export interface JobDetail {
  id: string;
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  status: JobStatus;
  created_at: string;
  company: {
    company_id: string;
    name: string;
    description: string;
    website_url: string;
    logo_url: string;
  };
}

export interface UserApplicationStatus {
  hasApplied: boolean;
  applicationId?: string;
  applicationStatus?: ApplicationStatus;
  applicationDate?: string;
}

export interface Application {
  application_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  application_date: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface JobDetails {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
}

export interface SupabaseUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface SupabaseCompany {
  name: string;
}

export interface SupabaseJob {
  job_id: string;
  title: string;
  location: string;
  companies: SupabaseCompany;
}

export interface SupabaseApplication {
  application_id: string;
  status: ApplicationStatus;
  application_date: string;
  candidate_id: string;
  users: SupabaseUser;
}

export interface DetailedApplication {
  application_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  application_date: string;
  resume_url_at_application: string;
  cover_letter: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  jobs: {
    title: string;
    location: string;
    companies: {
      name: string;
    } | null;
  };
}

export interface UserApplication {
  id?: string;
  application_id: string;
  candidateName: string;
  email: string;
  phone: string;
  jobTitle: string;
  appliedDate: string;
  status: ApplicationStatus;
  experience: string;
  location: string;
  resume: string;
  coverLetter: string;
  candidate_id: string;
  job_id: string;
}

export interface RawApplicationData {
  application_id: string;
  status: ApplicationStatus;
  resume_url_at_application: string | null;
  cover_letter: string | null;
  application_date: string;
  candidate_id: string;
  job_id: string;
  jobs: {
    job_id: string;
    title: string;
    location: string;
  }[];
}

export interface RawJobData {
  job_id: string;
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  status: JobStatus;
  created_at: string;
  company_id?: string;
  companies: {
    name: string;
    company_id: string;
  }[];
}

export interface FreeResource {
  resource_id: string;
  title: string;
  description: string;
  resource_url: string;
  resource_type: string;
  created_at: string;
  created_by: string | null;
}

export interface RawFreeResourceData {
  resource_id: string;
  title: string;
  description: string;
  resource_url: string;
  resource_type: string;
  created_at: string;
  created_by: string | null;
} 
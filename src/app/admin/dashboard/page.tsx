"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { JobPostingsTable } from "@/module/admin/components/dashboard/job-postings-table";
import { DashboardStats } from "@/module/admin/components/dashboard/dashboard-stats"; 
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useUserProfile } from "@/contexts/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { JobPosting, DatabaseJobWithCompanyId } from "@/types/job";
import { AdminDashboardContentSkeleton } from '@/components/skeletons/admin/admin-dashboard-content-skeleton';

export default function DashboardPage() {
  const { loading: authLoading, isAuthenticated } = useAuthGuard();
  const { userProfile } = useUserProfile();
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllJobs();
    }
  }, [isAuthenticated]);

  const loadAllJobs = async () => {
    setIsLoading(true);
    try {
      // Query all jobs with company information
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          job_id,
          title,
          description,
          job_type,
          location,
          status,
          created_at,
          company_id,
          companies (
            name,
            company_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        setAllJobs([]);
      } else if (jobs) {
        console.log('Dashboard raw jobs data:', jobs);
        console.log('Dashboard first job companies:', jobs[0]?.companies);
        
        const transformedJobs: JobPosting[] = await Promise.all(jobs.map(async (job: DatabaseJobWithCompanyId) => {
          console.log('Dashboard: Raw job data:', job);
          let companyName = 'Unknown Company';
          
          // Try to get company name from the relationship first
          if (job.companies && job.companies.length > 0) {
            companyName = job.companies[0].name;
            console.log('Dashboard: Found company from relationship:', companyName);
          } else if (job.company_id) {
            // If no company data from relationship, try direct lookup
            console.log('Dashboard: No company data from relationship, looking up company_id:', job.company_id);
            const { data: companyData } = await supabase
              .from('companies')
              .select('name, company_id')
              .eq('company_id', job.company_id)
              .single();
            
            if (companyData) {
              companyName = companyData.name;
              console.log('Dashboard: Found company by direct lookup:', companyName);
            }
          }
          
          return {
            id: job.job_id,
            title: job.title,
            company: companyName,
            location: job.location || 'Not specified',
            type: job.job_type,
            salary: 'Not specified', // Salary not in current schema
            postedDate: new Date(job.created_at).toISOString().split('T')[0],
            status: job.status,
            description: job.description
          };
        }));
        
        setAllJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setAllJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddJob = (newJob: Omit<JobPosting, "id" | "postedDate">) => {
    const job: JobPosting = {
      ...newJob,
      id: `job-${allJobs.length + 1}`,
      postedDate: new Date().toISOString().split('T')[0]
    };
    setAllJobs([job, ...allJobs]);
  };

  const handleDeleteJob = (jobId: string) => {
    setAllJobs(allJobs.filter(job => job.id !== jobId));
  };

  const handleEditJob = (updatedJob: JobPosting) => {
    setAllJobs(allJobs.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    ));
  };

  // Get the 5 most recent jobs for the table (already sorted by created_at desc)
  const recentJobs = allJobs.slice(0, 5);
  
  // Show a full-page skeleton during authentication check, but keep sidebar
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader headerTitle="Admin Dashboard" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <AdminDashboardContentSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen in useAuthGuard)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader headerTitle="Admin Dashboard" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {userProfile?.first_name || 'User'}!
                  </h1>
                  <p className="text-gray-600 mt-1">Manage your job postings and track applications</p>
                </div>
              </div>
              
              <DashboardStats jobPostings={allJobs} />
            </div>

            <JobPostingsTable 
              jobPostings={recentJobs}
              onDelete={handleDeleteJob}
              onEdit={handleEditJob}
              onAddJob={handleAddJob}
              loading={isLoading}
              onRefresh={loadAllJobs}
            />
          </div>
        </main>
      </div>
    </div>
  );
} 
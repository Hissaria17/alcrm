"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable, getStatusBadge, getTypeBadge, formatDate } from "@/components/data-table";
import { useUserProfile } from "@/contexts/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { FileText, Upload, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DatabaseJob, ApplicationStatus } from "@/types/job";
import { DashboardSkeleton } from '@/components/skeletons/user/dashboard-skeleton';
import { truncateToWords } from "@/utils/text";
import { useAuthStore } from "@/store/useAuthStore";

export interface JobPosting {
  id: string;
  title: string;
  location: string;
  type: "FULL-TIME" | "PART-TIME" | "CONTRACT" | "INTERNSHIP";
  salary: string;
  postedDate: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  description: string;
  applicationStatus?: ApplicationStatus;
}

export default function DashboardPage() {
  const { userProfile } = useUserProfile();
  const { user } = useAuthStore();
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check application status for a job
  const checkApplicationStatus = useCallback(async (jobId: string): Promise<ApplicationStatus | null> => {
    if (!user?.id) return null;
    
    try {
      const { data: application, error } = await supabase
        .from('jobapplications')
        .select('status')
        .eq('job_id', jobId)
        .eq('candidate_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking application status:', error);
        return null;
      }

      return application?.status || null;
    } catch (error) {
      console.error('Error checking application status:', error);
      return null;
    }
  }, [user?.id]);

  const loadAllJobs = useCallback(async () => {
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
          salary_range,
          created_at,
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        setAllJobs([]);
      } else if (jobs) {
        // Transform the data to match our JobPosting interface and check application status
        const transformedJobs: JobPosting[] = await Promise.all(jobs.map(async (job: DatabaseJob) => {
          const applicationStatus = await checkApplicationStatus(job.job_id);
          
          return {
            id: job.job_id,
            title: job.title,
            location: job.location || 'Not specified',
            type: job.job_type,
            salary: job.salary_range || 'Not specified',
            postedDate: new Date(job.created_at).toISOString().split('T')[0],
            status: job.status,
            description: job.description,
            applicationStatus: applicationStatus || undefined
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
  }, [checkApplicationStatus]);

  useEffect(() => {
    loadAllJobs();
  }, [loadAllJobs]);

  // Get the 5 most recent jobs for the table (already sorted by created_at desc)
  const recentJobs = allJobs.slice(0, 5);

  // Function to get application status badge
  const getApplicationStatusBadge = (status: ApplicationStatus | undefined) => {
    if (!status) return null;
    
    switch (status) {
      case "APPLIED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Applied</Badge>;
      case "SHARED_WITH_COMPANY":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shared</Badge>;
      case "SHORTLISTED":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shortlisted</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case "INTERVIEW_SCHEDULED":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Interview</Badge>;
      case "INTERVIEW_COMPLETED":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Completed</Badge>;
      case "SELECTED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selected</Badge>;
      case "WITHDRAWN":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Define columns for the DataTable
  const columns = [
    {
      key: "title",
      header: "Job Title",
      render: (job: JobPosting) => (
        <div>
          <div className="font-semibold text-gray-900">{truncateToWords(job.title, 3)}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {truncateToWords(job.description, 3)}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "location",
      header: "Location",
      render: (job: JobPosting) => job.location,
      sortable: true,
    },
    {
      key: "salary",
      header: "Salary",
      render: (job: JobPosting) => (
        <div>
          <span>{job.salary || 'Not specified'}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      render: (job: JobPosting) => getTypeBadge(job.type),
      sortable: true,
    },
    {
      key: "applicationStatus",
      header: "Application",
      render: (job: JobPosting) => getApplicationStatusBadge(job.applicationStatus),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (job: JobPosting) => getStatusBadge(job.status),
      sortable: true,
    },
    {
      key: "postedDate",
      header: "Posted Date",
      render: (job: JobPosting) => formatDate(job.postedDate),
      sortable: true,
    },
  ];

  // Handle row click to navigate to job details
  const handleRowClick = (job: JobPosting) => {
    window.location.href = `/dashboard/jobs/${job.id}`;
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userProfile?.first_name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">Checkout the latest job openings</p>
          </div>
        </div>

        {/* Resume Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userProfile?.resume_url ? (
                  <>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Resume Uploaded</h4>
                      <p className="text-sm text-gray-600">You&apos;re ready to apply for jobs</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">No Resume Uploaded</h4>
                      <p className="text-sm text-gray-600">Upload your resume to start applying for jobs</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={userProfile?.resume_url ? "default" : "secondary"}
                  className={userProfile?.resume_url ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-orange-100 text-orange-800 hover:bg-orange-100"}
                >
                  {userProfile?.resume_url ? "Complete" : "Incomplete"}
                </Badge>
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm">
                    {userProfile?.resume_url ? (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Manage Resume
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={recentJobs}
        columns={columns}
        title="Recent Job Postings"
        titleIcon={Calendar}
        subtitle="Latest job opportunities available for you"
        searchable={true}
        searchPlaceholder="Search jobs..."
        searchKeys={["title", "location", "description"]}
        filterable={true}
        filters={[
          {
            key: "type",
            label: "Job Type",
            options: [
              { value: "FULL-TIME", label: "Full-Time" },
              { value: "PART-TIME", label: "Part-Time" },
              { value: "CONTRACT", label: "Contract" },
              { value: "INTERNSHIP", label: "Internship" },
            ],
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "OPEN", label: "Open" },
              { value: "CLOSED", label: "Closed" },
              { value: "ARCHIVED", label: "Archived" },
            ],
          },
        ]}
        sortable={true}
        loading={isLoading}
        onRefresh={loadAllJobs}
        onRowClick={handleRowClick}
        emptyMessage="No job postings found. Create your first job posting to get started."
        theme="primary"
        hoverable={true}
        striped={true}
        bordered={true}
        cardProps={{
          showCard: true,
          className: "border-0 shadow-sm",
        }}
      />
    </>
  );
} 
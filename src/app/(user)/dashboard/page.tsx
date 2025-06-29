"use client";

import { useState, useEffect } from "react";
import { DataTable, getStatusBadge, getTypeBadge, formatDate } from "@/components/data-table";
import { useUserProfile } from "@/contexts/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { FileText, Upload, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DatabaseJob } from "@/types/job";
import { DashboardSkeleton } from '@/components/skeletons/user/dashboard-skeleton';

export interface JobPosting {
  id: string;
  title: string;
  location: string;
  type: "FULL-TIME" | "PART-TIME" | "CONTRACT" | "INTERNSHIP";
  salary: string;
  postedDate: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  description: string;
}

export default function DashboardPage() {
  const { userProfile } = useUserProfile();
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllJobs();
  }, []);

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
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        setAllJobs([]);
      } else if (jobs) {
        // Transform the data to match our JobPosting interface
        const transformedJobs: JobPosting[] = jobs.map((job: DatabaseJob) => ({
          id: job.job_id,
          title: job.title,
          location: job.location || 'Not specified',
          type: job.job_type,
          salary: 'Not specified', // Salary not in current schema
          postedDate: new Date(job.created_at).toISOString().split('T')[0],
          status: job.status,
          description: job.description
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

  // Get the 5 most recent jobs for the table (already sorted by created_at desc)
  const recentJobs = allJobs.slice(0, 5);

  // Define columns for the DataTable
  const columns = [
    {
      key: "title",
      header: "Job Title",
      render: (job: JobPosting) => (
        <div>
          <div className="font-semibold text-gray-900">{job.title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {job.description}
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
      key: "type",
      header: "Type",
      render: (job: JobPosting) => getTypeBadge(job.type),
      sortable: true,
    },
    {
      key: "salary",
      header: "Salary",
      render: (job: JobPosting) => (
        <span className="font-medium">{job.salary}</span>
      ),
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
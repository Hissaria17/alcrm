"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { Eye, Building, Calendar, FileText, Users, Briefcase } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';
import { ApplicationsTableSkeleton } from "@/components/skeletons/admin/applications-table-skeleton";
import { DataTable, DataColumn, formatDate } from "@/components/data-table";

interface JobWithApplications {
  id: string;
  job_id: string;
  title: string;
  company_name: string;
  applicant_count: number;
  created_at: string;
}

interface JobData {
  job_id: string;
  title: string;
  created_at: string;
  companies: {
    name: string;
  } | null;
  jobapplications: {
    application_id: string;
  }[];
}

export default function ApplicationsPage() {
  const { loading: authLoading, isAuthenticated } = useAuthGuard();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  const loadJobs = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          job_id,
          title,
          created_at,
          companies!jobs_company_id_fkey (
            name
          ),
          jobapplications!jobapplications_job_id_fkey (
            application_id
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        setJobs([]);
        setTotalCount(0);
        return;
      }

      const formattedJobs = (data as unknown as JobData[]).map(job => ({
        id: job.job_id,
        job_id: job.job_id,
        title: job.title,
        company_name: job.companies?.name || 'Unknown Company',
        applicant_count: job.jobapplications?.length || 0,
        created_at: job.created_at
      }));

      setJobs(formattedJobs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error in loadJobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    loadJobs();
  };

  const columns: DataColumn<JobWithApplications>[] = [
    {
      key: "title",
      header: "Job Title",
      render: (job) => (
        <span className="text-gray-900 font-semibold truncate block">{job.title}</span>
      ),
      sortable: true,
    },
    {
      key: "applicant_count",
      header: "Applications",
      render: (job) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4" />
          <span className="font-medium">{job.applicant_count}</span>
        </div>
      ),
      sortable: true,
      align: "center",
    },
    {
      key: "company_name",
      header: "Company",
      render: (job) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Building className="h-4 w-4" />
          {job.company_name}
        </div>
      ),
      sortable: true,
    },
    {
      key: "created_at",
      header: "Posted Date",
      render: (job) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          {formatDate(job.created_at)}
        </div>
      ),
      sortable: true,
    },
  ];

  const actions = [
    {
      label: "View Applications",
      icon: Eye,
      onClick: (job: JobWithApplications) => 
        router.push(`/admin/dashboard/applications/${job.job_id}`),
      variant: "ghost" as const,
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader headerTitle="Applications" />
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                <ApplicationsTableSkeleton />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader headerTitle="Applications" />
          <main className="flex-1 p-6 overflow-y-auto">

            <div className="max-w-7xl mx-auto space-y-6">
              <DataTable
                data={jobs}
                columns={columns}
                title="All Jobs"
                titleIcon={Briefcase}
                actions={actions}
                searchable={true}
                searchPlaceholder="Search jobs..."
                searchKeys={["title", "company_name"] as (keyof JobWithApplications)[]}
                sortable={true}
                pagination={{
                  enabled: true,
                  pageSize: ITEMS_PER_PAGE,
                  currentPage: currentPage,
                  totalCount: totalCount,
                  onPageChange: handlePageChange,
                }}
                emptyMessage="No jobs found"
                emptyIcon={FileText}
                emptyAction={{
                  label: "Refresh",
                  onClick: handleRefresh,
                }}
                loading={loading}
                onRefresh={handleRefresh}
                striped={true}
                hoverable={true}
                bordered={true}
                theme="primary"
                cardProps={{
                  showCard: true,
                  className: "shadow-sm",
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 
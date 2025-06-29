'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { 
  ArrowLeft, 
  Users, 
  Calendar,
  Eye,
  Mail,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import { 
  Application, 
  JobDetails, 
  ApplicationStatus 
} from "@/types/job";
import { JobApplicationsSkeleton } from "@/components/skeletons/admin/job-applications-skeleton";
import { DataTable, DataColumn, formatDate } from "@/components/data-table";

const ITEMS_PER_PAGE = 10;

interface ApplicationWithId extends Application {
  id: string;
}

export default function JobApplicationsPage({ 
  params 
}: { 
  params: Promise<{ jobId: string }> 
}) {
  const { loading: authLoading, isAuthenticated } = useAuthGuard();
  const router = useRouter();
  const { jobId } = use(params);
  
  const [applications, setApplications] = useState<ApplicationWithId[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, ] = useState("");

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  const loadJobDetails = useCallback(async () => {
    try {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select(`
          job_id,
          title,
          location,
          companies!jobs_company_id_fkey (
            name
          )
        `)
        .eq('job_id', jobId)
        .single();

      if (jobError) throw jobError;

      setJobDetails({
        job_id: job.job_id,
        title: job.title,
        location: job.location,
        company_name: (job.companies as unknown as { name: string })?.name || 'Unknown Company'
      });
    } catch (error) {
      console.error('Error loading job details:', error);
      toast.error('Failed to load job details');
    }
  }, [jobId]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobapplications')
        .select(`
          application_id,
          application_date,
          status,
          candidate_id,
          users!jobapplications_candidate_id_fkey (
            first_name,
            last_name,
            email
          )
        `, { count: 'exact' })
        .eq('job_id', jobId)
        .order('application_date', { ascending: false });

      if (searchTerm) {
        query = query.or(`users.first_name.ilike.%${searchTerm}%,users.last_name.ilike.%${searchTerm}%,users.email.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        setApplications([]);
        setTotalCount(0);
        return;
      }

      const formattedApplications: ApplicationWithId[] = (data as unknown as Array<{
        application_id: string;
        candidate_id: string;
        application_date: string;
        status: ApplicationStatus;
        users: {
          first_name: string;
          last_name: string;
          email: string;
        } | null;
      }>).map(app => ({
        id: app.application_id,
        application_id: app.application_id,
        candidate_id: app.candidate_id,
        application_date: app.application_date,
        status: app.status,
        users: {
          first_name: app.users?.first_name || '',
          last_name: app.users?.last_name || '',
          email: app.users?.email || ''
        }
      }));

      setApplications(formattedApplications);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error in loadApplications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [jobId, currentPage, searchTerm]);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
      loadApplications();
    }
  }, [jobId, loadJobDetails, loadApplications]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    loadApplications();
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "APPLIED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Applied</Badge>;
      case "SHARED_WITH_COMPANY":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shared with Company</Badge>;
      case "SHORTLISTED":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shortlisted</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case "INTERVIEW_SCHEDULED":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Interview Scheduled</Badge>;
      case "INTERVIEW_COMPLETED":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Interview Completed</Badge>;
      case "SELECTED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selected</Badge>;
      case "WITHDRAWN":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: DataColumn<ApplicationWithId>[] = [
    {
      key: "candidate",
      header: "Candidate",
      render: (application) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="font-semibold text-gray-600">
              {application.users.first_name?.[0]}{application.users.last_name?.[0]}
            </span>
          </div>
          <div>
            <div className="font-bold">{application.users.first_name} {application.users.last_name}</div>
            <div className="text-sm text-gray-500">{application.users.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      render: (application) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-4 w-4" />
          {application.users.email}
        </div>
      ),
      sortable: true,
    },
    {
      key: "application_date",
      header: "Applied Date",
      render: (application) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          {formatDate(application.application_date)}
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (application) => getStatusBadge(application.status),
      sortable: true,
    },
  ];

  const actions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (application: ApplicationWithId) => 
        router.push(`/admin/dashboard/applications/${jobId}/${application.candidate_id}`),
      variant: "outline" as const,
    },
  ];

  if (authLoading || !jobDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader headerTitle="Job Applications" />
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">
                <JobApplicationsSkeleton />
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
          <DashboardHeader headerTitle="Job Applications" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/admin/dashboard/applications')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Applications for {jobDetails?.title}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {jobDetails?.company_name} • {jobDetails?.location}
                  </p>
                </div>
              </div>

              {loading ? (
                <JobApplicationsSkeleton />
              ) : (
                <DataTable
                  data={applications}
                  columns={columns}
                  title="Applicants"
                  titleIcon={Users}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search applicants..."
                  searchKeys={["users"] as (keyof ApplicationWithId)[]}
                  sortable={true}
                  pagination={{
                    enabled: true,
                    pageSize: ITEMS_PER_PAGE,
                    currentPage: currentPage,
                    totalCount: totalCount,
                    onPageChange: handlePageChange,
                  }}
                  emptyMessage="No applicants found"
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
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 
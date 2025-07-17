"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, Download, MapPin, Calendar, FileText, Briefcase } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, ApplicationStatus } from "@/lib/supabase";
import { UserApplication } from "@/types/job";
import { DataTable, DataColumn, DataAction, formatDate } from "@/components/data-table";
import { AppliedSkeleton } from '@/components/skeletons/user/applied-skeleton';

const ITEMS_PER_PAGE = 10;

export default function ApplicationsPage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<UserApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadApplications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('jobapplications')
        .select(`
          application_id,
          status,
          resume_url_at_application,
          cover_letter,
          application_date,
          candidate_id,
          job_id
        `)
        .eq('candidate_id', user.id)
        .order('application_date', { ascending: false });

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        setError('Failed to load applications. Please try again.');
        return;
      }

      if (applicationsData) {
        const applicationsWithJobs = await Promise.all(
          applicationsData.map(async (app) => {
            const { data: jobData } = await supabase
              .from('jobs')
              .select('title, location, salary_range')
              .eq('job_id', app.job_id)
              .single();
            
            return {
              ...app,
              jobTitle: jobData?.title || 'Unknown Position',
              jobLocation: jobData?.location || 'Not specified',
              jobSalary: jobData?.salary_range || 'Not specified'
            };
          })
        );
        
        const transformedApplications: UserApplication[] = applicationsWithJobs.map((app) => {
          return {
            id: app.application_id,
            application_id: app.application_id,
            candidateName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Candidate',
            email: user.email || 'No email provided',
            phone: user.phone || 'No phone provided',
            jobTitle: app.jobTitle,
            appliedDate: app.application_date,
            status: app.status,
            experience: 'Not specified',
            location: app.jobLocation,
            salary: app.jobSalary,
            resume: app.resume_url_at_application || 'No resume provided',
            coverLetter: app.cover_letter || 'No cover letter provided',
            candidate_id: app.candidate_id,
            job_id: app.job_id
          };
        });
        
        setApplications(transformedApplications);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('An unexpected error occurred while loading applications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user, loadApplications]);

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

  const handleViewDetails = (application: UserApplication) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  const handleDownloadResume = (resumeUrl: string) => {
    if (resumeUrl && resumeUrl !== 'No resume provided') {
      window.open(resumeUrl, '_blank');
    }
  };

  // Handle row click to navigate to job details
  const handleRowClick = (application: UserApplication) => {
    window.location.href = `/dashboard/jobs/${application.job_id}`;
  };

  // DataTable columns configuration
  const columns: DataColumn<UserApplication>[] = [
    {
      key: "jobTitle",
      header: "Job Position",
      render: (application) => (
        <div>
          <div className="font-semibold">{application.jobTitle}</div>
          <div className="text-sm text-gray-500">
            {application.candidateName}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "location",
      header: "Location",
      render: (application) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{application.location}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "salary",
      header: "Salary",
      render: (application) => (
        <div>
          <span>{application.salary || 'Not specified'}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "appliedDate",
      header: "Applied Date",
      render: (application) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDate(application.appliedDate)}</span>
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

  // DataTable actions configuration
  const actions: DataAction<UserApplication>[] = [
    {
      label: "View Details",
      icon: Eye,
      onClick: handleViewDetails,
      variant: "outline",
    },
    {
      label: "Download Resume",
      icon: Download,
      onClick: (application) => handleDownloadResume(application.resume),
      variant: "outline",
      disabled: (application) => !application.resume || application.resume === 'No resume provided',
    },
  ];

  // Filter options for status
  const statusFilters = [
    { value: "APPLIED", label: "Applied" },
    { value: "SHARED_WITH_COMPANY", label: "Shared with Company" },
    { value: "SHORTLISTED", label: "Shortlisted" },
    { value: "REJECTED", label: "Rejected" },
    { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
    { value: "INTERVIEW_COMPLETED", label: "Interview Completed" },
    { value: "SELECTED", label: "Selected" },
    { value: "WITHDRAWN", label: "Withdrawn" },
  ];

  if (loading) {
    return <AppliedSkeleton />;
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        {/* <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-1">Track the status of your job applications</p>
          </div>
        </div> */}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Applications Summary */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
              <div className="text-sm text-blue-600">Total Applications</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'APPLIED').length}
              </div>
              <div className="text-sm text-yellow-600">Applied</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {applications.filter(app => app.status === 'SHORTLISTED').length}
              </div>
              <div className="text-sm text-purple-600">Shortlisted</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'SELECTED').length}
              </div>
              <div className="text-sm text-green-600">Selected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications DataTable */}
      <DataTable
        data={applications}
        columns={columns}
        actions={actions}
        title="My Applications"
        titleIcon={Briefcase}
        subtitle={`Showing ${applications.length} application${applications.length !== 1 ? 's' : ''}`}
        searchable={true}
        searchPlaceholder="Search by job title or location..."
        searchKeys={["jobTitle", "location"]}
        filterable={true}
        filters={[
          {
            key: "status",
            label: "Status",
            options: statusFilters,
          },
        ]}
        sortable={false}
        pagination={{
          enabled: true,
          pageSize: ITEMS_PER_PAGE,
          currentPage: currentPage,
          totalCount: applications.length,
          onPageChange: setCurrentPage,
        }}
        emptyMessage="No applications found"
        emptyIcon={FileText}
        emptyAction={{
          label: "Browse Jobs",
          onClick: () => window.location.href = '/dashboard/jobs',
        }}
        loading={loading}
        onRefresh={loadApplications}
        onRowClick={handleRowClick}
        showRowNumbers={false}
        striped={true}
        hoverable={true}
        bordered={true}
        theme="primary"
        cardProps={{
          showCard: true,
          className: "border-0 shadow-sm",
        }}
      />

      {/* Application Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Job Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Job Title</label>
                    <p className="text-gray-900">{selectedApplication.jobTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">{selectedApplication.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Salary</label>
                    <p className="text-gray-900">{selectedApplication.salary || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Applied Date</label>
                    <p className="text-gray-900">{formatDate(selectedApplication.appliedDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                </div>
              </div>

              {/* Candidate Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedApplication.candidateName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <p className="text-gray-900">{selectedApplication.experience}</p>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && selectedApplication.coverLetter !== 'No cover letter provided' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cover Letter</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApplication.resume && selectedApplication.resume !== 'No resume provided' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resume</h3>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadResume(selectedApplication.resume)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 
'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { Calendar, FileText, ArrowLeft, Download, Mail, Phone, User, Building, Briefcase, CheckCircle, AlertCircle } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DetailedApplication, ApplicationStatus } from "@/types/job";
import { CandidateApplicationSkeleton } from "@/components/skeletons/admin/candidate-application-skeleton";

export default function ApplicationDetailsPage({ params }: { params: Promise<{ jobId: string; candidateId: string }> }) {
  const { jobId, candidateId } = use(params);
  const { loading: authLoading, isAuthenticated } = useAuthGuard();
  const router = useRouter();
  const [application, setApplication] = useState<DetailedApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [currentResume, setCurrentResume] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/signin');
    }
  }, [isAuthenticated, authLoading, router]);

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

  const loadApplicationDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobapplications')
        .select(`
          application_id,
          status,
          resume_url_at_application,
          cover_letter,
          application_date,
          candidate_id,
          job_id,
          users!jobapplications_candidate_id_fkey (
            first_name,
            last_name,
            email,
            phone
          ),
          jobs!jobapplications_job_id_fkey (
            title,
            location,
            companies!jobs_company_id_fkey (
              name
            )
          )
        `)
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .single();

      if (error) throw error;

      if (!data) {
        setApplication(null);
        return;
      }

      setApplication(data as unknown as DetailedApplication);

      // Also fetch the candidate's current resume
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('resume_url')
        .eq('id', candidateId)
        .single();

      if (!userError && userData) {
        setCurrentResume(userData.resume_url);
      }
    } catch (error) {
      console.error('Error loading application details:', error);
      setError('Failed to load application details');
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  }, [jobId, candidateId]);

  useEffect(() => {
    loadApplicationDetails();
  }, [loadApplicationDetails]);

  const updateApplicationStatus = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('jobapplications')
        .update({ status: newStatus })
        .eq('application_id', application.application_id);

      if (error) throw error;

      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Application status updated successfully');
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadResume = async (resumeUrl: string, type: 'application' | 'current') => {
    if (!resumeUrl) {
      toast.error('No resume available to download');
      return;
    }

    setIsDownloadingResume(true);
    try {
      // Get the filename from the URL or create a default one
      const candidateName = `${application?.users.first_name}_${application?.users.last_name}`.replace(/\s+/g, '_');
      const jobTitle = application?.jobs.title.replace(/\s+/g, '_');
      const resumeType = type === 'application' ? 'Application' : 'Current';
      const filename = `${candidateName}_${jobTitle}_${resumeType}_Resume.pdf`;

      // Fetch the file and download it
      const response = await fetch(resumeUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = 'none';
      
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
      
      toast.success(`${resumeType} resume downloaded successfully`);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    } finally {
      setIsDownloadingResume(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader headerTitle="Application Details" />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
              <div className="max-w-4xl mx-auto">
                <CandidateApplicationSkeleton />
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
          <DashboardHeader headerTitle="Application Details" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
                  <p className="text-gray-600 mt-1">Review and manage application details</p>
                </div>
                <Button variant="outline" onClick={() => router.push(`/admin/dashboard/applications/${jobId}`)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Applications
                </Button>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {application ? (
                <>
                  {/* Candidate Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Candidate Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900 font-medium">
                                {application.users.first_name} {application.users.last_name}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-500">Email</h4>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{application.users.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{application.users.phone || "Not provided"}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-500">Applied Date</h4>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{formatDate(application.application_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Job Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-500">Job Title</h4>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900 font-medium">{application.jobs.title}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-500">Company</h4>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{application.jobs.companies?.name || "Unknown Company"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Location</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{application.jobs.location || "Not specified"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Application Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Application Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Current Status</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">Status:</span>
                              {getStatusBadge(application.status)}
                            </div>
                            <Select
                              value={application.status}
                              onValueChange={(value) => updateApplicationStatus(value as ApplicationStatus)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Update status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="APPLIED">Applied</SelectItem>
                                <SelectItem value="SHARED_WITH_COMPANY">Shared with Company</SelectItem>
                                <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                                <SelectItem value="INTERVIEW_COMPLETED">Interview Completed</SelectItem>
                                <SelectItem value="SELECTED">Selected</SelectItem>
                                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div>
                              <h4 className="font-medium text-gray-900">Resume</h4>
                              <p className="text-sm text-gray-600">
                                Candidate&apos;s current resume{(currentResume || application.resume_url_at_application) ? '' : ' (Not available)'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                onClick={() => window.open(currentResume || application.resume_url_at_application, '_blank')}
                                disabled={!(currentResume || application.resume_url_at_application) || isDownloadingResume}
                                size="sm"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Resume
                              </Button>
                              <Button
                                onClick={() => downloadResume(currentResume || application.resume_url_at_application || '', 'current')}
                                disabled={!(currentResume || application.resume_url_at_application) || isDownloadingResume}
                                size="sm"
                              >
                                {isDownloadingResume ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Resume
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-500">Cover Letter</h4>
                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                              <p className="text-gray-600 whitespace-pre-wrap">
                                {application.cover_letter || "No cover letter provided"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
                  <p className="text-gray-500">The application you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 
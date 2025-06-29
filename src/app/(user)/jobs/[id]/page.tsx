"use client";

import { useState, useEffect, use, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Building, Calendar, Clock, FileText, Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import Link from "next/link";
import { JobPosting } from "@/types/job";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { isAuthenticated } = useAuthGuard();
  const { user } = useAuthStore();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const loadJobDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: jobData, error: jobError } = await supabase
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
            name,
            company_id
          )
        `)
        .eq('job_id', id)
        .single();

      if (jobError) {
        console.error('Error fetching job:', jobError);
        setError('Job not found or has been removed.');
        return;
      }

      if (jobData) {
        const transformedJob: JobPosting = {
          id: jobData.job_id,
          title: jobData.title,
          company: jobData.companies?.[0]?.name || 'Unknown Company',
          location: jobData.location || 'Not specified',
          type: jobData.job_type,
          salary: 'Not specified',
          postedDate: new Date(jobData.created_at).toISOString().split('T')[0],
          status: jobData.status,
          description: jobData.description,
          company_id: jobData.companies?.[0]?.company_id,
        };

        setJob(transformedJob);
      }
    } catch {
      setError('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkApplicationStatus = useCallback(async () => {
    if (!user || !job) return;

    try {
      const { data: application } = await supabase
        .from('jobapplications')
        .select('application_id, status')
        .eq('job_id', job.id)
        .eq('candidate_id', user.id)
        .single();

      setHasApplied(!!application);
    } catch {
      setHasApplied(false);
    }
  }, [user, job]);

  useEffect(() => {
    loadJobDetails();
  }, [loadJobDetails]);

  useEffect(() => {
    if (isAuthenticated && user && job) {
      checkApplicationStatus();
    }
  }, [isAuthenticated, user, job, checkApplicationStatus]);

  const isJobClosed = job?.status === 'CLOSED';

  const handleApply = async () => {
    if (!user || !job) {
      toast.error('Please sign in to apply for this job.');
      return;
    }

    if (isJobClosed) {
      toast.error('This position is closed and no longer accepting applications.');
      return;
    }

    setApplying(true);

    try {
      const { error } = await supabase
        .from('jobapplications')
        .insert([{
          job_id: job.id,
          candidate_id: user.id,
          status: 'APPLIED',
          cover_letter: 'Applied via shared link',
          resume_url_at_application: user.resume_url || null
        }]);

      if (error) {
        console.error('Error applying for job:', error);
        toast.error('Failed to apply for the job. Please try again.');
        return;
      }

      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (err) {
      console.error('Error applying for job:', err);
      toast.error('Failed to apply for the job. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const getStatusBadge = (status: JobPosting["status"]) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case "CLOSED":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-yellow-100 text-yellow-800">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: JobPosting["type"]) => {
    const colors = {
      "FULL-TIME": "bg-blue-100 text-blue-800",
      "PART-TIME": "bg-purple-100 text-purple-800",
      "CONTRACT": "bg-orange-100 text-orange-800",
      "INTERNSHIP": "bg-green-100 text-green-800",
    };
    
    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type.replace('-', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Alert>
            <AlertDescription>{error || 'Job not found'}</AlertDescription>
          </Alert>
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {job.company}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Posted {formatDate(job.postedDate)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {getTypeBadge(job.type)}
              {getStatusBadge(job.status)}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Apply Button */}
                <div className="mt-6">
                  {!isAuthenticated ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please sign in to apply for this position.
                      </AlertDescription>
                    </Alert>
                  ) : hasApplied ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        You have already applied for this position.
                      </AlertDescription>
                    </Alert>
                  ) : isJobClosed ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This position is closed and no longer accepting applications.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Button 
                      onClick={handleApply} 
                      disabled={applying}
                      className="w-full"
                    >
                      {applying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        'Apply for this position'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Job Type</p>
                    <p className="text-sm text-gray-600">{job.type.replace('-', ' ')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Posted Date</p>
                    <p className="text-sm text-gray-600">{formatDate(job.postedDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
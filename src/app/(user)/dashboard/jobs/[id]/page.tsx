"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Loader2,
  Send,
  AlertCircle,
  Upload,
  FileText,
  Download,
  CheckCircle,
  Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser, useUserProfile } from "@/contexts/SupabaseProvider";
import { toast } from "sonner";
import { JobDetail, UserApplicationStatus } from "@/types/job";
import { JobDetailSkeleton } from '@/components/skeletons/user/job-detail-skeleton';
import { uploadResumeAndUpdateProfile, RESUME_UPLOAD_VALIDATION } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const { userProfile } = useUserProfile();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<UserApplicationStatus>({
    hasApplied: false
  });
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  
  // Resume upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentResumeUrl, setCurrentResumeUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const jobId = params.id as string;

  const loadJobDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data: jobData, error } = await supabase
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
            company_id,
            name,
            description,
            website_url,
            logo_url
          )
        `)
        .eq('job_id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job details:', error);
        toast.error('Failed to load job details');
        router.push('/dashboard/jobs');
        return;
      }
      console.log(jobData);

      if (jobData) {
        setJob({
          id: jobData.job_id,
          title: jobData.title,
          description: jobData.description,
          job_type: jobData.job_type,
          location: jobData.location,
          status: jobData.status,
          created_at: jobData.created_at,
          company: Array.isArray(jobData.companies) ? jobData.companies[0] : jobData.companies
        });
      }
    } catch (error) {
      console.error('Error loading job details:', error);
      toast.error('Failed to load job details');
      router.push('/dashboard/jobs');
    } finally {
      setLoading(false);
    }
  }, [jobId, router]);

  const checkApplicationStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: application, error } = await supabase
        .from('jobapplications')
        .select('application_id, status, application_date')
        .eq('job_id', jobId)
        .eq('candidate_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking application status:', error);
        return;
      }

      if (application) {
        setApplicationStatus({
          hasApplied: true,
          applicationId: application.application_id,
          applicationStatus: application.status,
          applicationDate: application.application_date
        });
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  }, [jobId, user?.id]);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
      checkApplicationStatus();
    }
  }, [jobId, checkApplicationStatus, loadJobDetails]);

  // Initialize current resume URL
  useEffect(() => {
    if (userProfile?.resume_url) {
      setCurrentResumeUrl(userProfile.resume_url);
    }
  }, [userProfile?.resume_url]);

  const handleApply = async () => {
    if (!user?.id || !job) return;

    // Check if user role is USER (not ADMIN)
    if (userProfile?.role !== 'USER') {
      toast.error('Only users can apply for jobs');
      return;
    }

    setIsApplying(true);
    try {
      const { error } = await supabase
        .from('jobapplications')
        .insert([
          {
            job_id: jobId,
            candidate_id: user.id,
            status: 'APPLIED',
            cover_letter: coverLetter.trim() || null,
            resume_url_at_application: currentResumeUrl || null
          }
        ]);

      if (error) {
        console.error('Error submitting application:', error);
        toast.error('Failed to submit application');
        return;
      }

      toast.success('Application submitted successfully!');
      setIsApplyDialogOpen(false);
      setCoverLetter("");
      clearSelectedFile();
      
      // Refresh application status
      await checkApplicationStatus();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  // Resume upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (!RESUME_UPLOAD_VALIDATION.allowedTypes.includes(file.type)) {
        toast.error('Please select a PDF, DOC, or DOCX file');
        return;
      }
      if (file.size > RESUME_UPLOAD_VALIDATION.maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!selectedFile || !user?.id) return;

    setIsUploadingResume(true);
    setUploadProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      const result = await uploadResumeAndUpdateProfile(selectedFile, user.id, RESUME_UPLOAD_VALIDATION);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success) {
        setCurrentResumeUrl(result.url || '');
        setSelectedFile(null);
        toast.success('Resume uploaded successfully!');
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(result.error || 'Failed to upload resume');
      }
    } catch (error: unknown) {
      clearInterval(progressInterval);
      console.error('Error uploading resume:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload resume";
      toast.error(errorMessage);
    } finally {
      setIsUploadingResume(false);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: JobDetail["status"]) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Open</Badge>;
      case "CLOSED":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: JobDetail["job_type"]) => {
    const colors = {
      "FULL-TIME": "bg-blue-100 text-blue-800",
      "PART-TIME": "bg-purple-100 text-purple-800",
      "CONTRACT": "bg-orange-100 text-orange-800",
      "INTERNSHIP": "bg-green-100 text-green-800",
    };
    
    const labels = {
      "FULL-TIME": "FULL-TIME",
      "PART-TIME": "PART-TIME",
      "CONTRACT": "CONTRACT",
      "INTERNSHIP": "INTERNSHIP",
    };
    
    return (
      <Badge className={`${colors[type]} hover:${colors[type]}`}>
        {labels[type]}
      </Badge>
    );
  };

  const getApplicationStatusBadge = (status: UserApplicationStatus["applicationStatus"]) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canApply = () => {
    return job?.status === "OPEN" && !applicationStatus.hasApplied && userProfile?.role === 'USER';
  };

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
        <p className="text-gray-500 mb-4">The job you re looking for doesn t exist or has been removed.</p>
        <Button onClick={() => router.push('/dashboard/jobs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>

      {/* Job Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{job.job_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Posted {formatDate(job.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(job.status)}
              {getTypeBadge(job.job_type)}
            </div>
          </div>
          
          {/* Application Status */}
          {applicationStatus.hasApplied && (
            <div className="text-right">
              <div className="mb-2">{getApplicationStatusBadge(applicationStatus.applicationStatus)}</div>
              <p className="text-sm text-gray-500">
                Applied on {applicationStatus.applicationDate ? formatDate(applicationStatus.applicationDate) : 'Unknown date'}
              </p>
            </div>
          )}
        </div>

        {/* Apply Button */}
        {canApply() && (
          <Dialog open={isApplyDialogOpen} onOpenChange={(open) => {
            setIsApplyDialogOpen(open);
            if (!open) {
              clearSelectedFile();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full md:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Apply for this Position
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Apply for {job.title}</DialogTitle>
                <DialogDescription>
                  Submit your application for this position. Make sure your resume is up to date.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Cover Letter Section */}
                <div>
                  <Label htmlFor="coverLetter" className="text-base font-semibold mb-2">Cover Letter (Optional)</Label>
                  <Textarea
                    id="coverLetter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write a brief cover letter explaining why you're interested in this position..."
                    rows={6}
                  />
                </div>
                
                {/* Resume Section */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Resume</Label>
                  
                  {currentResumeUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">Resume Ready</h4>
                          <p className="text-sm text-green-700">Your current resume will be attached to this application</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(currentResumeUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">Want to use a different resume for this application?</p>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingResume}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Resume
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-900">Resume Required</h4>
                          <p className="text-sm text-yellow-700">Please upload your resume to apply for this position</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingResume}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Resume
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />

                  {/* Selected file preview */}
                  {selectedFile && (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-blue-900">Selected File:</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelectedFile}
                            className="text-blue-600 hover:text-blue-700 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <FileText className="h-4 w-4" />
                          <span>{selectedFile.name}</span>
                          <span className="text-blue-600">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Button
                          onClick={handleResumeUpload}
                          disabled={isUploadingResume}
                          className="w-full"
                        >
                          {isUploadingResume ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading... {Math.round(uploadProgress)}%
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Resume
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Upload progress */}
                  {isUploadingResume && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-500 text-center">
                        Uploading resume... {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}

                  {/* File requirements */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Supported formats: PDF, DOC, DOCX</p>
                    <p>• Maximum file size: 5MB</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsApplyDialogOpen(false);
                    clearSelectedFile();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={isApplying || !currentResumeUrl || isUploadingResume}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Description */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
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

        {/* Company Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              {job.company ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{job.company.name}</h4>
                    {job.company.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {job.company.description}
                      </p>
                    )}
                  </div>
                  
                  {job.company.website_url && (
                    <div>
                      <a
                        href={job.company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        Visit Website
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Company information not available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 
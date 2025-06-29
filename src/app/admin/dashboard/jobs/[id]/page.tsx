"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import { 
  MapPin, 
  Building, 
  Calendar, 
  Clock, 
  Globe, 
  ArrowLeft, 
  Loader2,
  Users,
  AlertCircle,
  Edit
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useUserProfile } from "@/contexts/SupabaseProvider";
import { toast } from "sonner";
import { JobDetail, JobApplication } from "@/types/job";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminJobDetailSkeleton } from '@/components/skeletons/admin/admin-job-detail-skeleton';

export default function AdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuthGuard();
  const { userProfile } = useUserProfile();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [applications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    job_type: "" as JobDetail["job_type"],
    location: "",
    status: "" as JobDetail["status"],
  });

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
          company_id,
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
        router.push('/admin/dashboard/jobs');
        return;
      }

      if (jobData) {
        console.log('Raw job data:', jobData);
        console.log('Companies data:', jobData.companies);
        console.log('Company ID from job:', jobData.company_id);
        
        // Handle company data - Supabase may return companies as array or object
        const companyData = Array.isArray(jobData.companies) ? jobData.companies[0] : jobData.companies;
        console.log('Processed company data:', companyData);
        
        let company;
        if (companyData) {
          company = {
            company_id: companyData.company_id,
            name: companyData.name,
            description: companyData.description || '',
            website_url: companyData.website_url || '',
            logo_url: companyData.logo_url || ''
          };
        } else {
          // If no company data found, try to fetch company by ID
          console.log('No company data found, trying to fetch by ID:', jobData.company_id);
          if (jobData.company_id) {
            const { data: companyByIdData } = await supabase
              .from('companies')
              .select('company_id, name, description, website_url, logo_url')
              .eq('company_id', jobData.company_id)
              .single();
            
            if (companyByIdData) {
              console.log('Found company by ID:', companyByIdData);
              company = {
                company_id: companyByIdData.company_id,
                name: companyByIdData.name,
                description: companyByIdData.description || '',
                website_url: companyByIdData.website_url || '',
                logo_url: companyByIdData.logo_url || ''
              };
            } else {
              company = {
                company_id: '',
                name: 'Unknown Company',
                description: '',
                website_url: '',
                logo_url: ''
              };
            }
          } else {
            company = {
              company_id: '',
              name: 'Unknown Company',
              description: '',
              website_url: '',
              logo_url: ''
            };
          }
        }
        
        setJob({
          id: jobData.job_id,
          title: jobData.title,
          description: jobData.description,
          job_type: jobData.job_type,
          location: jobData.location,
          status: jobData.status,
          created_at: jobData.created_at,
          company: company
        });
      }
    } catch (error) {
      console.error('Error loading job details:', error);
      toast.error('Failed to load job details');
      router.push('/admin/dashboard/jobs');
    } finally {
      setLoading(false);
    }
  }, [jobId, router]);

  // const loadApplications = useCallback(async () => {
  //   setApplicationsLoading(true);
  //   try {
  //     const { data: applicationsData, error } = await supabase
  //       .from('jobapplications')
  //       .select(`
  //         application_id,
  //         status,
  //         application_date,
  //         cover_letter,
  //         resume_url_at_application,
  //         users (
  //           id,
  //           first_name,
  //           last_name,
  //           email,
  //           phone
  //         )
  //       `)
  //       .eq('job_id', jobId)
  //       .order('application_date', { ascending: false });

  //     if (error) {
  //       console.error('Error fetching applications:', error);
  //       toast.error('Failed to load applications');
  //       setApplications([]);
  //       return;
  //     }

  //     if (applicationsData) {
  //       const transformedApplications: JobApplication[] = applicationsData.map((app: JobDetailApplication) => ({
  //         application_id: app.application_id,
  //         status: app.status,
  //         application_date: app.application_date,
  //         cover_letter: app.cover_letter,
  //         resume_url_at_application: app.resume_url_at_application,
  //         candidate: {
  //           id: app.users[0].id,
  //           first_name: app.users[0].first_name,
  //           last_name: app.users[0].last_name,
  //           email: app.users[0].email,
  //           phone: app.users[0].phone
  //         }
  //       }));
  //       setApplications(transformedApplications);
  //     }
  //   } catch (error) {
  //     console.error('Error loading applications:', error);
  //     toast.error('Failed to load applications');
  //     setApplications([]);
  //   } finally {
  //     setApplicationsLoading(false);
  //   }
  // }, [jobId]);

  useEffect(() => {
    if (isAuthenticated && jobId) {
      loadJobDetails();
      // loadApplications();
    }
  }, [isAuthenticated, jobId, loadJobDetails,
    //  loadApplications
    ]);

  // Redirect non-admin users
  useEffect(() => {
    if (userProfile && userProfile.role !== 'ADMIN') {
      router.push('/dashboard');
      toast.error('Access denied. Admin privileges required.');
    }
  }, [userProfile, router]);

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
    
    return (
      <Badge className={`${colors[type]} hover:${colors[type]}`}>
        {type}
      </Badge>
    );
  };

  // const getApplicationStatusBadge = (status: JobApplication["status"]) => {
  //   switch (status) {
  //     case "APPLIED":
  //       return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Applied</Badge>;
  //     case "SHARED_WITH_COMPANY":
  //       return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shared with Company</Badge>;
  //     case "SHORTLISTED":
  //       return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shortlisted</Badge>;
  //     case "REJECTED":
  //       return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
  //     case "INTERVIEW_SCHEDULED":
  //       return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Interview Scheduled</Badge>;
  //     case "INTERVIEW_COMPLETED":
  //       return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Interview Completed</Badge>;
  //     case "SELECTED":
  //       return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selected</Badge>;
  //     case "WITHDRAWN":
  //       return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Withdrawn</Badge>;
  //     default:
  //       return <Badge variant="secondary">{status}</Badge>;
  //   }
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openEditDialog = () => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        job_type: job.job_type,
        location: job.location,
        status: job.status,
      });
      setIsEditOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateJob = async () => {
    if (!formData.title || !formData.description || !formData.job_type || !formData.location || !formData.status) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: formData.title,
          description: formData.description,
          job_type: formData.job_type,
          location: formData.location,
          status: formData.status
        })
        .eq('job_id', jobId);

      if (error) {
        console.error('Error updating job:', error);
        toast.error('Failed to update job');
        return;
      }

      toast.success('Job updated successfully');
      setIsEditOpen(false);
      loadJobDetails(); // Reload the job details
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader headerTitle="Job Details" />
          <main className="flex-1 flex items-center justify-center">
            <AdminJobDetailSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader headerTitle="Job Details" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
              <p className="text-gray-600 mb-4">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Button onClick={() => router.push('/admin/dashboard/jobs')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader headerTitle="Job Details" />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin/dashboard/jobs')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>

            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-lg font-medium">{job.company.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Posted {formatDate(job.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {getTypeBadge(job.job_type)}
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4">
                  {/* Application Stats */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-blue-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{applications.length} Applications</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Total received
                    </p>
                    </div>
                    
                    {/* Edit Button */}
                    <Button 
                      onClick={openEditDialog}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Job
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {job.description}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    About {job.company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.company.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Company Description</h4>
                        <p className="text-gray-700 leading-relaxed">{job.company.description}</p>
                      </div>
                    )}
                    
                    {job.company.website_url && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Website</h4>
                        <a 
                          href={job.company.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          {job.company.website_url}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications Table */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Applications ({applications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading applications...</span>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No applications received yet.
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead>Cover Letter</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application) => (
                          <TableRow key={application.application_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {application.candidate.first_name} {application.candidate.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {application.candidate.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {application.candidate.phone || 'Not provided'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getApplicationStatusBadge(application.status)}
                            </TableCell>
                            <TableCell>
                              {formatDateTime(application.application_date)}
                            </TableCell>
                            <TableCell>
                              {application.cover_letter ? (
                                <div className="max-w-xs truncate" title={application.cover_letter}>
                                  {application.cover_letter}
                                </div>
                              ) : (
                                <span className="text-gray-400">No cover letter</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card> */}
          </div>
        </main>
      </div>

      {/* Edit Job Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2 mb-2">
              <Label htmlFor="edit-title">Job Title *</Label>
              <Input
                id="edit-title"
                name="title"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                name="location"
                placeholder="e.g. San Francisco, CA"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Job Type *</Label>
                <Select
                  value={formData.job_type}
                  onValueChange={(value) => handleSelectChange("job_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL-TIME">Full-Time</SelectItem>
                    <SelectItem value="PART-TIME">Part-Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Job Description *</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateJob} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Job"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
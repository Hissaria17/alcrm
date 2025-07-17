"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Plus, Edit,  MapPin, Building, Calendar, Share2 } from "lucide-react";
import { truncateToWords } from "@/utils/text";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useClientRouteGuard } from "@/hooks/useClientRouteGuard";
import { toast } from "sonner";
import Link from "next/link";
import { JobPosting, RawJobData } from "@/types/job";
import { SocialShareDialog } from "@/components/ui/social-share-dialog";
import { AdminJobsTableSkeleton } from '@/components/skeletons/admin/admin-jobs-table-skeleton';
import { DataTable, DataColumn, formatDate, getStatusBadge } from "@/components/data-table";

const ITEMS_PER_PAGE = 10;

interface JobWithId extends JobPosting {
  id: string;
}

export default function JobsPage() {
  const { loading: authLoading, isAuthenticated } = useAuthGuard();
  
  // Client-side route protection
  useClientRouteGuard();
  
  const [jobPostings, setJobPostings] = useState<JobWithId[]>([]);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [jobToShare, setJobToShare] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm] = useState("");
  const [statusFilter] = useState<string>("all");
  const [typeFilter] = useState<string>("all");

  // Form state for add/edit
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "" as JobPosting["type"],
    salary: "",
    status: "OPEN" as JobPosting["status"],
    description: "",
  });

  const loadJobPostings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
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
          company_id,
          companies (
            name,
            company_id
          )
        `, { count: 'exact' });

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter.toUpperCase());
      }
      
      if (typeFilter !== "all") {
        // Map the filter values to the correct database enum values
        const typeMapping: { [key: string]: string } = {
          "full-time": "FULL-TIME",
          "part-time": "PART-TIME", 
          "contract": "CONTRACT",
          "internship": "INTERNSHIP"
        };
        query = query.eq('job_type', typeMapping[typeFilter]);
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data: jobs, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load job postings');
        setJobPostings([]);
        setTotalCount(0);
      } else if (jobs) {
        console.log('Raw jobs data:', jobs);
        console.log('First job companies data:', jobs[0]?.companies);
        
        // Transform the data to match our JobPosting interface
        const transformedJobs: JobWithId[] = await Promise.all(jobs.map(async (job: RawJobData) => {
          let companyName = 'Unknown Company';
          let companyId = '';
          
          // Try to get company name from the relationship first
          if (job.companies && job.companies.length > 0) {
            companyName = job.companies[0].name;
            companyId = job.companies[0].company_id;
          } else if (job.company_id) {
            // If no company data from relationship, try direct lookup
            console.log('No company data from relationship, looking up company_id:', job.company_id);
            const { data: companyData } = await supabase
              .from('companies')
              .select('name, company_id')
              .eq('company_id', job.company_id)
              .single();
            
            if (companyData) {
              companyName = companyData.name;
              companyId = companyData.company_id;
              console.log('Found company by direct lookup:', companyName);
            }
          }
          
          return {
            id: job.job_id,
            title: job.title,
            company: companyName,
            location: job.location || 'Not specified',
            type: job.job_type,
            salary: job.salary_range || 'Not specified',
            postedDate: new Date(job.created_at).toISOString().split('T')[0],
            status: job.status,
            description: job.description,
            company_id: companyId,
          };
        }));
        
        setJobPostings(transformedJobs);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load job postings');
      setJobPostings([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      loadJobPostings();
    }
  }, [isAuthenticated, loadJobPostings]);

  const handleAddJob = async () => {
    if (!formData.title || !formData.company || !formData.location || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // First, create or find the company
      let companyId;
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('company_id')
        .eq('name', formData.company)
        .single();

      if (existingCompany) {
        companyId = existingCompany.company_id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert([{ name: formData.company }])
          .select('company_id')
          .single();

        if (companyError) {
          console.error('Error creating company:', companyError);
          toast.error('Failed to create company');
          return;
        }
        companyId = newCompany.company_id;
      }

      // Create the job
      const { error: jobError } = await supabase
        .from('jobs')
        .insert([{
          title: formData.title,
          description: formData.description,
          job_type: formData.type,
          location: formData.location,
          status: formData.status,
          salary_range: formData.salary,
          company_id: companyId,
        }]);

      if (jobError) {
        console.error('Error creating job:', jobError);
        toast.error('Failed to create job posting');
      } else {
        toast.success('Job posting created successfully');
        setIsAddOpen(false);
        resetForm();
        loadJobPostings();
      }
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to create job posting');
    }
  };

  const handleEditJob = async () => {
    if (!editingJob || !formData.title || !formData.company || !formData.location || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // First, create or find the company
      let companyId;
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('company_id')
        .eq('name', formData.company)
        .single();

      if (existingCompany) {
        companyId = existingCompany.company_id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert([{ name: formData.company }])
          .select('company_id')
          .single();

        if (companyError) {
          console.error('Error creating company:', companyError);
          toast.error('Failed to create company');
          return;
        }
        companyId = newCompany.company_id;
      }

      // Update the job
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          title: formData.title,
          description: formData.description,
          job_type: formData.type,
          location: formData.location,
          status: formData.status,
          salary_range: formData.salary,
          company_id: companyId,
        })
        .eq('job_id', editingJob.id);

      if (jobError) {
        console.error('Error updating job:', jobError);
        toast.error('Failed to update job posting');
      } else {
        toast.success('Job posting updated successfully');
        setIsEditOpen(false);
        setEditingJob(null);
        resetForm();
        loadJobPostings();
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job posting');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('job_id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job posting');
      } else {
        toast.success('Job posting deleted successfully');
        setDeletingJobId(null);
        loadJobPostings();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job posting');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      type: "" as JobPosting["type"],
      salary: "",
      status: "OPEN" as JobPosting["status"],
      description: "",
    });
  };

  const openEditDialog = (job: JobPosting) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company??"",
      location: job.location,
      type: job.type,
      salary: job.salary??"",
      status: job.status,
      description: job.description,
    });
    setIsEditOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    loadJobPostings();
  };

  // Handle row click to navigate to job details
  const handleRowClick = (job: JobWithId) => {
    window.location.href = `/admin/dashboard/jobs/${job.id}`;
  };

  const columns: DataColumn<JobWithId>[] = [
    {
      key: "title",
      header: "Job Details",
      render: (job) => (
        <div className="min-w-0">
          <Link 
            href={`/admin/dashboard/jobs/${job.id}`}
            className="font-semibold truncate block"
          >
            {truncateToWords(job.title, 3)}
          </Link>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {truncateToWords(job.description, 3)}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "company",
      header: "Company",
      render: (job) => (
        <div className="flex items-center gap-2 min-w-0">
          <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "location",
      header: "Location",
      render: (job) => (
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "salary",
      header: "Salary",
      render: (job) => (
        <div className="min-w-0">
          <span className="truncate">{job.salary}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (job) => getStatusBadge(job.status),
      sortable: true,
    },
    {
      key: "postedDate",
      header: "Posted Date",
      render: (job) => (
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{formatDate(job.postedDate)}</span>
        </div>
      ),
      sortable: true,
    },
  ];

  const actions = [
    {
      label: "Edit",
      icon: Edit,
      onClick: (job: JobWithId) => openEditDialog(job),
      variant: "ghost" as const,
    },
    {
      label: "Share",
      icon: Share2,
      onClick: (job: JobWithId) => {
        setJobToShare(job);
        setIsShareOpen(true);
      },
      variant: "ghost" as const,
    },
  ];

  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader headerTitle="Job Postings" />
          <main className="flex-1 overflow-hidden bg-gray-50 p-6 min-h-0">
            <div className="h-full max-w-7xl mx-auto flex flex-col min-h-0">
              <AdminJobsTableSkeleton />
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
        <DashboardHeader headerTitle="Job Postings" />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 p-6 min-h-0">

          <div className="h-full max-w-7xl mx-auto flex flex-col min-h-0 pb">
            {loading ? <AdminJobsTableSkeleton /> : (
              <>
                <DataTable
                  data={jobPostings}
                  columns={columns}
                  title="Job Postings"
                  titleIcon={Building}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search jobs..."
                  searchKeys={["title", "description", "company", "location"] as (keyof JobWithId)[]}
                  sortable={true}
                  filterable={true}
                  filters={[
                    {
                      key: "status",
                      label: "Status",
                      options: [
                        { value: "all", label: "All Statuses" },
                        { value: "OPEN", label: "Open" },
                        { value: "CLOSED", label: "Closed" },
                        { value: "ARCHIVED", label: "Archived" },
                      ],
                    },
                    {
                      key: "type",
                      label: "Type",
                      options: [
                        { value: "all", label: "All Types" },
                        { value: "FULL-TIME", label: "Full Time" },
                        { value: "PART-TIME", label: "Part Time" },
                        { value: "CONTRACT", label: "Contract" },
                        { value: "INTERNSHIP", label: "Internship" },
                      ],
                    },
                  ]}
                  pagination={{
                    enabled: true,
                    pageSize: ITEMS_PER_PAGE,
                    currentPage: currentPage,
                    totalCount: totalCount,
                    onPageChange: handlePageChange,
                  }}
                  emptyMessage="No job postings found. Create your first job posting to get started."
                  emptyIcon={Building}
                  emptyAction={{
                    label: "Add New Job",
                    onClick: openAddDialog,
                    icon: Plus,
                  }}
                  addAction={{
                    label: "Add New Job",
                    onClick: openAddDialog,
                    icon: Plus,
                    show: true,
                  }}
                  loading={loading}
                  onRefresh={handleRefresh}
                  onRowClick={handleRowClick}
                  striped={true}
                  hoverable={true}
                  bordered={true}
                  theme="primary"
                  cardProps={{
                    showCard: true,
                    className: "shadow-sm",
                  }}
                  onDelete={(job) => setDeletingJobId(job.id)}
                  deleteConfirmation={{
                    title: "Delete Job Posting",
                    description: "Are you sure you want to delete this job posting? This action cannot be undone.",
                  }}
                />

                {/* Add Job Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Job Posting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title"
                        className="mb-2 block"
                        >Job Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g. Senior Software Engineer"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="company"
                        className="mb-2 block"
                        >Company *</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="e.g. Tech Corp"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="location"
                        className="mb-2 block"
                        >Location *</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g. New York, NY or Remote"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="salary"
                        className="mb-2 block"
                        >Salary Range</Label>
                        <Input
                          id="salary"
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                          placeholder="e.g. ₹8,00,000 - ₹12,00,000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type"
                        className="mb-2 block"
                        >Job Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => handleSelectChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FULL-TIME">Full Time</SelectItem>
                            <SelectItem value="PART-TIME">Part Time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status"
                        className="mb-2 block"
                        >Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleSelectChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description"
                        className="mb-2 block"
                        >Job Description *</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe the role, responsibilities, requirements..."
                          rows={6}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddJob}>
                          Create Job
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit Job Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Job Posting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-title"
                        className="mb-2 block"
                        >Job Title *</Label>
                        <Input
                          id="edit-title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g. Senior Software Engineer"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-company"
                        className="mb-2 block"
                        >Company *</Label>
                        <Input
                          id="edit-company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="e.g. Tech Corp"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-location"
                        className="mb-2 block"
                        >Location *</Label>
                        <Input
                          id="edit-location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g. New York, NY or Remote"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-salary"
                        className="mb-2 block"
                        >Salary Range</Label>
                        <Input
                          id="edit-salary"
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                          placeholder="e.g. ₹8,00,000 - ₹12,00,000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-type"
                        className="mb-2 block"
                        >Job Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => handleSelectChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FULL-TIME">Full Time</SelectItem>
                            <SelectItem value="PART-TIME">Part Time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-status"
                        className="mb-2 block"
                        >Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleSelectChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-description"
                        className="mb-2 block"
                        >Job Description *</Label>
                        <Textarea
                          id="edit-description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe the role, responsibilities, requirements..."
                          rows={6}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEditJob}>
                          Update Job
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deletingJobId !== null} onOpenChange={() => setDeletingJobId(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this job posting? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletingJobId && handleDeleteJob(deletingJobId)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Share Dialog */}
                <SocialShareDialog
                  open={isShareOpen}
                  onOpenChange={setIsShareOpen}
                  job={jobToShare}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 
"use client";

import { useEffect } from 'react';
import { use } from 'react';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useJobStore } from '@/store/useJobStore';
import { supabase } from '@/lib/supabase';
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Calendar, Plus, Briefcase, MapPin, Trash2, ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { JobType } from '@/lib/supabase';
import { toast } from 'sonner';
import { CompanyDetailSkeleton } from '@/components/skeletons/admin/company-detail-skeleton';
import { DataTable } from "@/components/data-table";
import Image from 'next/image';

interface JobWithId {
  id: string;
  job_id: string;
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  status: string;
  created_at: string;
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const companyId = resolvedParams.id;

  const {
    selectedCompany,
    isEditOpen,
    isUpdating,
    editedCompany,
    setSelectedCompany,
    setIsEditOpen,
    setEditedCompany,
    // loadCompanies,
    updateCompany,
  } = useCompanyStore();

  const {
    jobs,
    loading,
    // currentPage,
    // totalCount,
    // searchTerm,
    isAddOpen,
    isCreating,
    newJob,
    // setSearchTerm,
    // setCurrentPage,
    setIsAddOpen,
    setNewJob,
    loadJobs,
    addJob,
    deleteJob,
  } = useJobStore();

  useEffect(() => {
    const loadCompanyDetails = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error) {
        console.error('Error loading company:', error);
        return;
      }

      setSelectedCompany(data);
      setEditedCompany({
        name: data.name,
        website_url: data.website_url || "",
        description: data.description || ""
      });
    };

    loadCompanyDetails();
    loadJobs(companyId);
  }, [companyId, loadJobs, setSelectedCompany, setEditedCompany]);

  const handleUpdateCompany = async () => {
    await updateCompany(companyId);
  };

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.job_type) {
      toast.error('Job title, description, and type are required');
      return;
    }
    
    // Set the company_id before creating the job
    setNewJob({ ...newJob, company_id: companyId });
    await addJob(companyId);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }
    await deleteJob(jobId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Open</Badge>;
      case "CLOSED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Closed</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getJobTypeBadge = (jobType: JobType) => {
    const colors = {
      'FULL-TIME': 'bg-blue-100 text-blue-800',
      'PART-TIME': 'bg-purple-100 text-purple-800',
      'CONTRACT': 'bg-orange-100 text-orange-800',
      'INTERNSHIP': 'bg-pink-100 text-pink-800',
    };

    return (
      <Badge className={`${colors[jobType]} hover:${colors[jobType]}`}>
        {jobType.replace('-', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to get a random demo logo
  const getDemoLogo = (companyId: string) => {
    const demoLogos = [
      "https://ui-avatars.com/api/?name=Company&background=3b82f6&color=fff&size=80&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Corp&background=10b981&color=fff&size=80&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Inc&background=f59e0b&color=fff&size=80&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Ltd&background=ef4444&color=fff&size=80&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=LLC&background=8b5cf6&color=fff&size=80&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Group&background=06b6d4&color=fff&size=80&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Tech&background=ec4899&color=fff&size=80&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Co&background=84cc16&color=fff&size=80&rounded=true&bold=true&format=png",
    ];
    
    // Use company ID to consistently get the same logo for the same company
    const index = companyId.charCodeAt(0) % demoLogos.length;
    return demoLogos[index];
  };

  if (!selectedCompany || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader headerTitle="Company Details" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <CompanyDetailSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader headerTitle="Company Details" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/dashboard/companies">
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Companies
                  </Button>
                </Link>
              </div>

              {/* Company Info Card */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                          src={selectedCompany.logo_url || getDemoLogo(selectedCompany.company_id)}
                          alt={`${selectedCompany.name} logo`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to demo logo if image fails to load
                            (e.target as HTMLImageElement).src = getDemoLogo(selectedCompany.company_id);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedCompany.name}</h1>
                        {selectedCompany.description && (
                          <p className="text-gray-600 mb-4 leading-relaxed">{selectedCompany.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          {selectedCompany.website_url && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <a
                                href={selectedCompany.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created {formatDate(selectedCompany.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="cursor-pointer">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Company
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Company Details</DialogTitle>
                          <DialogDescription>
                            Update the company information below. All fields marked with * are required.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name" className="mb-2 block">Company Name *</Label>
                            <Input
                              id="edit-name"
                              value={editedCompany.name}
                              onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })}
                              placeholder="Enter company name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-website" className="mb-2 block">Company Website</Label>
                            <Input
                              id="edit-website"
                              value={editedCompany.website_url}
                              onChange={(e) => setEditedCompany({ ...editedCompany, website_url: e.target.value })}
                              placeholder="https://company.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description" className="mb-2 block">Company Description *</Label>
                            <Textarea
                              id="edit-description"
                              value={editedCompany.description}
                              onChange={(e) => setEditedCompany({ ...editedCompany, description: e.target.value })}
                              placeholder="Describe the company..."
                              rows={4}
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setIsEditOpen(false)}
                              disabled={isUpdating}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateCompany} disabled={isUpdating}>
                              {isUpdating ? "Updating..." : "Update Company"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Openings ({jobs.length})
                  </CardTitle>
                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post New Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Post New Job Opening</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title" className="mb-2 block">Job Title *</Label>
                          <Input
                            id="title"
                            value={newJob.title}
                            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                            placeholder="e.g. Senior Software Engineer"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="job_type" className="mb-2 block">Job Type *</Label>
                          <Select
                            value={newJob.job_type}
                            onValueChange={(value: JobType) => setNewJob({ ...newJob, job_type: value })}
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
                          <Label htmlFor="location" className="mb-2 block">Location</Label>
                          <Input
                            id="location"
                            value={newJob.location}
                            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                            placeholder="e.g. New York, NY or Remote"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description" className="mb-2 block">Job Description *</Label>
                          <Textarea
                            id="description"
                            value={newJob.description}
                            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                            placeholder="Describe the role, responsibilities, requirements..."
                            rows={6}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddOpen(false)}
                            disabled={isCreating}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddJob} disabled={isCreating}>
                            {isCreating ? "Creating..." : "Post Job"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No job openings yet</h3>
                    <p className="text-gray-500 mb-4">Start by posting your first job opening.</p>
                    <Button onClick={() => setIsAddOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </div>
                ) : (
                  <DataTable<JobWithId>
                    data={jobs.map(job => ({ id: job.job_id, ...job }))}
                    columns={[
                      {
                        key: "title",
                        header: "Job Title",
                        render: (job: JobWithId) => (
                          <div>
                            <div className="font-semibold text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {job.description.substring(0, 100)}...
                            </div>
                          </div>
                        ),
                        sortable: true,
                      },
                      {
                        key: "job_type",
                        header: "Type",
                        render: (job: JobWithId) => getJobTypeBadge(job.job_type),
                        sortable: true,
                      },
                      {
                        key: "location",
                        header: "Location",
                        render: (job: JobWithId) => (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {job.location || "Not specified"}
                            </span>
                          </div>
                        ),
                        sortable: true,
                      },
                      {
                        key: "status",
                        header: "Status",
                        render: (job: JobWithId) => getStatusBadge(job.status),
                        sortable: true,
                      },
                      {
                        key: "created_at",
                        header: "Posted",
                        render: (job: JobWithId) => (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(job.created_at)}
                            </span>
                          </div>
                        ),
                        sortable: true,
                      },
                    ]}
                    actions={[
                      {
                        label: "Delete",
                        icon: Trash2,
                        onClick: (job: JobWithId) => handleDeleteJob(job.job_id),
                        variant: "ghost" as const,
                        className: "text-red-600 hover:text-red-700",
                      },
                    ]}
                    searchable={true}
                    searchPlaceholder="Search jobs..."
                    searchKeys={["title", "description", "location"] as (keyof JobWithId)[]}
                    sortable={true}
                    emptyMessage="No job openings yet"
                    emptyIcon={Briefcase}
                    emptyAction={{
                      label: "Post New Job",
                      onClick: () => setIsAddOpen(true),
                      icon: Plus,
                    }}
                    loading={loading}
                    striped={true}
                    hoverable={true}
                    bordered={true}
                    theme="primary"
                    cardProps={{
                      showCard: false,
                    }}
                    onDelete={(job: JobWithId) => handleDeleteJob(job.job_id)}
                    deleteConfirmation={{
                      title: "Delete Job",
                      description: "Are you sure you want to delete this job? This action cannot be undone.",
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 
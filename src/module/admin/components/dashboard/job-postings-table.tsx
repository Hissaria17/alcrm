"use client";

import { useState } from "react";
import { DataTable, DataColumn, DataAction, getStatusBadge, getTypeBadge, formatDate } from "@/components/data-table";
import { Edit, Eye, Calendar, Copy, Plus } from "lucide-react";
import { JobPosting } from "@/types/job";
import { EditJobDialog } from "./edit-job-dialog";
import { AddJobDialog } from "./add-job-dialog";

interface JobPostingsTableProps {
  jobPostings: JobPosting[];
  onDelete: (jobId: string) => void;
  onEdit: (job: JobPosting) => void;
  onAddJob?: (job: Omit<JobPosting, "id" | "postedDate">) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export function JobPostingsTable({ 
  jobPostings, 
  onDelete, 
  onEdit, 
  onAddJob,
  loading = false,
  onRefresh 
}: JobPostingsTableProps) {
  const [editJob, setEditJob] = useState<JobPosting | null>(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  const handleEdit = (job: JobPosting) => {
    setEditJob(job);
  };

  const handleEditSave = (updatedJob: JobPosting) => {
    onEdit(updatedJob);
    setEditJob(null);
  };

  const handleAddJob = (newJob: Omit<JobPosting, "id" | "postedDate">) => {
    if (onAddJob) {
      onAddJob(newJob);
      setIsAddJobOpen(false);
    }
  };

  const handleCopyJobId = (job: JobPosting) => {
    navigator.clipboard.writeText(job.id);
  };

  const handleViewDetails = (job: JobPosting) => {
    // Navigate to job details page
    window.open(`/admin/dashboard/jobs/${job.id}`, '_blank');
  };

  // Define table columns
  const columns: DataColumn<JobPosting>[] = [
    {
      key: "title",
      header: "Job Title",
      render: (job) => (
        <div>
          <div className="font-semibold text-gray-900">{job.title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {job.description}
          </div>
        </div>
      ),
      sortable: true,
      width: "25%"
    },
    {
      key: "company",
      header: "Company",
      sortable: true,
      width: "15%"
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      width: "12%"
    },
    {
      key: "type",
      header: "Type",
      render: (job) => getTypeBadge(job.type),
      sortable: true,
      width: "10%"
    },
    {
      key: "salary",
      header: "Salary",
      sortable: true,
      width: "10%"
    },
    {
      key: "status",
      header: "Status",
      render: (job) => getStatusBadge(job.status),
      sortable: true,
      width: "10%"
    },
    {
      key: "postedDate",
      header: "Posted Date",
      render: (job) => formatDate(job.postedDate),
      sortable: true,
      width: "12%"
    }
  ];

  // Define table actions
  const actions: DataAction<JobPosting>[] = [
    {
      label: "Copy Job ID",
      icon: Copy,
      onClick: handleCopyJobId,
      variant: "ghost"
    },
    {
      label: "Edit Job",
      icon: Edit,
      onClick: handleEdit,
      variant: "ghost"
    },
    {
      label: "View Details",
      icon: Eye,
      onClick: handleViewDetails,
      variant: "ghost"
    }
  ];

  // Define filters
  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "OPEN", label: "Open" },
        { value: "CLOSED", label: "Closed" },
        { value: "ARCHIVED", label: "Archived" }
      ]
    },
    {
      key: "type",
      label: "Job Type",
      options: [
        { value: "FULL-TIME", label: "Full-Time" },
        { value: "PART-TIME", label: "Part-Time" },
        { value: "CONTRACT", label: "Contract" },
        { value: "INTERNSHIP", label: "Internship" }
      ]
    }
  ];

  return (
    <>
      <DataTable
        data={jobPostings}
        columns={columns}
        title="Job Postings"
        titleIcon={Calendar}
        subtitle={`${jobPostings.length} job postings found`}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search jobs by title, company, or location..."
        searchKeys={["title", "company", "location"]}
        filterable={true}
        filters={filters}
        sortable={true}
        pagination={{
          enabled: true,
          pageSize: 10,
          currentPage: 1,
          totalCount: jobPostings.length
        }}
        emptyMessage="No job postings found"
        emptyAction={onAddJob ? {
          label: "Create Job Posting",
          onClick: () => setIsAddJobOpen(true),
          icon: Plus
        } : undefined}
        onDelete={job => onDelete(job.id)}
        deleteConfirmation={{
          title: "Delete Job Posting",
          description: "This action cannot be undone. This will permanently delete the job posting and remove all associated data."
        }}
        loading={loading}
        onRefresh={onRefresh}
        showRowNumbers={true}
        striped={true}
        hoverable={true}
        compact={false}
        bordered={true}
        theme="primary"
        cardProps={{
          showCard: true,
          className: "shadow-sm"
        }}
      />

      {/* Edit Job Dialog */}
      {editJob && (
        <EditJobDialog
          job={editJob}
          open={editJob !== null}
          onOpenChange={() => setEditJob(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Add Job Dialog */}
      {onAddJob && (
        <AddJobDialog
          open={isAddJobOpen}
          onOpenChange={setIsAddJobOpen}
          onAddJob={handleAddJob}
        />
      )}
    </>
  );
} 
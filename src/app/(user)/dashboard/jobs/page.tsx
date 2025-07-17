"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable, DataColumn, getStatusBadge, getTypeBadge, formatDate } from "@/components/data-table";
import { MapPin, Calendar, Briefcase, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserJobListing, JobPosting, ApplicationStatus } from "@/types/job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobsSkeleton } from '@/components/skeletons/user/jobs-skeleton';
import { truncateToWords } from "@/utils/text";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 10;

// Extended JobPosting interface to include application status
interface JobPostingWithApplication extends JobPosting {
  applicationStatus?: ApplicationStatus;
}

export default function JobsPage() {
  const { user } = useAuthStore();
  const [jobPostings, setJobPostings] = useState<JobPostingWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Check application status for a job
  const checkApplicationStatus = useCallback(async (jobId: string): Promise<ApplicationStatus | null> => {
    if (!user?.id) return null;
    
    try {
      const { data: application, error } = await supabase
        .from('jobapplications')
        .select('status')
        .eq('job_id', jobId)
        .eq('candidate_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking application status:', error);
        return null;
      }

      return application?.status || null;
    } catch (error) {
      console.error('Error checking application status:', error);
      return null;
    }
  }, [user?.id]);

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
        // Transform the data to match our JobPosting interface and check application status
        const transformedJobs: JobPostingWithApplication[] = await Promise.all(jobs.map(async (job: UserJobListing) => {
          const applicationStatus = await checkApplicationStatus(job.job_id);
          
          return {
            id: job.job_id,
            title: job.title,
            location: job.location || 'Not specified',
            type: job.job_type,
            salary: job.salary_range || 'Not specified',
            postedDate: new Date(job.created_at).toISOString().split('T')[0],
            status: job.status,
            description: job.description,
            applicationStatus: applicationStatus || undefined
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
  }, [currentPage, searchTerm, statusFilter, typeFilter, checkApplicationStatus]);

  useEffect(() => {
    loadJobPostings();
  }, [loadJobPostings]);

  // Function to get application status badge
  const getApplicationStatusBadge = (status: ApplicationStatus | undefined) => {
    if (!status) return null;
    
    switch (status) {
      case "APPLIED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Applied</Badge>;
      case "SHARED_WITH_COMPANY":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shared</Badge>;
      case "SHORTLISTED":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shortlisted</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case "INTERVIEW_SCHEDULED":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Interview</Badge>;
      case "INTERVIEW_COMPLETED":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Completed</Badge>;
      case "SELECTED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selected</Badge>;
      case "WITHDRAWN":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Define columns for the DataTable
  const columns: DataColumn<JobPostingWithApplication>[] = [
    {
      key: "title",
      header: "Position",
      render: (job) => (
        <div>
          <div className="font-semibold">{truncateToWords(job.title, 3)}</div>
          <div className="text-sm text-gray-500 line-clamp-2">
            {truncateToWords(job.description, 3)}
          </div>
        </div>
      ),
      sortable: false, // Disable client-side sorting since we're doing server-side
    },
    {
      key: "location",
      header: "Location",
      render: (job) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{job.location}</span>
        </div>
      ),
      sortable: false,
    },
    {
      key: "salary",
      header: "Salary",
      render: (job) => (
        <div>
          <span>{job.salary}</span>
        </div>
      ),
      sortable: false,
    },
    {
      key: "type",
      header: "Type",
      render: (job) => getTypeBadge(job.type),
      sortable: false,
    },
    {
      key: "applicationStatus",
      header: "Application",
      render: (job) => getApplicationStatusBadge(job.applicationStatus),
      sortable: false,
    },
    {
      key: "status",
      header: "Status",
      render: (job) => getStatusBadge(job.status),
      sortable: false,
    },
    {
      key: "postedDate",
      header: "Posted",
      render: (job) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDate(job.postedDate)}</span>
        </div>
      ),
      sortable: false,
    },
  ];

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle row click to navigate to job details
  const handleRowClick = (job: JobPostingWithApplication) => {
    window.location.href = `/dashboard/jobs/${job.id}`;
  };

  // Handle view details action
  const handleViewDetails = (job: JobPostingWithApplication) => {
    // Navigate to job details page
    window.location.href = `/dashboard/jobs/${job.id}`;
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  if (loading) {
    return <JobsSkeleton />;
  }

  return (
    <>
      {/* Custom Search and Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleClearFilters}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DataTable for display */}
      <DataTable
        data={jobPostings}
        columns={columns}
        title="Job Postings"
        titleIcon={Briefcase}
        subtitle={`Showing ${jobPostings.length} of ${totalCount} jobs`}
        searchable={false} // Disable client-side search since we're doing server-side
        filterable={false} // Disable client-side filtering since we're doing server-side
        sortable={false} // Disable client-side sorting since we're doing server-side
        pagination={{
          enabled: true,
          pageSize: ITEMS_PER_PAGE,
          currentPage: currentPage,
          totalCount: totalCount,
          onPageChange: handlePageChange,
        }}
        emptyMessage="No job postings found"
        loading={loading}
        onRefresh={loadJobPostings}
        onRowClick={handleRowClick}
        striped={true}
        hoverable={true}
        bordered={true}
        theme="primary"
        actions={[
          {
            label: "View Details",
            onClick: handleViewDetails,
            variant: "outline",
          },
        ]}
        cardProps={{
          showCard: true,
          className: "shadow-md",
        }}
      />
    </>
  );
} 
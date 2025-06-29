import { JobPostingsTableSkeleton } from "./job-postings-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboardContentSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Message Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-72 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6 rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Postings Table Skeleton */}
      <JobPostingsTableSkeleton />
    </div>
  );
} 
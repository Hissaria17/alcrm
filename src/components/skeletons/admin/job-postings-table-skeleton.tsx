import { Skeleton } from "@/components/ui/skeleton";

export function JobPostingsTableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="rounded-md border">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-50">
            <div className="flex">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1">
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex hover:bg-gray-50">
                {Array.from({ length: 8 }).map((_, colIdx) => (
                  <div key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex-1">
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
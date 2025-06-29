import { Skeleton } from "@/components/ui/skeleton";

export function AdminJobDetailSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Back Button Skeleton */}
          <Skeleton className="h-10 w-40 mb-4" />
          {/* Job Header Card Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <Skeleton className="h-10 w-80 mb-2" />
                <div className="flex items-center gap-4 flex-wrap mb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </main>
    </div>
  );
} 
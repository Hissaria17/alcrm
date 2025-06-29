import { Skeleton } from "@/components/ui/skeleton";

export function CareerGuidanceSkeleton() {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1A237E] via-[#3949AB] to-[#5C6BC0] text-white py-16 px-6 rounded-lg mb-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-2/3 mx-auto mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-10 w-24 mx-auto mb-1" />
                <Skeleton className="h-4 w-28 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl shadow-md">
              <Skeleton className="h-8 w-40 mb-4" />
              <Skeleton className="h-4 w-56 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>

        {/* Personal Reference Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-md">
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-4 w-56 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-3" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#1A237E] to-[#3949AB] rounded-2xl p-8 text-center text-white">
          <Skeleton className="h-10 w-96 mx-auto mb-4" />
          <Skeleton className="h-4 w-2/3 mx-auto mb-6" />
          <Skeleton className="h-12 w-64 mx-auto rounded-lg" />
        </div>
      </div>
    </>
  );
} 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthSkeletonProps {
  type: 'signin' | 'signup';
}

export function AuthSkeleton({ type }: AuthSkeletonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-4 pb-8 text-center">
          {/* Icon skeleton */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Skeleton className="h-8 w-8 rounded-lg bg-white/20" />
          </div>
          
          <div className="space-y-2">
            {/* Title skeleton */}
            <CardTitle className="text-3xl font-bold">
              <Skeleton className="h-8 w-48 mx-auto bg-gradient-to-r from-indigo-600 to-purple-600" />
            </CardTitle>
            {/* Description skeleton */}
            <CardDescription className="text-base">
              <Skeleton className="h-5 w-64 mx-auto bg-gray-300" />
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error alert skeleton (hidden by default) */}
          <div className="hidden">
            <Skeleton className="h-16 w-full rounded-lg bg-red-50" />
          </div>
          
          <div className="space-y-5">
            {/* Email field skeleton */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded bg-indigo-500" />
                <Skeleton className="h-4 w-24 bg-gray-300" />
              </div>
              <div className="relative">
                <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
                <Skeleton className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 rounded bg-gray-400" />
              </div>
            </div>
            
            {/* Password field skeleton */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded bg-indigo-500" />
                <Skeleton className="h-4 w-20 bg-gray-300" />
              </div>
              <div className="relative">
                <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
                <Skeleton className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 rounded bg-gray-400" />
                <Skeleton className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg bg-gray-300" />
              </div>
            </div>
            
            {/* Confirm Password field skeleton (only for signup) */}
            {type === 'signup' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded bg-purple-500" />
                  <Skeleton className="h-4 w-32 bg-gray-300" />
                </div>
                <div className="relative">
                  <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
                  <Skeleton className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 rounded bg-gray-400" />
                  <Skeleton className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg bg-gray-300" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-6 pt-6">
          {/* Submit button skeleton */}
          <Skeleton className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600" />
          
          {/* Link skeleton */}
          <div className="text-center">
            <Skeleton className="h-4 w-48 mx-auto bg-gray-300" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 
"use client";

import { DashboardHeader } from "@/module/user/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/user/components/dashboard/dashboard-sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useClientRouteGuard } from "@/hooks/useClientRouteGuard";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated } = useAuthGuard();
  
  // Client-side route protection
  useClientRouteGuard();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" />
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader headerTitle="Dashboard" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">

            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 
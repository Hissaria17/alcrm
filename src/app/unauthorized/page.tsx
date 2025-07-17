"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  const handleGoBack = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              {user?.role === 'ADMIN' 
                ? "This page is only accessible to regular users."
                : "This page is only accessible to administrators."
              }
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button onClick={handleGoBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
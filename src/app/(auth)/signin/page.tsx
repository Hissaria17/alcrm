"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { AuthSkeleton } from "@/components/skeletons/auth-skeleton";
import { isPublicRoute, DEFAULT_REDIRECTS, type UserRole } from "@/lib/auth-utils";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, checkAuth, login } = useAuthStore();
  

  const routerRef = useRef(router);
  routerRef.current = router;

  // Helper function to get safe redirect URL
  const getRedirectUrl = useCallback((userRole: UserRole | null) => {
    const returnUrl = searchParams.get('returnUrl');
    
    // If no return URL, use default redirects
    if (!returnUrl) {
      return userRole === 'ADMIN' ? DEFAULT_REDIRECTS.ADMIN : DEFAULT_REDIRECTS.USER;
    }

    // Security check: Only allow safe internal redirects
    // Prevent open redirect vulnerabilities
    if (returnUrl.startsWith('http') || returnUrl.startsWith('//')) {
      console.warn('Blocked external redirect attempt:', returnUrl);
      return userRole === 'ADMIN' ? DEFAULT_REDIRECTS.ADMIN : DEFAULT_REDIRECTS.USER;
    }

    // Don't redirect to auth pages
    if (returnUrl === '/signin' || returnUrl === '/signup') {
      return userRole === 'ADMIN' ? DEFAULT_REDIRECTS.ADMIN : DEFAULT_REDIRECTS.USER;
    }

    // For admins, only allow admin routes or public routes
    if (userRole === 'ADMIN') {
      if (returnUrl.startsWith('/admin') || isPublicRoute(returnUrl)) {
        return returnUrl;
      }
      return DEFAULT_REDIRECTS.ADMIN;
    }

    // For users, only allow user routes or public routes, but not admin routes
    if (userRole === 'USER') {
      if (returnUrl.startsWith('/admin')) {
        return DEFAULT_REDIRECTS.USER;
      }
      if (returnUrl.startsWith('/dashboard') || isPublicRoute(returnUrl)) {
        return returnUrl;
      }
      return DEFAULT_REDIRECTS.USER;
    }

    // Fallback
    return DEFAULT_REDIRECTS.USER;
  }, [searchParams]);

  const checkUserAuth = useCallback(async () => {
    let isMounted = true;
    
    try {
      await checkAuth();
      
      if (!isMounted) return;
      
      const { isAuthenticated: currentAuth, user: currentUser } = useAuthStore.getState();
      
      if (currentAuth && currentUser) {
        const redirectUrl = getRedirectUrl(currentUser.role as UserRole);
        routerRef.current.push(redirectUrl);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      if (isMounted) {
        setIsCheckingAuth(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [checkAuth, getRedirectUrl]);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await login(email, password);
      const redirectUrl = getRedirectUrl(user?.role as UserRole);
      router.push(redirectUrl);
    } catch (err: unknown) {
      console.error("Signin error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <AuthSkeleton type="signin" />;
  }

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Sign in to your account
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-500" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 pl-12 pr-4 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-xl bg-white/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 pl-12 pr-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-xl bg-white/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 pt-6">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            
            <div className="flex flex-col space-y-3 text-center">
              <Link 
                href="#" 
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 hover:underline"
              >
                Forgot password?
              </Link>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/signup" 
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-200 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthSkeleton type="signin" />}>
      <SignInForm />
    </Suspense>
  );
}

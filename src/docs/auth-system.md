# Authentication & Authorization System

This document outlines the comprehensive authentication and authorization system implemented in the application, providing role-based access control for admin and user routes.

## Overview

The system provides:
- **Server-side middleware** for route protection
- **Client-side route guards** for component-level protection
- **Role-based access control** (ADMIN vs USER)
- **Centralized configuration** for easy maintenance

## User Roles

```typescript
type UserRole = 'ADMIN' | 'USER';
```

### ADMIN Role
- Access to `/admin/*` routes
- Can view admin dashboard, manage jobs, companies, applications
- Cannot access user-specific routes (redirected to admin dashboard)

### USER Role  
- Access to `/(user)/dashboard/*` routes
- Can browse jobs, apply for positions, access career guidance
- Cannot access admin routes (redirected to unauthorized page)

## Route Structure

### Public Routes
- `/` - Home page
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/jobs/*` - Public job listings (accessible by all)
- `/unauthorized` - Access denied page

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/dashboard/jobs` - Job management
- `/admin/dashboard/applications` - Application management
- `/admin/dashboard/companies` - Company management
- `/admin/dashboard/profile` - Admin profile
- `/admin/dashboard/free-resources` - Resource management

### User Routes
- `/dashboard` - User dashboard (mapped to `/(user)/dashboard`)
- `/dashboard/jobs` - Job browsing
- `/dashboard/applied` - Applied jobs
- `/dashboard/career-guidance` - Career guidance tools
- `/dashboard/profile` - User profile
- `/dashboard/free-resources` - Available resources

## Server-Side Protection (Middleware)

The middleware (`middleware.ts` and `src/utils/supabase/middleware.ts`) automatically:

1. **Authenticates users** via Supabase session
2. **Validates roles** from the database
3. **Redirects unauthorized access** appropriately
4. **Allows contextual routes** (like `/jobs`) for both roles

### How It Works

```typescript
// Example middleware flow
if (!user) {
  // Redirect to signin for protected routes
  return redirect('/signin');
}

const userRole = await getUserRole(user.id);

if (userRole === 'ADMIN' && isUserRoute(path)) {
  return redirect('/admin/dashboard');
}

if (userRole === 'USER' && isAdminRoute(path)) {
  return redirect('/unauthorized');
}
```

## Client-Side Protection (Route Guards)

### Basic Route Guard

```typescript
import { useRouteGuard } from '@/hooks/useRouteGuard';

function MyComponent() {
  const { user, isAuthenticated, hasAccess, isAdmin } = useRouteGuard();

  if (!hasAccess) {
    return <div>Checking access...</div>;
  }

  return <div>Protected content</div>;
}
```

### Admin-Only Protection

```typescript
import { useAdminRouteGuard } from '@/hooks/useRouteGuard';

function AdminComponent() {
  const { user, isLoading } = useAdminRouteGuard();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return <div>Admin-only content</div>;
}
```

### User-Only Protection

```typescript
import { useUserRouteGuard } from '@/hooks/useRouteGuard';

function UserComponent() {
  const { user, isLoading } = useUserRouteGuard();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return <div>User-only content</div>;
}
```

### Custom Protection

```typescript
import { useRouteGuard } from '@/hooks/useRouteGuard';

function CustomComponent() {
  const { hasAccess } = useRouteGuard({
    requiredRole: 'ADMIN',
    showErrorToast: false,
    customRedirect: '/custom-error-page'
  });

  return hasAccess ? <AdminContent /> : null;
}
```

## Utility Functions

The `@/lib/auth-utils` module provides helpful utilities:

### Route Checking
```typescript
import { isAdminRoute, isUserRoute, hasRouteAccess } from '@/lib/auth-utils';

// Check if current path is admin-only
if (isAdminRoute('/admin/dashboard')) {
  // Handle admin route
}

// Check if user has access to a specific route
if (hasRouteAccess('USER', '/dashboard/jobs')) {
  // User can access this route
}
```

### Access Validation
```typescript
import { validateUserAccess } from '@/lib/auth-utils';

const { hasAccess, redirectTo } = validateUserAccess('USER', '/admin/dashboard');
if (!hasAccess && redirectTo) {
  router.push(redirectTo); // Redirects to /unauthorized
}
```

## Database Schema

The user table includes a `role` column:

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  role text CHECK (role IN ('ADMIN', 'USER')) NOT NULL DEFAULT 'USER',
  -- other fields...
);
```

## Security Features

### 1. **Server-Side First**
- All route protection happens on the server via middleware
- Client-side guards are supplementary for UX

### 2. **Role Validation**
- User roles are fetched from database on each request
- No reliance on client-side role storage

### 3. **Graceful Redirects**
- Admins trying to access user routes → Admin dashboard
- Users trying to access admin routes → Unauthorized page
- Unauthenticated users → Sign in page

### 4. **Contextual Routes**
- Routes like `/jobs` are accessible by both roles
- Different content/functionality based on role

## Adding New Routes

### 1. Update Route Constants

```typescript
// In src/lib/auth-utils.ts
export const ADMIN_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/new-feature', // Add new admin route
] as const;

export const USER_ROUTES = [
  '/dashboard',
  '/dashboard/jobs',
  '/dashboard/new-feature', // Add new user route
] as const;
```

### 2. Create Protected Component

```typescript
// New admin feature
function NewAdminFeature() {
  const { isLoading } = useAdminRouteGuard();

  if (isLoading) return <LoadingSkeleton />;

  return <div>New admin feature</div>;
}

// New user feature
function NewUserFeature() {
  const { isLoading } = useUserRouteGuard();

  if (isLoading) return <LoadingSkeleton />;

  return <div>New user feature</div>;
}
```

### 3. No Middleware Changes Needed
The middleware automatically protects new routes based on the updated constants.

## Testing Access Control

### Manual Testing
1. **Create admin user** in database with `role = 'ADMIN'`
2. **Create regular user** with `role = 'USER'`
3. **Test route access** for each role
4. **Verify redirects** work correctly

### Test Scenarios
- [ ] Admin cannot access `/dashboard/*`
- [ ] User cannot access `/admin/*`
- [ ] Both can access `/jobs/*`
- [ ] Unauthenticated users redirected to `/signin`
- [ ] Auth routes redirect authenticated users to their dashboard

## Troubleshooting

### Common Issues

**1. User stuck in redirect loop**
- Check if user has valid role in database
- Verify middleware route constants are correct

**2. Route not protected**
- Ensure route is added to appropriate constants
- Check middleware configuration

**3. Client-side protection not working**
- Verify `useRouteGuard` is used in component
- Check if auth store is properly initialized

### Debug Tools

```typescript
// Add to any component to debug auth state
import { useAuthStore } from '@/store/useAuthStore';

function DebugAuth() {
  const { user, isAuthenticated } = useAuthStore();
  
  console.log('User:', user);
  console.log('Authenticated:', isAuthenticated);
  console.log('Role:', user?.role);
  
  return null;
}
```

## Best Practices

1. **Always use server-side protection first** (middleware)
2. **Add client-side guards for better UX** (hooks)
3. **Keep route constants centralized** (auth-utils)
4. **Test both positive and negative access scenarios**
5. **Use loading states while checking authentication**
6. **Provide clear error messages for unauthorized access**

This system ensures robust, scalable authentication and authorization for your Next.js application. 
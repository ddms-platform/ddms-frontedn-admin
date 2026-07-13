import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/data/user';
import { routeName } from '@/constants/route-name';

interface ProtectedRouteProps {
  redirectPath?: string;
  unauthorizedPath?: string;
  roles?: UserRole[];
}

export default function ProtectedRoute({
  redirectPath = routeName.signIn,
  unauthorizedPath = '/',
  roles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    const hasRequiredRole = user?.roles.some((role) => roles.includes(role));

    if (!hasRequiredRole) {
      return <Navigate to={unauthorizedPath} replace />;
    }
  }

  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';

interface OwnerRouteProps {
  redirectPath?: string;
}

/**
 * Route guard that checks both authentication and owner role.
 * Redirects to sign-in if not authenticated, or home if not an owner.
 */
export default function OwnerRoute({
  redirectPath = routeName.signIn,
}: OwnerRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  const isOwner = user?.roles.includes('owner') ?? false;
  if (!isOwner) {
    return <Navigate to={routeName.home} replace />;
  }

  return <Outlet />;
}

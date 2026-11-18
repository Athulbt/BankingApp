import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Spinner } from './ui';

const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50" role="status" aria-label="Loading">
    <Spinner className="h-8 w-8" />
  </div>
);

// Only for signed-in users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

// Login / sign-up pages: send signed-in users to their dashboard
export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default ProtectedRoute;

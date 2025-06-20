import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show nothing while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not admin
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Render children if user is admin
  return children;
};

export default AdminRoute; 
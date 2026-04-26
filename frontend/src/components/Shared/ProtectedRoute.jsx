import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Loader from "./Loader";

// Protects routes that require authentication
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen text="Authenticating..." />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
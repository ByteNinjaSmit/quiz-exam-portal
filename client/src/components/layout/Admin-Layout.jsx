import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../store/auth";

export const AdminLayout = () => {
  const { user, isAdmin, isLoading,isLoggedIn } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1>Loading ...........</h1>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  if(user){
    if (!isAdmin) {
      return <Navigate to="/" />;
    } else if (location.pathname === '/admin') {
      return <Navigate to="/admin/dashboard" />;
    }
  }

  return <Outlet />;
};

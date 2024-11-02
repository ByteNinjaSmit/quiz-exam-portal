import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../store/auth";

export const UserLayout = () => {
    const { user, isAdmin, isLoading,isLoggedIn } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1>Loading ...........</h1>
            </div>
        );
    }
    if(!isLoggedIn){
        return <Navigate to="/" />;
    }
    // Redirect non-admin users to home, and "/admin" to "/admin/dashboard"
    if (isAdmin && location.pathname.startsWith('/user')) {
        // Redirect admins trying to access user-specific routes to the admin dashboard
        return <Navigate to="/admin/dashboard" />;
    } else if (!isAdmin && location.pathname.startsWith('/admin')) {
        // Redirect non-admin users trying to access admin-specific routes to the home page
        return <Navigate to="/" />;
    } else if (!isAdmin && location.pathname === '/user') {
        // Redirect non-admin users on the /user route to their dashboard
        return <Navigate to="/user/dashboard" />;
    }
    

    return <Outlet />;
};

import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../store/auth";

export const UserLayout = () => {
    const { user, isAdmin, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1>Loading ...........</h1>
            </div>
        );
    }
    // Redirect non-admin users to home, and "/admin" to "/admin/dashboard"
    if (!isAdmin && !user) {
        return <Navigate to="/" />;
    } else if (!isAdmin && user) {
        if (location.pathname === '/user') {
            return <Navigate to="/user/dashboard" />;
        }
    }

    return <Outlet />;
};

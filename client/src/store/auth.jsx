import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Create context
export const AuthContext = createContext();

// Helper function to get token from cookies
const getTokenFromCookies = () => {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="));
    return cookieValue ? cookieValue.split("=")[1] : null;
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(getTokenFromCookies());
    const [user, setUser] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isTeacher, setIsTeacher] = useState(false);
    const [isHod, setIsHod] = useState(false);
    const [isTnp, setIsTnp] = useState(false);
    const [isDeveloper, setIsDeveloper] = useState(false);
    const authorizationToken = `Bearer ${token}`;
    // const navigate = useNavigate();

    // Function to store token in cookies
    const storeTokenInCookies = (serverToken) => {
        setToken(serverToken);
        document.cookie = `authToken=${serverToken}; path=/; max-age=3600; secure; samesite=None`;
    };

    // API URL from environment variables
    const API = import.meta.env.VITE_APP_URI_API;

    // Check if the user is logged in
    let isLoggedIn = !!token;
    console.log("isLoggedIn", isLoggedIn);

    // Logout functionality
    const LogoutUser = () => {
        setToken(null);
        setUser(null);
        setIsAdmin(false);
        setIsDeveloper(false);
        // Remove token from cookies
        document.cookie = "authToken=; path=/; max-age=0";
        toast.success(`Logout Successfully`);

        // Navigate to the home page after a short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 500); // Delay navigation for 2 seconds (2000 ms)

    };

    // JWT Authentication - fetch current logged-in user data
    const userAuthentication = async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const response = await axios.get(`${API}/api/auth/current/user`, {
                headers: {
                    Authorization: authorizationToken,
                },
                withCredentials: true,
            });
            if (response.status == 200) {
                const data = response.data;
                setUser(data.userData);
                const { isTeacher, isHod, isTnp, isDeveloper } = data.userData || {}
                setIsAdmin(isTeacher || isHod || isTnp);
                setIsTeacher(isTeacher || false);
                setIsHod(isHod || false);
                setIsTnp(isTnp || false);
                setIsDeveloper(isDeveloper || false);

            } else {
                console.error("Error fetching user data");
            }
        } catch (error) {
            console.log("Error fetching user data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to handle initial user authentication if token exists
    useEffect(() => {
        if (token) {
            userAuthentication();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        // Reset all role flags first
        setIsAdmin(false);
        setIsTeacher(false);
        setIsHod(false);
        setIsTnp(false);
        setIsDeveloper(false);

        // Check and set roles based on the user object
        if (user) {
            const { isTeacher, isHod, isTnp, isDeveloper } = user;

            setIsAdmin(isTeacher || isHod || isTnp); // Admin if any of the roles is true
            setIsTeacher(isTeacher || false);
            setIsHod(isHod || false);
            setIsTnp(isTnp || false);
            setIsDeveloper(isDeveloper || false);
            if (isDeveloper) {
                console.log(`This is Developer`);
            }
        }
    }, [user]);




    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                storeTokenInCookies,
                LogoutUser,
                user,
                authorizationToken,
                isLoading,
                isAdmin,
                isTeacher,
                isHod,
                isTnp,
                isDeveloper,
                API,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth must be used within the AuthProvider");
    }
    return authContextValue;
};

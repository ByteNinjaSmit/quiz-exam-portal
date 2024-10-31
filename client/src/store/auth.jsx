import { createContext, useContext, useEffect, useState } from "react";

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
    const authorizationToken = `Bearer ${token}`;


    // Function to store token in cookies
    const storeTokenInCookies = (serverToken) => {
        setToken(serverToken);
        document.cookie = `authToken=${serverToken}; path=/; max-age=3600; secure; samesite=strict`;
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
        // Remove token from cookies
        document.cookie = "authToken=; path=/; max-age=0";
    };

    // JWT Authentication - fetch current logged-in user data
    const userAuthentication = async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const response = await fetch(`${API}/api/auth/current/user`, {
                method: "GET",
                credentials:"include",
                headers: {
                    Authorization: authorizationToken,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.userData);
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

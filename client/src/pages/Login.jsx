import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaUserGraduate } from "react-icons/fa";
import { useAuth } from "../store/auth"; // Ensure this is the correct path to the auth context
import { toast } from 'react-toastify';
import { NavLink, useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { isLoggedIn, API, storeTokenInCookies } = useAuth(); // Custom hook from AuthContext
    const navigate = useNavigate();




    const handleLogin = async (e) => {
        e.preventDefault();
        // console.log("Login attempted with:", { role, username, password });
        if (username && password) {
            if (role === "student") {
                try {
                    const response = await fetch(`${API}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password }),
                    });
                    const res_data = await response.json();
                    if (response.ok) {
                        toast.success("Login Successful");
                        storeTokenInCookies(res_data.token);
                        navigate("/");
                    } else {
                        toast.error(res_data.extraDetails ? res_data.extraDetails : res_data.message);
                    }
                } catch (error) {
                    console.log(user);
                    toast.error("Error logging in");
                }
            } else if (role === "teacher" || role === "hod") {
                try {
                    const response = await fetch(`${API}/api/auth/login/faculty`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password }),
                    });
                    const res_data = await response.json();
                    if (response.ok) {
                        toast.success("Login Successful");
                        storeTokenInCookies(res_data.token);
                        navigate("/");
                    } else {
                        toast.error(res_data.extraDetails ? res_data.extraDetails : res_data.message);
                    }
                } catch (error) {
                    console.log(user);
                    toast.error("Error logging in");
                }
            }

        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <div className="lg:w-1/2 relative h-[30vh] lg:h-screen">
                <img
                    src={imageError ? "/placeholder.jpg" : "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"}
                    alt={imageError ? "Fallback Campus Image" : "University Campus"}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-blue-900/40 flex flex-col items-center justify-center text-center">
                    <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-center px-4 leading-tight">
                        Empowering Education Through Technology
                    </h2>
                    <p className="text-xl text-center text-white p-2">
                        "Empowering education through innovative assessment solutions"
                    </p>
                </div>
            </div>

            <div className="lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-md">
                            <FaUserGraduate className="text-4xl text-blue-800" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
                        <p className="mt-2 text-sm sm:text-base text-gray-600">
                            Sign in to access your Exam Portal
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-8">
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Select Role
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="">Select your role</option>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="hod">HOD</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center mb-6">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-800 text-white rounded-lg py-3 px-4 font-bold hover:bg-blue-900 transition duration-300 mb-4"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
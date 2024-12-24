import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { Link, useNavigate, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { toast } from "react-toastify";

const DeveloperLogin = () => {
  const [username, setUsername] = useState(""); // Stores the input username
  const [password, setPassword] = useState(""); // Stores the input password
  const [errors, setErrors] = useState({});
  // const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { storeTokenInCookies, isLoggedIn, API } = useAuth(); // Custom hook from AuthContext

  const navigate = useNavigate();
  if (isLoggedIn) {
    return <Navigate to="/developer/dev/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API}/api/dev/login-developer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const res_data = await response.json();

      if (response.ok) {
        toast.success("Login Successful");
        storeTokenInCookies(res_data.token);
        navigate("/developer/dev/dashboard");
      } else {
        // setError(res_data.error || "Login failed");
        toast.error(
          res_data.extraDetails ? res_data.extraDetails : res_data.message
        );
      }
    } catch (error) {
      console.error("Error Occured In Login",error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y29kZXx8fHx8fDE3MDcyODk0NDY&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative w-full max-w-md px-6 py-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-2xl mx-4">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Developer Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white mb-1"
            >
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.username ? "border-red-500 ring-red-500" : ""
                }`}
                placeholder="Enter your username"
                aria-label="Username"
              />
              {errors.username && (
                <div className="absolute right-3 top-3 text-red-500">
                  <FaExclamationCircle />
                </div>
              )}
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.password ? "border-red-500 ring-red-500" : ""
                }`}
                placeholder="Enter your password"
                aria-label="Password"
              />

              {errors.password && (
                <div className="absolute right-10 top-3 text-red-500">
                  <FaExclamationCircle />
                </div>
              )}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <BiLoaderAlt className="animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>LOGIN</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeveloperLogin;
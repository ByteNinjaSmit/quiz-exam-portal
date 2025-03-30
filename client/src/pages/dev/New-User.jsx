import React, { useState } from "react";
import { MdPersonAdd, MdPersonOutline, MdAccountCircle, MdClass, MdApps, MdFormatListNumbered, MdLockOutline, MdVisibility, MdVisibilityOff, MdCheckCircleOutline, MdRefresh, MdDoneAll, MdErrorOutline, MdDarkMode, MdLightMode, MdHome, MdGroup } from "react-icons/md";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { IoChevronBackCircle } from "react-icons/io5";
import { useAuth } from "../../store/auth";
import axios from "axios";

const CreateUser = () => {
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    class: "",
    division: "",
    rollNo: "",
    batch:"",
    password: ""
  });
  const [showModal, setShowModal] = useState(false);  // for showing add more or exit
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.length < 3 ? "Name must be at least 3 characters" : "";
      case "username":
        return value.length < 5 ? "Username must be at least 5 characters" : "";
      case "class":
        return !value ? "Class is required" : "";
      case "division":
        return !value ? "Division is required" : "";
      case "batch":
          return !value ? "batch is required" : "";
      case "rollNo":
        return !value || isNaN(value) ? "Enter a valid Roll Number" : "";
      case "password":
        return value.length < 6 ? "Password must be at least 6 characters" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length === 0) {
      try {
        // const axios 
        const response = await axios.post(`${API}/api/dev/register-user`, {
          name: formData.name,
          username: formData.username,
          classy: formData.class,
          division: formData.division,
          rollNo: formData.rollNo,
          batch: formData.batch,
          password: formData.password
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authorizationToken,
          },
          withCredentials: true,
        })
        // Check if the response status is 200
        if (response.status === 200) {
          setShowModal(true); // Assuming setModel is the function to set the modal state
          console.log(response);
          toast.success(response.data.message, {
            icon: <MdDoneAll className="text-green-500" />,
          });
        }

      } catch (error) {
        // Handle the error response
        if (error.response) {
          toast.error(error.response.data.message || 'An error occurred');
        } else {
          toast.error('Something went wrong. Please try again later.');
        }
      } finally {
        // Any cleanup code can go here
        setIsLoading(false);
      }

    } else {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form", {
        icon: <MdErrorOutline className="text-red-500" />
      });
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      username: "",
      class: "",
      division: "",
      rollNo: "",
      batch: "",
      password: ""
    });
    setErrors({});
  };



  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "dark bg-gray-900" : "bg-[#FAFAFB]"}`}>
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <MdHome className="text-lg" />
          <span>/</span>
          <MdGroup className="text-lg" />
          <span>/</span>
          <MdPersonAdd className="text-lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <MdPersonAdd className="text-3xl text-[#F72585]" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create New User</h1>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <MdLightMode className="text-2xl" /> : <MdDarkMode className="text-2xl" />}
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-8">Fill in the required details to add a new user to the system.</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <MdPersonOutline /> Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F72585] dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter Name"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <MdAccountCircle /> Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F72585] dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter Username"
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <MdClass /> Class
              </label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F72585] dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter Class"
              />
              {errors.class && <p className="text-red-500 text-sm">{errors.class}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <MdApps /> Division
              </label>
              <input
                type="text"
                name="division"
                value={formData.division}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F72585] dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter Division"
              />
              {errors.division && <p className="text-red-500 text-sm">{errors.division}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <MdFormatListNumbered /> Roll No
              </label>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F72585] dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter Roll No"
              />
              {errors.rollNo && <p className="text-red-500 text-sm">{errors.rollNo}</p>}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <MdFormatListNumbered />Batch
              </label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F72585] dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter Batch"
              />
              {errors.batch && <p className="text-red-500 text-sm">{errors.batch}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <MdLockOutline /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F72585] dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="md:col-span-2 flex flex-col md:flex-row justify-end gap-4 md:gap-x-4 mt-6">
            <Link to={`/developer/dev/see-all-users`}>
                <button
                  type="button"
                  className="flex items-center w-full gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <IoChevronBackCircle /> Back
                </button>
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <MdRefresh /> Reset
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:from-green-500 hover:to-green-700 transition-all"
              >
                <MdCheckCircleOutline /> {isLoading ? "Loading" : "Create User"}
              </button>
            </div>
          </form>
        </motion.div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <div className="flex items-center justify-center text-green-500 mb-4">
                <MdDoneAll className="text-5xl" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                User Added Successfully!
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleReset();
                  }}
                  className="w-full py-2 bg-[#F72585] text-white rounded-lg hover:bg-opacity-90"
                >
                  Add Another User
                </button>
                <Link to={`/developer/dev/see-all-users`}>
                  <button
                    onClick={() => setShowModal(false) &&
                      setIsDarkMode(false)
                    }
                    className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Go to User Management
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUser;
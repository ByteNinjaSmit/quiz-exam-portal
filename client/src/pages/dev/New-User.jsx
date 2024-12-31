import React, { useState } from "react";
import { MdPersonAdd, MdPersonOutline, MdAccountCircle, MdClass, MdApps, MdFormatListNumbered, MdLockOutline, MdVisibility, MdVisibilityOff, MdCheckCircleOutline, MdRefresh, MdDoneAll, MdErrorOutline, MdDarkMode, MdLightMode, MdHome, MdGroup } from "react-icons/md";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    class: "",
    division: "",
    rollNo: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length === 0) {
      toast.success("User Created Successfully!", {
        icon: <MdDoneAll className="text-green-500" />
      });
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

            <div className="md:col-span-2 flex justify-end gap-4 mt-6">
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
                <MdCheckCircleOutline /> Create User
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateUser;
import { useState, useEffect } from "react";
import { MdAdminPanelSettings, MdPerson, MdEmail, MdPhone, MdLock, MdSchool, MdSupervisorAccount, MdBusinessCenter, MdSubject, MdCheckCircleOutline, MdRefresh, MdDoneAll, MdErrorOutline, MdHome, MdGroup, MdVisibility, MdVisibilityOff, MdHelpOutline, MdDarkMode, MdLightMode } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom"
import axios from "axios";
import { useAuth } from "../../store/auth";

const EditProfileFacultyAdmin = () => {
  const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    subject: ""
  });

  const [roles, setRoles] = useState({
    isTeacher: false,
    isHOD: false,
    isTNP: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleToggle = (role) => {
    setRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      subject: ""
    });
    setRoles({
      isTeacher: false,
      isHOD: false,
      isTNP: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone || !formData.username) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API}/api/dev/register-faculty`, // Endpoint URL
        {
          name: formData.fullName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          password: formData.password,
          isTnp: roles.isTNP,
          isHod: roles.isHOD,
          isTeacher: roles.isTeacher

        },
        {
          headers: {
            Authorization: authorizationToken, // Replace with the actual token
            "Content-Type": "application/json",
          },
          withCredentials: true, // Ensures cookies are sent with the request (if needed)
          credentials: "include",
        }
      );

      // Handle success response
      if (response.status === 200 || response.status === 201) {
        setShowModal(true);
      } else {
        toast.error(response.data.message); // Display error message if not 200/201
      }

    } catch (error) {
      // Handle errors
      if (error.response) {
        toast.error(error.response.data.message || "An error occurred while submitting.");
      } else if (error.request) {
        toast.error("No response received from the server.");
      } else {
        toast.error("An error occurred while setting up the request.");
      }
    } finally {
      setIsLoading(false);
    }


  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#3A0CA3] to-[#F0F1F3] p-4 md:p-8 ${darkMode ? "dark" : ""}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center text-white mb-8 space-x-2">
          <MdHome className="text-xl" />
          <span>/</span>
          <MdGroup className="text-xl" />
          <span>/</span>
          <MdAdminPanelSettings className="text-xl" />
          <span>Edit Profile</span>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        >
          {darkMode ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 animate-fade-in">
          <div className="flex items-center mb-6">
            <MdAdminPanelSettings className="text-4xl text-[#F72585] mr-4" />
            <div>
              <h1 className="text-[28px] font-semibold text-gray-800 dark:text-white">Edit Profile</h1>
              <p className="text-[16px] text-gray-600 dark:text-gray-300">Edit Profile by filling in the details below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 dark:text-gray-200">
                  <MdPerson className="mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter Full Name"
                  className="w-full p-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#F72585] transition-all dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-700 dark:text-gray-200">
                  <MdPerson className="mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter Username"
                  className="w-full p-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#F72585] transition-all dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 dark:text-gray-200">
                  <MdEmail className="mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email"
                  className="w-full p-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#F72585] transition-all dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-700 dark:text-gray-200">
                  <MdPhone className="mr-2" />
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91"
                  className="w-full p-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#F72585] transition-all dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-gray-700 dark:text-gray-200">
                <MdLock className="mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  className="w-full p-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#F72585] transition-all dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-gray-700 dark:text-gray-200">
                <MdSubject className="mr-2" />
                Subject (Optional)
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter Subject Specialization"
                className="w-full p-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#F72585] transition-all dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* <div className="space-y-4">
              <label className="block text-gray-700 dark:text-gray-200">Role Assignment</label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle("isTeacher")}
                    className={`p-3 rounded-lg flex items-center space-x-2 ${roles.isTeacher
                      ? "bg-[#F72585] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      }`}
                  >
                    <MdSchool />
                    <span>Teacher</span>
                  </button>
                  <MdHelpOutline className="text-gray-500 cursor-help" title="Assign teacher role" />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle("isHOD")}
                    className={`p-3 rounded-lg flex items-center space-x-2 ${roles.isHOD
                      ? "bg-[#F72585] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      }`}
                  >
                    <MdSupervisorAccount />
                    <span>HOD</span>
                  </button>
                  <MdHelpOutline className="text-gray-500 cursor-help" title="Assign HOD role" />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle("isTNP")}
                    className={`p-3 rounded-lg flex items-center space-x-2 ${roles.isTNP
                      ? "bg-[#F72585] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      }`}
                  >
                    <MdBusinessCenter />
                    <span>TNP</span>
                  </button>
                  <MdHelpOutline className="text-gray-500 cursor-help" title="Assign TNP role" />
                </div>
              </div>
            </div> */}

            <div className="flex flex-wrap gap-4 pt-6">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:scale-105 transition-transform"
                // disabled={isLoading}
                disabled={true}
              >
                <MdCheckCircleOutline />
                <span>Save Changes</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <MdRefresh />
                <span>Reset Form</span>
              </button>
              <Link to={`/admin/dashboard`}>
                <button
                  className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={()=> setDarkMode(false)}
                >
                  Go to Faculty List
                </button>
              </Link>
            </div>
          </form>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <div className="flex items-center justify-center text-green-500 mb-4">
                <MdDoneAll className="text-5xl" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                Faculty/Admin Added Successfully!
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-full py-2 bg-[#F72585] text-white rounded-lg hover:bg-opacity-90"
                >
                  Add Another Faculty/Admin
                </button>
                <Link to={`/admin/dashboard`}>
                  <button
                    onClick={() => setShowModal(false) &&
                      setDarkMode(false)
                    }
                    className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Go to Faculty List
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default EditProfileFacultyAdmin;
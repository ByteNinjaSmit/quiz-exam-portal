import React, { useState, useEffect } from "react";
import { MdEngineering, MdAdminPanelSettings, MdFeedback, MdDashboard, MdSort,MdLogout , MdMonitor } from "react-icons/md";
import { FaUserCircle, FaCommentDots, FaToolbox, FaServer } from "react-icons/fa";
import { BiHistory, BiCodeBlock } from "react-icons/bi";
import { FiBarChart, FiFilter } from "react-icons/fi";
import { AiOutlinePieChart } from "react-icons/ai";
import { HiOutlineMenu } from "react-icons/hi";
import { RiDashboardFill } from "react-icons/ri";
import { useAuth } from "../../store/auth";
import { Link, useNavigate, useLocation,Navigate, NavLink } from "react-router-dom";

const DeveloperDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, API,LogoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
    // For Deve
    // { title: "Dashboard", icon: <RiDashboardFill /> },
  const stats = [

    { title: "Total Users", count: 1234, icon: <FaUserCircle />, color: "bg-blue-500" },
    { title: "Active Admins", count: 45, icon: <MdAdminPanelSettings />, color: "bg-purple-500" },
    { title: "Pending Complaints", count: 23, icon: <FaCommentDots />, color: "bg-red-500" },
    { title: "System Health", count: "98%", icon: <MdMonitor />, color: "bg-green-500" }
  ];

  const activityLogs = [
    { id: 1, action: "API Update", user: "John Dev", timestamp: "2 mins ago" },
    { id: 2, action: "System Maintenance", user: "Alice Dev", timestamp: "1 hour ago" },
    { id: 3, action: "Security Patch", user: "Bob Dev", timestamp: "3 hours ago" }
  ];

  const complaints = [
    { id: 1, issue: "API Performance", status: "Pending", priority: "High" },
    { id: 2, issue: "Database Connection", status: "Resolved", priority: "Critical" },
    { id: 3, issue: "UI Bug", status: "In Progress", priority: "Medium" }
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-20"} transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          <h2 className={`${!isSidebarOpen && "hidden"} font-bold text-xl`}>DevPanel</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <HiOutlineMenu size={24} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          <button
            className={`w-full flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors group ${
              location.pathname === "/developer/dev/dashboard" ? "font-bold bg-purple-900" : ""
            }`}
            onClick={() => navigate("/developer/dev/dashboard")}
          >
            <MdEngineering size={24} />
            <span className={`${!isSidebarOpen && "hidden"}  ml-3`}>Developers</span>
          </button>

          <button
            className="w-full flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors"
            onClick={()=> navigate("/developer/dev/see-all-users") }
          >
            <FaUserCircle size={24} />
            <span className={`${!isSidebarOpen && "hidden"} ml-3`}>Users</span>
          </button>

          <button
            className="w-full flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors"
            onClick={()=> navigate("/developer/dev/see-all-admins") }
          >
            <MdAdminPanelSettings size={24} />
            <span className={`${!isSidebarOpen && "hidden"} ml-3`}>Admins</span>
          </button>

          <button
            className="w-full flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors"
            onClick={() => setActiveSection("complaints")}
          >
            <MdFeedback size={24} />
            <span className={`${!isSidebarOpen && "hidden"} ml-3`}>Complaints</span>
          </button>

          <div className="pt-4 border-t border-gray-700">
            <button
              className="w-full flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors"
              onClick={() => setActiveSection("tools")}
            >
              <FaToolbox size={24} />
              <span className={`${!isSidebarOpen && "hidden"} ml-3`}>Dev Tools</span>
            </button>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <button
              className="w-full flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors"
              onClick={() => LogoutUser()}
            >
              <MdLogout  size={24} className="rotate-180" />
              <span className={`${!isSidebarOpen && "hidden"} ml-3`}>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-gray-800 p-6">
          <div className="flex items-center">
            <MdDashboard size={32} className="text-purple-500" />
            <h1 className="ml-3 text-2xl font-bold">Developer Dashboard</h1>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.count}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>{stat.icon}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Logs */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <BiHistory className="mr-2" /> Activity Logs
                </h2>
              </div>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-gray-400">{log.user}</p>
                    </div>
                    <span className="text-sm text-gray-400">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaints Overview */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <FaCommentDots className="mr-2" /> Complaints Overview
                </h2>
                <div className="flex space-x-2">
                  <button
                    className="p-2 hover:bg-gray-700 rounded-lg"
                    aria-label="Sort"
                  >
                    <MdSort />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-700 rounded-lg"
                    aria-label="Filter"
                  >
                    <FiFilter />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{complaint.issue}</p>
                      <p className="text-sm text-gray-400">{complaint.priority} Priority</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${complaint.status === "Resolved" ? "bg-green-500" : "bg-yellow-500"}`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Monitoring */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <FaServer className="mr-2" /> System Monitoring
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">API Requests</h3>
                  <FiBarChart className="text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-2">2.4k/min</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Server Load</h3>
                  <AiOutlinePieChart className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold mt-2">67%</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Error Rate</h3>
                  <BiCodeBlock className="text-red-500" />
                </div>
                <p className="text-2xl font-bold mt-2">0.12%</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
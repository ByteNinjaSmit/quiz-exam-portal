import React, { useState, useEffect } from "react";
import { MdEngineering, MdAdminPanelSettings, MdFeedback, MdDashboard, MdSort,MdLogout , MdMonitor,MdManageHistory  } from "react-icons/md";
import { FaUserCircle, FaCommentDots, FaToolbox, FaServer } from "react-icons/fa";
import { BiHistory, BiCodeBlock } from "react-icons/bi";
import { FiBarChart, FiFilter } from "react-icons/fi";
import { AiOutlinePieChart } from "react-icons/ai";
import { HiOutlineMenu } from "react-icons/hi";
import { RiDashboardFill } from "react-icons/ri";
import { useAuth } from "../../store/auth";
import { Link, useNavigate, useLocation,Navigate, NavLink } from "react-router-dom";
import io from 'socket.io-client';

const DeveloperDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, API, LogoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Real-time dashboard state
  const [stats, setStats] = useState([
    { title: "Total Users", count: 0, icon: <FaUserCircle />, color: "bg-blue-500" },
    { title: "Active Admins", count: 0, icon: <MdAdminPanelSettings />, color: "bg-purple-500" },
    { title: "Pending Complaints", count: 0, icon: <FaCommentDots />, color: "bg-red-500" },
    { title: "System Health", count: "-", icon: <MdMonitor />, color: "bg-green-500" }
  ]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [systemMonitoring, setSystemMonitoring] = useState({ apiRequests: "-", serverLoad: "-", errorRate: "-" });
  const [userGrowth, setUserGrowth] = useState({ newUsers24h: 0, newUsers7d: 0, newAdmins24h: 0, newAdmins7d: 0 });
  const [recentLogins, setRecentLogins] = useState([]);
  const [topApiEndpoints, setTopApiEndpoints] = useState([]);
  const [uptime, setUptime] = useState('');
  const [diskUsage, setDiskUsage] = useState({ total: 0, free: 0 });
  const [securityEvents, setSecurityEvents] = useState([]);
  const socketRef = React.useRef();

  // Map icons to stats by index
  const statIcons = [<FaUserCircle />, <MdAdminPanelSettings />, <FaCommentDots />, <MdMonitor />];

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });
    }
    const socket = socketRef.current;
    socket.on('dev-dashboard-data', (data) => {
      const statsWithIcons = data.stats.map((stat, idx) => ({ ...stat, icon: statIcons[idx] }));
      setStats(statsWithIcons);
      setActivityLogs(data.activityLogs || []);
      setComplaints(data.complaints || []);
      setSystemMonitoring(data.systemMonitoring || { apiRequests: "-", serverLoad: "-", errorRate: "-" });
      setUserGrowth(data.userGrowth || { newUsers24h: 0, newUsers7d: 0, newAdmins24h: 0, newAdmins7d: 0 });
      setRecentLogins(data.recentLogins || []);
      setTopApiEndpoints(data.topApiEndpoints || []);
      setUptime(data.uptime || '');
      setDiskUsage(data.diskUsage || { total: 0, free: 0 });
      setSecurityEvents(data.securityEvents || []);
    });
    return () => {
      if (socket) {
        socket.off('dev-dashboard-data');
      }
    };
  }, [API]);

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
          <button
            className="w-full flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors"
            onClick={()=> navigate("/developer/dev/logs") }
          >
            <MdManageHistory  size={24} />
            <span className={`${!isSidebarOpen && "hidden"} ml-3`}>Logs</span>
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

            {/* Recent API Errors */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <BiCodeBlock className="mr-2" /> Recent API Errors
                </h2>
              </div>
              <div className="space-y-4">
                {(activityLogs.filter(log => log.action && log.action.toLowerCase().includes('error')).length > 0) ? (
                  activityLogs.filter(log => log.action && log.action.toLowerCase().includes('error')).slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-red-400">{log.action}</p>
                        <p className="text-sm text-gray-400">{log.user}</p>
                      </div>
                      <span className="text-sm text-gray-400">{log.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No recent API errors found.</div>
                )}
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
                <p className="text-2xl font-bold mt-2">{systemMonitoring.apiRequests}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Server Load</h3>
                  <AiOutlinePieChart className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold mt-2">{systemMonitoring.serverLoad}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Error Rate</h3>
                  <BiCodeBlock className="text-red-500" />
                </div>
                <p className="text-2xl font-bold mt-2">{systemMonitoring.errorRate}</p>
              </div>
            </div>
          </div>

          {/* User/Admin Growth */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
              <p className="text-gray-400">New Users (24h)</p>
              <p className="text-2xl font-bold mt-1 text-blue-400">{userGrowth.newUsers24h}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
              <p className="text-gray-400">New Users (7d)</p>
              <p className="text-2xl font-bold mt-1 text-blue-400">{userGrowth.newUsers7d}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
              <p className="text-gray-400">New Admins (24h)</p>
              <p className="text-2xl font-bold mt-1 text-purple-400">{userGrowth.newAdmins24h}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
              <p className="text-gray-400">New Admins (7d)</p>
              <p className="text-2xl font-bold mt-1 text-purple-400">{userGrowth.newAdmins7d}</p>
            </div>
          </div>

          {/* Top API Endpoints & Uptime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center"><FiBarChart className="mr-2" /> Top API Endpoints</h2>
              <ul className="space-y-2">
                {topApiEndpoints.map((ep, idx) => (
                  <li key={idx} className="flex justify-between text-gray-300">
                    <span className="font-mono">{ep.endpoint}</span>
                    <span className="font-bold text-green-400">{ep.count}</span>
                  </li>
                ))}
                {topApiEndpoints.length === 0 && <li className="text-gray-500">No data</li>}
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between">
              <h2 className="text-xl font-bold mb-4 flex items-center"><MdMonitor className="mr-2" /> Uptime & Disk Usage</h2>
              <div className="mb-2"><span className="text-gray-400">Uptime:</span> <span className="font-bold text-green-400">{uptime}</span></div>
              <div><span className="text-gray-400">Disk Free:</span> <span className="font-bold text-blue-400">{(diskUsage.free / (1024 ** 3)).toFixed(2)} GB</span></div>
              <div><span className="text-gray-400">Disk Total:</span> <span className="font-bold text-blue-400">{(diskUsage.total / (1024 ** 3)).toFixed(2)} GB</span></div>
            </div>
          </div>

          {/* Recent Logins & Security Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center"><FaUserCircle className="mr-2" /> Recent Logins</h2>
              <ul className="space-y-2">
                {recentLogins.map((login) => (
                  <li key={login.id} className="text-gray-300 font-mono">{login.detail}</li>
                ))}
                {recentLogins.length === 0 && <li className="text-gray-500">No data</li>}
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center"><MdAdminPanelSettings className="mr-2" /> Security Events</h2>
              <ul className="space-y-2">
                {securityEvents.map((ev, idx) => (
                  <li key={idx} className="flex flex-col text-red-400 font-mono">
                    <span>Endpoint: {ev.endpoint}</span>
                    <span>IP: {ev.ip}</span>
                    <span>Time: {ev.time}</span>
                    <span>Status: {ev.status}</span>
                  </li>
                ))}
                {securityEvents.length === 0 && <li className="text-gray-500">No data</li>}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
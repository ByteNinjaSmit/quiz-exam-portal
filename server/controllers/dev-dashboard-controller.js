const User = require("../database/models/user-model");
const Faculty = require("../database/models/faculty-model");
const Cheat = require("../database/models/cheat-model");
const CodeCheat = require("../database/models/code-cheat-model");
const fs = require("fs");
const path = require("path");
const logFilePath = path.join(__dirname, "../logs/app.log");
const os = require('os');
const { promisify } = require('util');
const stat = promisify(fs.stat);

// Simulate system monitoring stats (replace with real logic if available)
async function getSystemStats() {
  // API Requests per second
  const apiRequests = global.apiRequestsPerSecond || 0;
  const errorRate = global.apiErrorsPerSecond || 0;

  // Server Load (1 min average)
  const loadAvg = os.loadavg()[0]; // 1-minute load average
  const cpuCount = os.cpus().length;
  const serverLoadPercent = ((loadAvg / cpuCount) * 100).toFixed(1);

  // Memory Usage
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMemPercent = (((totalMem - freeMem) / totalMem) * 100).toFixed(1);

  // System Health (simple logic: healthy if load < 80% and usedMem < 80% and errorRate < 5)
  let health = "100%";
  if (serverLoadPercent > 80 || usedMemPercent > 80 || errorRate > 5) {
    health = "Warning";
  }

  return {
    apiRequests: `${apiRequests}/sec`,
    serverLoad: `${serverLoadPercent}%`,
    errorRate: `${errorRate}/sec`,
    systemHealth: health
  };
}

async function getUserGrowth() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newUsers24h = await User.countDocuments({ createdAt: { $gte: dayAgo } });
  const newUsers7d = await User.countDocuments({ createdAt: { $gte: weekAgo } });
  const newAdmins24h = await Faculty.countDocuments({ createdAt: { $gte: dayAgo } });
  const newAdmins7d = await Faculty.countDocuments({ createdAt: { $gte: weekAgo } });
  return { newUsers24h, newUsers7d, newAdmins24h, newAdmins7d };
}

async function getRecentLogins() {
  // Parse last 10 successful logins from logs
  let logins = [];
  try {
    const data = fs.readFileSync(logFilePath, "utf-8");
    const lines = data.split("\n").filter(line => line.includes('Login Successful'));
    logins = lines.slice(-10).reverse().map((line, idx) => ({ id: idx + 1, detail: line }));
  } catch (e) {}
  return logins;
}

function getTopApiEndpoints() {
  const hits = global.apiEndpointHits || {};
  const sorted = Object.entries(hits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([endpoint, count]) => ({ endpoint, count }));
  return sorted;
}

function getUptime() {
  const seconds = Math.floor(process.uptime());
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

async function getDiskUsage() {
  // Only works on Unix-like systems for root dir
  try {
    const { size } = await stat('/');
    const total = os.totalmem();
    const free = os.freemem();
    return { total, free };
  } catch {
    return { total: 0, free: 0 };
  }
}

function getSecurityEvents() {
  return (global.failedLogins || []).slice(0, 10);
}

async function getDashboardData() {
  // Total Users
  const totalUsers = await User.countDocuments();
  // Active Admins (all faculties)
  const activeAdmins = await Faculty.countDocuments();
  // Pending Complaints (Cheat and CodeCheat with isCheat or isWarning true and not resolved)
  const pendingComplaints = await Cheat.countDocuments({ $or: [{ isCheat: true }, { isWarning: true }] });
  const pendingCodeComplaints = await CodeCheat.countDocuments({ $or: [{ isCheat: true }, { isWarning: true }] });
  // Complaints list (latest 5)
  const complaints = await Cheat.find({ $or: [{ isCheat: true }, { isWarning: true }] })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  // Activity logs (last 5 lines)
  let activityLogs = [];
  try {
    const data = fs.readFileSync(logFilePath, "utf-8");
    const lines = data.split("\n").filter(line => line.trim() !== "");
    activityLogs = lines.slice(-5).reverse().map((line, idx) => ({ id: idx + 1, action: line, user: "-", timestamp: "" }));
  } catch (e) {
    activityLogs = [];
  }
  // System stats
  const systemStats = await getSystemStats();
  const userGrowth = await getUserGrowth();
  const recentLogins = await getRecentLogins();
  const topApiEndpoints = getTopApiEndpoints();
  const uptime = getUptime();
  const diskUsage = await getDiskUsage();
  const securityEvents = getSecurityEvents();

  return {
    stats: [
      { title: "Total Users", count: totalUsers, color: "bg-blue-500" },
      { title: "Active Admins", count: activeAdmins, color: "bg-purple-500" },
      { title: "Pending Complaints", count: pendingComplaints + pendingCodeComplaints, color: "bg-red-500" },
      { title: "System Health", count: systemStats.systemHealth, color: "bg-green-500" }
    ],
    activityLogs,
    complaints: complaints.map(c => ({ id: c._id, issue: c.reason || "Unknown", status: c.isCheat ? "Pending" : "Warning", priority: "High" })),
    systemMonitoring: {
      apiRequests: systemStats.apiRequests,
      serverLoad: systemStats.serverLoad,
      errorRate: systemStats.errorRate
    },
    userGrowth,
    recentLogins,
    topApiEndpoints,
    uptime,
    diskUsage,
    securityEvents,
    // jobQueueStatus: {}, // Placeholder for Bull/queue stats
  };
}

const devDashboardController = (io) => {
  io.on("connection", (socket) => {
    console.log("Dev Dashboard client connected");
    let intervalId;
    const sendDashboardData = async () => {
      const data = await getDashboardData();
      socket.emit("dev-dashboard-data", data);
    };
    sendDashboardData();
    intervalId = setInterval(sendDashboardData, 2000);
    socket.on("disconnect", () => {
      clearInterval(intervalId);
      console.log("Dev Dashboard client disconnected");
    });
  });
};

module.exports = devDashboardController; 
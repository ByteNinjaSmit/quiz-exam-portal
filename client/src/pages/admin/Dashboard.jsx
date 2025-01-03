import React, { useState,useEffect} from "react";
import { FaUsers, FaClipboardList, FaCheckCircle, FaClock } from "react-icons/fa";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
} from "chart.js";
import AdminSidebar from "../../components/sidebar";
import axios from "axios";
import { useAuth } from "../../store/auth";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3

    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(()=>{
        const getUserCount = async()=>{
            try {
                const response  = await axios.get(`${API}/api/faculty/get-users-count`,{
                    headers: {
                        Authorization:authorizationToken,
                    },
                    withCredentials:true,
                })
                if(response.status===200){
                    setTotalUsers(response.data.data)
                    // console.log(response.data.data);
                    
                }
            } catch (error) {
                console.log(error);
            }
        }
        getUserCount();
    },[API])

    const metrics = {
        totalStudents: 1250,
        activeExams: 45,
        completedExams: 128,
        pendingResults: 32
    };

    const lineChartData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
            {
                label: "User Growth",
                data: [65, 75, 85, 95],
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }
        ]
    };
    const pieChartData = {
        labels: ["Pass", "Fail"],
        datasets: [
            {
                data: [75, 25],
                backgroundColor: ["rgb(75, 192, 192)", "rgb(255, 99, 132)"]
            }
        ]
    };
    const [recentActivities] = useState([
        { type: "signup", user: "John Doe", timestamp: "2 mins ago" },
        { type: "exam", exam: "Mathematics 101", timestamp: "5 mins ago" },
        { type: "result", exam: "Physics Final", timestamp: "10 mins ago" },
        { type: "signup", user: "Jane Smith", timestamp: "15 mins ago" }
    ]);
    const barChartData = {
        labels: ["Math", "Physics", "Chemistry", "Biology"],
        datasets: [
            {
                label: "Average Scores",
                data: [85, 78, 82, 88],
                backgroundColor: "rgba(75, 192, 192, 0.6)"
            }
        ]
    };
    const [leaderboard] = useState([
        { rank: 1, name: "Alice Cooper", score: 98 },
        { rank: 2, name: "Bob Wilson", score: 95 },
        { rank: 3, name: "Charlie Brown", score: 92 }
    ]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
                    <button className="text-gray-500 lg:hidden" onClick={toggleSidebar}>
                        <svg className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </header>

                <div className="flex-1 p-4">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Cards for Metrics */}
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                                <FaUsers className="text-3xl text-blue-500" />
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                                    <p className="text-sm text-gray-600">Total Students</p>
                                </div>
                            </div>
                        </div>
                        {/* Additional Metric Cards */}
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                                <FaClipboardList className="text-3xl text-green-500" />
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-800">{metrics.activeExams}</p>
                                    <p className="text-sm text-gray-600">Active Exams</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                            <div className="flex justify-between items-center">
                                <FaCheckCircle className="text-3xl text-purple-500" />
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-800">{metrics.completedExams}</p>
                                    <p className="text-sm text-gray-600">Completed Exams</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                            <div className="flex justify-between items-center">
                                <FaClock className="text-3xl text-yellow-500" />
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-800">{metrics.pendingResults}</p>
                                    <p className="text-sm text-gray-600">Pending Results</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                            <Line data={lineChartData} />
                        </div>
                        {/* Additional Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Pass/Fail Rate</h2>
                            <Pie data={pieChartData} />
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Average Scores by Subject</h2>
                            <Bar data={barChartData} />
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 border-b">
                                        {activity.type === "signup" && <FaUsers className="text-blue-500" />}
                                        {activity.type === "exam" && <FaClipboardList className="text-green-500" />}
                                        {activity.type === "result" && <FaCheckCircle className="text-purple-500" />}
                                        <div>
                                            <p className="text-sm text-gray-800">
                                                {activity.user || activity.exam}
                                            </p>
                                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                    {/* Leaderboard */}
                    <div className="bg-white p-6 rounded-lg shadow-md gap-8 mt-8 mb-8">
                        <h2 className="text-xl font-bold mb-4">Top Performers</h2>
                        <div className="space-y-4">
                            {leaderboard.map((student) => (
                                <div key={student.rank} className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">{student.rank}. {student.name}</span>
                                    <span className="font-bold text-gray-800">{student.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

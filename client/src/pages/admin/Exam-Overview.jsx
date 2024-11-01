import React, { useState } from "react";
import { FiPlus, FiSearch, FiCalendar, FiEdit2, FiTrash2, FiEye, FiBell } from "react-icons/fi";
import AdminSidebar from "../../components/sidebar";

const ExamDashboard = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [department, setDepartment] = useState("");
    const [status, setStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const dummyExams = [
        {
            id: 1,
            name: "Final Computer Networks Exam",
            department: "Computer Engineering",
            date: "2024-02-15T10:00:00",
            status: "Scheduled",
        },
        {
            id: 2,
            name: "Thermodynamics Mid-Term",
            department: "Mechanical Engineering",
            date: "2024-02-10T14:30:00",
            status: "Completed",
        },
        {
            id: 3,
            name: "Database Systems Quiz",
            department: "Computer Engineering",
            date: "2024-02-18T09:00:00",
            status: "Ongoing",
        },
    ];

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this exam?")) {
            console.log("Deleting exam:", id);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Scheduled":
                return "bg-blue-100 text-blue-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            case "Ongoing":
                return "bg-gray-400 text-gray-900";
            case "Archived":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Admin Sidebar */}
            <AdminSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b">
                    <button className="text-gray-500 lg:hidden" onClick={toggleSidebar}>
                        <svg className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                </header>
                <div className="flex justify-between items-center mb-1 p-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Exam Management</h1>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md">
                        <FiPlus className="mr-2" />
                        Add New Exam
                    </button>
                </div>

                {/* Search and Filters Section */}
                <div className="space-y-4 mb-2 p-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search exams by name or code..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <FiCalendar className="text-gray-400" />
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <FiCalendar className="text-gray-400" />
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            <option value="computer">Computer Engineering</option>
                            <option value="mechanical">Mechanical Engineering</option>
                        </select>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Exams List Section */}
                <div className="rounded-lg shadow-md overflow-hidden ">
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full">
                            <thead className="bg-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {dummyExams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-500">{exam.department}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <FiCalendar className="mr-2" />
                                                {new Date(exam.date).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex space-x-3">
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <FiEdit2 />
                                                </button>
                                                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(exam.id)}>
                                                    <FiTrash2 />
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-800">
                                                    <FiEye />
                                                </button>
                                                <button className="text-yellow-600 hover:text-yellow-800">
                                                    <FiBell />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center p-4">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">Page {currentPage}</span>
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamDashboard;

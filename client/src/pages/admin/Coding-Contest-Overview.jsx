import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiCalendar, FiEdit2, FiTrash2, FiEye, FiBell } from "react-icons/fi";
import AdminSidebar from "../../components/sidebar";
import { useAuth } from "../../store/auth";
import { Link } from "react-router-dom";

import axios from 'axios';
import { toast } from "react-toastify";

const CodeContestDashboard = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [difficulty, setDifficulty] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    // Getting All Exams 

    const fetchProblems = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API}/api/problem/get-all-contest`, {
                headers: {
                    Authorization: authorizationToken,
                },
                withCredentials: true,
            });
            if (response.status !== 200) {
                toast.error(`Error Fetching Exams: ${response.status}`);
            }
            const data = response.data;
            console.log(data.contest);

            setProblems(data.contest);
        } catch (error) {
            console.error(error);
            toast.error(error.messsage);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchProblems();
    }, [API])



    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this Codeing Problem?")) {
            try {
                // Send DELETE request to the backend
                const response = await axios.delete(`${API}/api/problem/delete-coding-contest/${id}`, {
                    headers: {
                        Authorization: authorizationToken, // Replace with the actual token
                        "Content-Type": "application/json",
                    },
                    withCredentials: true, // Ensures cookies are sent with the request (if needed)
                    credentials: "include",
                });

                // Handle the response
                if (response.status === 200) {
                    toast.success(response.data.message);
                    fetchProblems();
                    // Optionally, you can refresh the exam list or remove the deleted exam from the UI
                }
            } catch (error) {
                // Handle different error statuses
                if (error.response) {
                    // Check if the error is a 400 Bad Request
                    if (error.response.status === 400) {
                        toast.error(error.response.data.message || "problem ID is required or invalid.");
                    } else if (error.response.status === 404) {
                        toast.error(error.response.data.message || "problem not found.");
                    } else {
                        toast.error(error.response.data.message || "An error occurred while deleting the problem.");
                    }
                } else {
                    toast.error("Network error, please try again later.");
                }
            }
        }
    };


    const getStatusColor = (status) => {
        switch (status) {
            case "Easy":
                return "bg-green-100 text-green-800";
            case "Medium":
                return "bg-blue-100 text-blue-800";
            case "Hard":
                return "bg-red-400 text-red-900";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };



    const itemsPerPage = 10;
    // Applying filters
    const filteredData = problems?.filter(
        (item) =>
            (difficulty === "All" || item?.difficulty?.toLowerCase() === difficulty.toLowerCase()) &&
            (item?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );


    const paginatedData = filteredData?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Coding Contest Management</h1>
                    <Link to={`/admin/create-contest`}>
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md">
                            <FiPlus className="mr-2" />
                            Create New Contest
                        </button>
                    </Link>
                </div>

                {/* Search and Filters Section */}
                <div className="space-y-4 mb-2 p-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Problem by name or Title..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="All">All Difficulty</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                {/* Exams List Section */}
                <div className="rounded-lg shadow-md overflow-hidden ">
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full">
                            <thead className="bg-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedData && paginatedData.length > 0 ? (
                                    paginatedData.map((problem, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-gray-900">{problem?.name}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(problem.difficulty)}`}>
                                                    {problem?.difficulty}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-500">{problem?.category}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex space-x-3 items-center">
                                                    <Link to={`/admin/view-result/contest/${problem._id}`}>
                                                        <button className="text-red-600 hover:text-red-800">
                                                            <FiEye />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex space-x-3 items-center">
                                                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(problem?._id)}>
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center p-4">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">Page {currentPage} / {totalPages}</span>
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodeContestDashboard;

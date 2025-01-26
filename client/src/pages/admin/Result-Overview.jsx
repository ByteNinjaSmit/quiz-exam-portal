import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiCalendar, FiEdit2, FiTrash2, FiEye, FiBell } from "react-icons/fi";
import { FaFileDownload } from "react-icons/fa";
import AdminSidebar from "../../components/sidebar";
import { useAuth } from "../../store/auth";
import { Link } from "react-router-dom";
import axios from 'axios';
import { toast } from "react-toastify";

const ResultOverview = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [department, setDepartment] = useState("All");
    const [status, setStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    // Getting All Exams 

    const fetchExams = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API}/api/faculty/get-results`, {
                headers: {
                    Authorization: authorizationToken,
                },
                withCredentials: true,
            });
            if (response.status !== 200) {
                toast.error(`Error Fetching Exams: ${response.status}`);
            }
            const data = response.data;
            // console.log(data.data);

            setExams(data.data);
        } catch (error) {
            console.error(error);
            toast.error(error.messsage);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchExams();
    }, [API])




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


    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this exam?")) {
            try {
                // Send DELETE request to the backend
                const response = await axios.delete(`${API}/api/exam/delete/exam/${id}`, {
                    headers: {
                        Authorization: authorizationToken, // Replace with the actual token
                        "Content-Type": "application/json",
                    },
                    withCredentials: true, // Ensures cookies are sent with the request (if needed)
                    credentials: "include",
                });

                // Handle the response
                if (response.status === 200) {
                    toast.success("Exam deleted successfully");
                    fetchExams();
                    // Optionally, you can refresh the exam list or remove the deleted exam from the UI
                }
            } catch (error) {
                // Handle different error statuses
                if (error.response) {
                    // Check if the error is a 400 Bad Request
                    if (error.response.status === 400) {
                        toast.error(error.response.data.message || "Exam ID is required or invalid.");
                    } else if (error.response.status === 404) {
                        toast.error(error.response.data.message || "Exam not found.");
                    } else {
                        toast.error(error.response.data.message || "An error occurred while deleting the exam.");
                    }
                } else {
                    toast.error("Network error, please try again later.");
                }
            }
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

    // Function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Function to format the time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString('en-US', options);
    };

    // To Define Status base on time
    const getExamStatus = (startTime, endTime) => {
        const now = new Date();

        if (now < new Date(startTime)) {
            return 'Scheduled'; // Exam is scheduled for the future
        } else if (now >= new Date(startTime) && now <= new Date(endTime)) {
            return 'Ongoing'; // Exam is currently ongoing
        } else {
            return 'Completed'; // Exam has already ended
        }
    };

    // sort data
    //   const sortedData = React.useMemo(() => {
    //     if (!sortConfig.key) return data;

    //     return [...data].sort((a, b) => {
    //       if (a[sortConfig.key] < b[sortConfig.key]) {
    //         return sortConfig.direction === "ascending" ? -1 : 1;
    //       }
    //       if (a[sortConfig.key] > b[sortConfig.key]) {
    //         return sortConfig.direction === "ascending" ? 1 : -1;
    //       }
    //       return 0;
    //     });
    //   }, [data, sortConfig]);

    // Pagignation Logic

    const itemsPerPage = 10;
    // Applying filters
    const filteredData = exams?.filter(
        (item) =>
            (status === "All" || getExamStatus(item?.questionPaper.startTime, item?.questionPaper.endTime).toLowerCase() === status.toLowerCase()) &&
            (department === "All" || item?.questionPaper.classyear?.toLowerCase() === department.toLowerCase()) &&
            (item.questionPaper.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );


    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const downloadResult = async (e, paperKey,title) => {
        e.preventDefault();
        try {
            // Make a GET request to fetch the CSV data
            const response = await axios.get(`${API}/api/faculty/export-result/${paperKey}`, {
                headers: {
                    Authorization: authorizationToken, // Replace with the actual token
                    "Content-Type": "application/json",
                },
                responseType: "blob", // Important to specify blob for downloading files
                withCredentials: true,
            });
    
            // Create a blob URL for the downloaded data
            const blob = new Blob([response.data], { type: "text/csv" });
            const downloadUrl = window.URL.createObjectURL(blob);
    
            // Create a temporary anchor element to trigger the download
            const link = document.createElement("a");
            link.href = downloadUrl;
    
            // Set a default filename for the downloaded file
            link.download = `${title}_results.csv`;
    
            // Append the link to the document, trigger click, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading the file:", error);
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
                <div className="flex justify-start items-center mb-1 p-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Results & Analytics</h1>
                </div>

                {/* Search and Filters Section */}
                <div className="space-y-4 mb-2 p-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search exams by name or code..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            <option value="All">All Classes</option>
                            <option value="FY">FY</option>
                            <option value="SY">SY</option>
                            <option value="TY">TY</option>
                            <option value="B.Tech">B.Tech</option>
                        </select>
                        {/* <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                        </select> */}
                    </div>
                </div>

                {/* Exams List Section */}
                <div className="rounded-lg shadow-md overflow-hidden ">
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Exam Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Class</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Date</th>
                                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publish</th> */}
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Attend</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedData.map((exam, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{exam?.questionPaper?.title}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-500">{exam?.questionPaper?.classyear}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <FiCalendar className="mr-2" />
                                                {exam?.questionPaper?.startTime && formatDate(exam?.questionPaper?.startTime)} at {exam?.questionPaper.startTime && formatTime(exam?.questionPaper?.startTime)} to {exam?.questionPaper?.endTime && formatTime(exam?.questionPaper?.endTime)}
                                            </div>
                                        </td>
                                        {/* <td className="px-4 py-4">
                                            <div
                                                className={`px-2 py-1 text-xs font-semibold rounded-full text-center items-center ${exam?.isPublished
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {exam?.isPublished ? "Published" : "Draft"}
                                            </div>
                                        </td> */}

                                        <td className="px-4 py-4">
                                            <div className={`text-sm font-medium text-gray-900 items-center`}>
                                                {exam.numberOfUniqueUsers}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex space-x-3 items-center">
                                                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(exam?._id)}>
                                                    <FiTrash2 />
                                                </button>
                                                <Link to={`/admin/view-result/question_paper/${exam.paperKey}/${exam.questionPaper.title}`}>
                                                    <button className="text-gray-600 hover:text-gray-800">
                                                        <FiEye />
                                                    </button>
                                                </Link>
                                                <button className="text-black hover:text-red-800"
                                                onClick={(e)=>{downloadResult(e,exam.paperKey,exam.questionPaper.title)}}
                                                >
                                                    <FaFileDownload  />
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

export default ResultOverview;

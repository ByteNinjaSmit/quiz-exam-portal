import React, { useEffect, useState } from "react";
import {
    MdAccessTime,
    MdCalendarToday,
    MdCheckCircle,
    MdTimer,
    MdPerson,
    MdSchool,
    MdGroup,
    MdStar,
    MdAssignment,
    MdInfo,
    MdDownload,
    MdNavigateNext,
    MdNavigateBefore,
    MdArrowUpward,
    MdArrowDownward,
    MdBarChart,
    MdSearch,
    MdFilterList,
    MdExpandMore,
    MdExpandLess,
    MdVisibility,
    MdEdit,
    MdClose,
    MdSettings,
    MdCode,
} from "react-icons/md";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../store/auth";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ContestResult = () => {
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
    const params = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const [resultData, setResultData] = useState({});
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [currentCode, setCurrentCode] = useState(null);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    // for output
    const [currentOutput, setCurrentOutput] = useState(null);
    const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${API}/api/problem/get-contest-result/${params.id}`,
                    {
                        headers: {
                            Authorization: authorizationToken,
                        },
                        withCredentials: true,
                    }
                );
                // console.log(response);
                if (response.status === 200) {
                    const data = response.data.results;
                    // console.log(data);
                    setResultData(data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [API]);

    // Function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: "numeric", month: "long", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
    };

    // Function to format the time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const options = { hour: "2-digit", minute: "2-digit", hour12: true };
        return date.toLocaleTimeString("en-US", options);
    };

    const filteredData = resultData?.users?.filter(user => {
        const matchesSearch = user?.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.userDetails?.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = selectedClass === "" || user?.userDetails?.classy === selectedClass;
        const matchesDivision = selectedDivision === "" || user?.userDetails?.division === selectedDivision;
        return matchesSearch && matchesClass && matchesDivision;
    });

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredData?.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredData?.length / entriesPerPage);

    const uniqueClasses = [...new Set(resultData?.users?.map(user => user?.userDetails.classy))];
    const uniqueDivisions = [...new Set(resultData.users?.map(user => user?.userDetails.division))];
    // console.log("classes", uniqueClasses);
    // console.log("uniqueDivisions", uniqueDivisions);
    // console.log(currentEntries);
    const handleOpenCodeModal = (code) => {
        setCurrentCode(code);
        setIsCodeModalOpen(true);
    };

    const handleCloseCodeModal = () => {
        setIsCodeModalOpen(false);
        setCurrentCode("");
    };

    // For output model
    const handleOpenOutputModal = (output) => {
        setCurrentOutput(output);
        setIsOutputModalOpen(true);
    };

    const handleCloseOutputModal = () => {
        setCurrentOutput("");
        setIsOutputModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFB] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Title Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                    {/* Contest Name */}
                    <h1 className="text-3xl font-bold text-[#7209B7] mb-2">
                        {resultData?.contest?.name || "Contest Name"}
                    </h1>

                    {/* Contest Title */}
                    <h4 className="text-lg font-medium text-[#560BAD] mb-4">
                        {resultData?.contest?.title || "Contest Title"}
                    </h4>

                    {/* Date & Time Info */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-700 text-[16px]">
                        {/* Date */}
                        <div className="flex items-center gap-2">
                            <MdCalendarToday className="text-[#F72585] text-xl" />
                            <span className="font-medium">Date:</span>
                            <span>{formatDate(resultData?.contest?.startTime) || "N/A"}</span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2">
                            <MdAccessTime className="text-[#F72585] text-xl" />
                            <span className="font-medium">Time:</span>
                            <span>
                                {formatTime(resultData?.contest?.startTime) || "N/A"} - {formatTime(resultData?.contest?.endTime) || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>


                {/* Search and Filter Section */}
                <div className="bg-[#FFFFFF] rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3A0CA3]" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F72585]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <select
                                className="border border-[#E0E0E0] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F72585]"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                <option value="">All Classes</option>
                                {uniqueClasses.map(cls => (
                                    <option key={cls} value={cls}>Class {cls}</option>
                                ))}
                            </select>
                            <select
                                className="border border-[#E0E0E0] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F72585]"
                                value={selectedDivision}
                                onChange={(e) => setSelectedDivision(e.target.value)}
                            >
                                <option value="">All Divisions</option>
                                {uniqueDivisions.map(div => (
                                    <option key={div} value={div}>Division {div}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-[#FFFFFF] rounded-lg shadow-sm overflow-x-auto mb-6">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#E0E0E0]">
                                <th className="p-4 text-left">
                                    <div
                                        className="flex items-center cursor-pointer"
                                    >
                                        <MdPerson className="mr-2" /> Student Name
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div className="flex items-center">
                                        <MdSchool className="mr-2" /> Class
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div className="flex items-center">
                                        <MdGroup className="mr-2" /> Division
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div
                                        className="flex items-center cursor-pointer"

                                    >
                                        <MdStar className="mr-2" /> Cheat
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div
                                        className="flex items-center cursor-pointer"

                                    >
                                        <MdStar className="mr-2" /> Score
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div className="flex items-center">
                                        <MdAssignment className="mr-2" /> TestCase
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div className="flex items-center">
                                        <MdTimer className="mr-2" /> AvgRuntime
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div className="flex items-center">
                                        <MdCheckCircle className="mr-2" /> Accuracy
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div className="flex items-center">
                                        <MdCode className="mr-2" /> Code
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div className="flex items-center">
                                        <MdVisibility className="mr-2" /> Output
                                    </div>
                                </th>
                                <th className="p-4 text-left">
                                    <div className="flex items-center">
                                        <MdSettings className="mr-2" /> Action
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentEntries?.length > 0 ? (
                                currentEntries.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">{student.userDetails.name || "N/A"}</td>
                                        <td className="px-6 py-4">{student.userDetails.classy || "N/A"}</td>
                                        <td className="px-6 py-4">{student.userDetails.division || "N/A"}</td>
                                        <td className={`px-6 py-4 ${student.isCheat ? "text-red-600" : ""}`}>{student.isCheat ? "Yes" : "No"}</td>
                                        <td className="px-6 py-4">{student.score || "N/A"}</td>
                                        <td className="px-6 py-4">{student.testCasesPassed || "N/A"}</td>
                                        <td className="px-6 py-4">{student.avgRuntime ? `${student.avgRuntime} ms` : "N/A"}</td>
                                        <td className="px-6 py-4">{student.accuracy ? `${student.accuracy}%` : "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                className="p-2 text-[#F72585] hover:bg-[#F72585]/10 rounded-full transition"
                                                onClick={() => handleOpenCodeModal(student.code)}
                                            >
                                                <MdVisibility />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                className="p-2 text-[#F72585] hover:bg-[#F72585]/10 rounded-full transition"
                                                onClick={() => handleOpenOutputModal(student.output)}
                                            >
                                                <MdVisibility />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/admin/result/${student.userDetails._id}/${params.paperkey}/${student.userDetails.name}`}>
                                                <button className="p-2 text-[#F72585] hover:bg-[#F72585]/10 rounded-full transition">
                                                    <MdVisibility />
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-4 mb-6">

                    <button
                        className="flex items-center px-4 py-2 border border-[#E0E0E0] rounded-md hover:bg-[#F0F1F3]/10"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        <MdNavigateBefore /> Previous
                    </button>
                    <span className="text-sm items-center px-4 py-2 text-[#3A0CA3]">
                        Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredData?.length)} of {filteredData?.length} results
                    </span>
                    <button
                        className="flex items-center px-4 py-2 border border-[#E0E0E0] rounded-md hover:bg-[#F0F1F3]/10"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next <MdNavigateNext />
                    </button>
                </div>
            </div>
            {isCodeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center h-screen">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl w-full max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Submitted Code</h2>
                            <button onClick={handleCloseCodeModal} className="text-gray-600 hover:text-black">
                                <MdClose size={24} />
                            </button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-y-auto max-h-[70vh]">
                            {currentCode}
                        </pre>
                        <button
                            className="mt-4 w-full bg-[#F72585] text-white py-2 rounded-md hover:bg-[#D90459]"
                            onClick={handleCloseCodeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {isOutputModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center h-screen">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl w-full max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Output Of Code</h2>
                            <button onClick={handleCloseCodeModal} className="text-gray-600 hover:text-black">
                                <MdClose size={24} />
                            </button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-y-auto max-h-[70vh]">
                            {currentOutput}
                        </pre>
                        <button
                            className="mt-4 w-full bg-[#F72585] text-white py-2 rounded-md hover:bg-[#D90459]"
                            onClick={handleCloseOutputModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>

    );
};

export default ContestResult;

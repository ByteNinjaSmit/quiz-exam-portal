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

const StudentResultsPage = () => {
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API}/api/faculty/get-paper-result/${params.paperkey}`,
          {
            headers: {
              Authorization: authorizationToken,
            },
            withCredentials: true,
          }
        );
        // console.log(response);
        if (response.status === 200) {
          const data = response.data.data;
          console.log(data);
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

  return (
    <div className="min-h-screen bg-[#FAFAFB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="bg-[#FFFFFF] rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-[28px] font-semibold text-[#7209B7] mb-4">
            {resultData?.questionPaper?.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-[16px]">
            <div className="flex items-center">
              <MdCalendarToday className="text-[#F72585] mr-2" />
              <span>Date: {formatDate(resultData?.questionPaper?.startTime)}</span>
            </div>
            <div className="flex items-center">
              <MdAccessTime className="text-[#F72585] mr-2" />
              <span>
                Time: {formatTime(resultData?.questionPaper?.startTime)} -{" "}
                {formatTime(resultData?.questionPaper?.endTime)}
              </span>
            </div>
            {resultData?.questionPaper?.isQuiz && (
              <div className="flex items-center">
                <MdCheckCircle className="text-[#4CAF50] mr-2" />
                <span>Quiz Type</span>
              </div>
            )}
            {resultData?.questionPaper?.isFastQuiz && (
              <div className="flex items-center">
                <MdTimer className="text-[#FF6F61] mr-2" />
                <span>Fast Quiz</span>
              </div>
            )}
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
                    onClick={() => handleSort("name")}
                  >
                    <MdPerson className="mr-2" /> Student Name
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "ascending" ? (
                        <MdArrowUpward />
                      ) : (
                        <MdArrowDownward />
                      ))}
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
                    onClick={() => handleSort("totalPoints")}
                  >
                    <MdStar className="mr-2" /> Total Points
                    {sortConfig.key === "totalPoints" &&
                      (sortConfig.direction === "ascending" ? (
                        <MdArrowUpward />
                      ) : (
                        <MdArrowDownward />
                      ))}
                  </div>
                </th>
                <th className="p-4 text-left">
                  <div className="flex items-center">
                    <MdAssignment className="mr-2" /> Attempted
                  </div>
                </th>
                <th className="p-4 text-left">
                  <div className="flex items-center">
                    <MdAssignment className="mr-2" /> Correct Questions
                  </div>
                </th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries?.map((student, index) => (
                <React.Fragment key={index}>
                  <tr className="border-b border-[#E0E0E0] hover:bg-[#F0F1F3]/10 transition-colors">
                    <td className="p-4">{student.userDetails.name}</td>
                    <td className="p-4">{student.userDetails.classy}</td>
                    <td className="p-4">{student.userDetails.division}</td>
                    <td className="p-4">{student.totalPoints}</td>
                    <td className="p-4">{student.attemptedQuestions}</td>
                    <td className="p-4">{student.correctAnswers}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link to={`/admin/result/${student.userDetails._id}/${params.paperkey}/${student.userDetails.name}`}>
                        
                        <button className="p-2 text-[#F72585] hover:bg-[#F72585]/10 rounded-full">
                          <MdVisibility />
                        </button>
                        </Link>
                        {/* <button className="p-2 text-[#3A0CA3] hover:bg-[#3A0CA3]/10 rounded-full">
                          <MdEdit />
                        </button> */}
                        {/* <button className="p-2 text-[#FF6F61] hover:bg-[#FF6F61]/10 rounded-full">
                          <MdDownload />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
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

        {/* Performance Chart */}
        {/* <div className="bg-[#FFFFFF] rounded-lg shadow-sm p-6">
          <h2 className="text-[28px] font-semibold text-[#7209B7] mb-4 flex items-center">
            <MdBarChart className="mr-2" /> Performance Analysis
          </h2>
          <div className="h-[400px]">
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default StudentResultsPage;

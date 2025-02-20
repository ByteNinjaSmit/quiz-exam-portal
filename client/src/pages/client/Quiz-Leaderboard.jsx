import React, { useEffect, useState } from "react";
import { FaCrown } from "react-icons/fa";
import { MdFilterList, MdSearch, MdVisibility, MdEdit } from "react-icons/md";
import { GiTrophy } from "react-icons/gi";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { useAuth } from "../../store/auth";
import { Link,useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiTrash2,
} from "react-icons/fi";

const QuizLeaderboardOverview = () => {
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
  const [isLoading, setIsLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const params = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/api/user/get-current-quiz/leaderboard/${params.paperKey}`, {
          headers: {
            Authorization: authorizationToken,
          },
          withCredentials: true,
        });

        if (response.status === 200) {
          const data = response.data.data.users;

          // console.log(data);
          setLeaderboardData(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [API]);

  const getTrophyColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-[#FFD700]";
      case 2:
        return "text-[#C0C0C0]";
      case 3:
        return "text-[#CD7F32]";
      default:
        return "text-gray-400";
    }
  };

  const getRowBackground = (rank) => {
    switch (rank) {
      case 1:
        return "bg-purple-100";
      case 2:
        return "bg-purple-50";
      case 3:
        return "bg-indigo-50";
      default:
        return "";
    }
  };

  const filteredData = leaderboardData?.filter((user) => {
    const matchesSearch =
      user.userDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userDetails.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Page Data */}
        <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-300 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <FaCrown className="text-4xl text-[#F72585]" />
                  <h1 className="text-[28px] font-semibold text-[#7209B7]">
                    Top Performers
                  </h1>
                </div>
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="p-2 hover:bg-[#F0F1F3] rounded-full transition-colors duration-200"
                >
                  <MdFilterList className="text-2xl text-[#7209B7]" />
                </button>
              </div>
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3A0CA3]" />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] border-input rounded-md focus:ring-2 focus:ring-[#F72585] focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="py-4 px-4 text-left text-[#7209B7] fonr-semibold">
                        Rank
                      </th>
                      <th className="py-4 px-4 text-left text-[#7209B7] fonr-semibold">
                        Name
                      </th>
                      <th className="py-4 px-4 text-left text-[#7209B7] fonr-semibold hidden sm:table-cell">
                        Username
                      </th>
                      <th className="py-4 px-4 text-right text-[#7209B7] fonr-semibold">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntries?.map((user, index) => (
                      <tr
                        key={index}
                        className={`${getRowBackground(
                          index + 1
                        )} hover:bg-[#F0F1F3] transition-colors duration-200`}
                      >
                        <td className="py-4 px-4 flex items-center">
                          <GiTrophy
                            className={`text-2xl mr-2 ${getTrophyColor(
                              user.rank
                            )}`}
                          />
                          <span className="text-[#7209B7]">{user.rank}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#7209B7]">
                            {user.userDetails.name}
                          </div>
                          <div className="text-sm text-[#3A0CA3] sm:hidden">
                            {user.userDetails.username}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#3A0CA3] hidden sm:table-cell">
                          {user.userDetails.username}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-[#F72585]">
                            {user.totalPoints}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-sm text-[#3A0CA3] mt-2">
                Showing {indexOfFirstEntry + 1} to{" "}
                {Math.min(indexOfLastEntry, filteredData?.length)} of{" "}
                {filteredData?.length} results
              </div>
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="p-2 hover:bg-[#F0F1F3] rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed "
                  disabled={currentPage === 1}
                >
                  <AiOutlineArrowLeft className="text-2xl text-[#7209B7]" />
                </button>
                <span className="text-[#7209B7]">Page {currentPage}</span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-[#F0F1F3] rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed "
                >
                  <AiOutlineArrowRight className="text-2xl text-[#7209B7]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLeaderboardOverview;

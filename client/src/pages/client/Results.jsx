import React, { useState, useEffect } from "react";
import {
  MdSearch,
  MdVisibility,
  MdFileDownload,
  MdFilterList,
  MdArrowForward,
  MdArrowBack,
  MdAutorenew,
  MdInbox,
  MdHome,
} from "react-icons/md";
import { useAuth } from "../../store/auth";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const UserResults = () => {
  const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterType, setFilterType] = useState("latest");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API}/api/exam/get/all/results/${user._id}`,
          {
            headers: {
              Authorization: authorizationToken,
            },
            withCredentials: true,
            credentials: "include",
          }
        );
        if (response.status === 200) {
          setData(response.data);
        }
      } catch (error) {
        console.error(error);
        // toast.error("Error Occurred While Getting Results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user._id]);

  const itemsPerPage = 10;

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const filteredData = sortedData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.paperKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedData = showAll
    ? filteredData
    : filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <MdAutorenew className="animate-spin text-6xl text-primary" />
      </div>
    );
  }

  if (!filteredData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <MdInbox className="text-6xl text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">No results found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* write a here Heading of Page in center "Exam Result" */}
      <div className="flex md:justify-between mx-auto flex-col md:flex-row max-w-7xl p-8 gap-4">
        <h1 className="text-center text-3xl font-bold text-indigo-800">
          Exam Results
        </h1>
        <Link to={`/user/dashboard`}>
          <button
            className="flex items-center gap-2 text-indigo-600 bg-indigo-100 px-4 py-2 rounded-lg shadow hover:bg-indigo-200 transition-all duration-300 max-md:mx-auto"
          >
            <MdHome className="text-2xl" />
            Go Home
          </button>
        </Link>

      </div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xl" />
            <input
              type="text"
              placeholder="Search by title or paper key..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setFilterType(filterType === "latest" ? "old" : "latest")
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-400 transition-colors"
            >
              <MdFilterList className="text-xl" />
              <span>{filterType === "latest" ? "Latest" : "Old"}</span>
            </button>
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-500 transition-colors"
            >
              {showAll ? "Show Less" : "Show All"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-gray-400"
                  onClick={() => handleSort("title")}
                >
                  Title
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-gray-400"
                  onClick={() => handleSort("points")}
                >
                  Points
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-gray-400"
                  onClick={() => handleSort("paperKey")}
                >
                  Paper Key
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-gray-400"
                  onClick={() => handleSort("time")}
                >
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-200/20 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.totalPoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.paperKey}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.time).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link to={`/user/result/${user?._id}/${item?.paperKey}`}>
                        <button
                          className="p-2 rounded-full bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 hover:text-white transition-colors"
                          title="View Result"
                        >
                          <MdVisibility className="text-xl" />
                        </button>
                      </Link>
                      {/* <button
                        className=" p-2 rounded-full bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 hover:text-white transition-colors"
                        title="Download Result"
                      >
                        <MdFileDownload className="text-xl" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!showAll && (
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              <MdArrowBack className="text-xl" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              Next <MdArrowForward className="text-xl" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserResults;

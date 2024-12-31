import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdAutorenew, MdSearch, MdNavigateNext, MdNavigateBefore, MdPerson, MdDashboard, MdAdd } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth";
const SeeAllUsers = () => {

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const { API } = useAuth(); // Custom hook from AuthContext

  useEffect(() => {
    setLoading(true)
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API}/api/dev/get-all-users`);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [])

  const filteredData = userData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "" || user.classy === selectedClass;
    const matchesDivision = selectedDivision === "" || user.division === selectedDivision;
    return matchesSearch && matchesClass && matchesDivision;
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  const handleEdit = (id) => {
    console.log("Edit user:", id);
  };

  const handleDelete = (id) => {
    console.log("Delete user:", id);
  };

  const uniqueClasses = [...new Set(userData.map(user => user.classy))];
  const uniqueDivisions = [...new Set(userData.map(user => user.division))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F1F3] to-[#F0F1F3] p-6">
      <div className="flex flex-col md:flex-row md:justify-between items-center max-w-7xl mx-auto gap-2 mb-3">
        <h1 className="text-3xl font-bold mb-8 animate-slide-in flex items-center">
          <MdPerson className="mr-2" /> See All Users
        </h1>

        {/* Button and Dashboard Icon */}
        <div className="flex items-center">
          <Link
            to={`/developer/dev/dashboard`}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            <MdDashboard className="mr-2" /> Go to Dashboard
          </Link>
        </div>
      </div>


      {/* Create User Form */}
      <div className="flex mb-8 max-w-7xl mx-auto max-md:justify-center max-md:items-center">
        <Link to={`/developer/dev/new-user`}>
          <button
            // onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition duration-200"
          >
            <MdAdd className="mr-2" /> Create New User
          </button>

        </Link>
      </div>

      <div className="max-w-7xl mx-auto bg-[#FFFFFF] rounded-lg shadow-lg p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border border-[#E0E0E0] border-input rounded-md focus:ring-2 focus:ring-[#F72585] focus:outline-none"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-[#E0E0E0] border-input rounded-md focus:ring-2 focus:ring-[#F72585] focus:outline-none"
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
        <div className="flex items-center gap-2 mb-2">
          <select
            className="px-4 py-2 border border-input rounded-md focus:ring-2 focus:ring-[#F72585] focus:outline-none"
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm text-[#3A0CA3]">
            entries per page
          </span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <MdAutorenew className="animate-spin text-4xl text-[#F72585]" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F0F1F3] sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Division</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Roll Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3A0CA3] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {currentEntries.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-[#F0F1F3]"} hover:bg-[#F0F1F3] transition-colors duration-200 hover:shadow-md`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.classy}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.division}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.rollNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="text-accent hover:text-[#F72585] transition-colors duration-200"
                          title="Edit user"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-[#FF4C4C] hover:text-[#FF4C4C] transition-colors duration-200"
                          title="Delete user"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-end items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#3A0CA3]">
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredData.length)} of {filteredData.length} results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-[#F0F1F3] hover:bg-[#F0F1F3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <MdNavigateBefore size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-[#F0F1F3] hover:bg-[#F0F1F3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <MdNavigateNext size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeeAllUsers;
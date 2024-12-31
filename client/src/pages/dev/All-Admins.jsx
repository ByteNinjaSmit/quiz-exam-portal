import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdSearch, MdAutorenew, MdArrowDropDown, MdDashboard, MdPerson, MdAdd } from "react-icons/md";
import { useAuth } from "../../store/auth";
import { Link } from "react-router-dom";
const SeeAllAdmins = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const { API } = useAuth(); // Custom hook from AuthContext

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/api/dev/get-all-admins`);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const ResponseData = await response.json();
        setData(ResponseData);
        setFilteredData(ResponseData)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [])


  const getRoles = (faculty) => {
    const roles = [];
    if (faculty.isTeacher) roles.push({ name: "Teacher", color: "bg-blue-500" });
    if (faculty.isHod) roles.push({ name: "HOD", color: "bg-purple-500" });
    if (faculty.isTnp) roles.push({ name: "TNP", color: "bg-green-500" });
    return roles;
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    filterData(searchTerm, roleFilter, subjectFilter);
  };

  const handleRoleFilter = (e) => {
    const role = e.target.value;
    setRoleFilter(role);
    filterData(search, role, subjectFilter);
  };

  const handleSubjectFilter = (e) => {
    const subject = e.target.value;
    setSubjectFilter(subject);
    filterData(search, roleFilter, subject);
  };

  const filterData = (searchTerm, role, subject) => {
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.username.toLowerCase().includes(searchTerm) ||
          item.email.toLowerCase().includes(searchTerm)
      );
    }

    if (role !== "all") {
      filtered = filtered.filter((item) => {
        if (role === "teacher") return item.isTeacher;
        if (role === "hod") return item.isHod;
        if (role === "tnp") return item.isTnp;
        return true;
      });
    }

    if (subject !== "all") {
      filtered = filtered.filter((item) => item.subject === subject);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <MdAutorenew className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-center max-w-7xl mx-auto gap-2 mb-3">
        <h1 className="text-3xl font-bold mb-8 animate-slide-in flex items-center">
          <MdPerson className="mr-2" /> See All Admins
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
        <Link to={`/developer/dev/new-faculty`}>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition duration-200"
        >
          <MdAdd className="mr-2" /> Create New Admin
        </button>
        </Link>
      </div>




      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] border-input rounded-md focus:outline-none focus:ring-2 focus:focus:ring-[#F72585]"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select
              className="px-4 py-2 border border-[#E0E0E0] border-input rounded-md focus:outline-none focus:ring-2 focus:focus:ring-[#F72585]"
              value={roleFilter}
              onChange={handleRoleFilter}
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teacher</option>
              <option value="hod">HOD</option>
              <option value="tnp">TNP</option>
            </select>
            <select
              className="px-4 py-2 border border-[#E0E0E0] border-input rounded-md focus:outline-none focus:ring-2 focus:ring-[#F72585]"
              value={subjectFilter}
              onChange={handleSubjectFilter}
            >
              <option value="all">All Subjects</option>
              {Array.from(new Set(data.map((item) => item.subject))).map((subject,index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 md:mb-2 ">
          <select
            className="px-4 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:focus:ring-[#F72585]"
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
          >
            <option value={10}>10 entries</option>
            <option value={20}>20 entries</option>
            <option value={50}>50 entries</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F1F3] sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.map((faculty, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors duration-200`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{faculty.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{faculty.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{faculty.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{faculty.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {getRoles(faculty).map((role, index) => (
                        <span
                          key={index}
                          className={`${role.color} text-white px-2 py-1 rounded-full text-xs`}
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {faculty.subject || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-4">
                      <button
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="Edit"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Delete"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-end items-center">

          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 border border-[#E0E0E0] rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredData.length)} of {filteredData.length} results
            </span>
            <button
              className="px-4 py-2 border border-[#E0E0E0] rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastEntry >= filteredData.length}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeeAllAdmins;
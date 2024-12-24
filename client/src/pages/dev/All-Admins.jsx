import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiKey,
} from "react-icons/fi";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdWarning,
  MdBed,
  MdPerson,
  MdBusinessCenter,
  MdDashboard,
  MdLocationOn,
} from "react-icons/md";
import { Link, useNavigate, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { ChevronDown, ChevronUp, Search, Save, RefreshCw } from "lucide-react";

const SeeAllAdmins = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectHostel, setSelectHostel] = useState("All Hostels");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHostelOpen, setIsHostelOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    hostel: "",
    room: "",
    status: "Active",
  });
  const [filters, setFilters] = useState({
    hostel: [],
    room: [],
    status: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { API } = useAuth(); // Custom hook from AuthContext

  //  Getting Users
  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/dev/get-all-admins`);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getUsers();
  }, []);

  const uniqueHostel = new Set(users.map((student) => student?.hostelId));
  const Hostels = Array.from(uniqueHostel);

  // Assuming `newData` contains the attendance and status for each student Filtering
  const filteredStudents = users?.filter((student) => {
    const isInSelectedHostel =
      selectHostel === "All Hostels" || student?.hostelId === selectHostel;
    return (
      student?.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      isInSelectedHostel
    );
  });
  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      hostel: [],
      room: [],
      status: [],
    });
  };

  const handleSort = (column) => {
    // Implement sorting logic
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleBulkAction = () => {
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex justify-between items-center">
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
      <div className="mb-8">
        <button
          // onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition duration-200"
        >
          <MdAdd className="mr-2" /> Create New Admin
        </button>
      </div>

      {/* Rest of the component remains the same */}
      {/* Search and Filters Section */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name or Username"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsHostelOpen(!isHostelOpen)}
              className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto"
            >
              {selectHostel}
              {isHostelOpen ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </button>
            {isHostelOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ">
                <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                  <li
                    onClick={() => {
                      setSelectHostel("All Hostels"); // Set to "All Rooms"
                      setIsHostelOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    All Hostels
                  </li>
                  {Hostels.map((hostel) => (
                    <li
                      key={hostel}
                      onClick={() => {
                        setSelectHostel(hostel);
                        setIsHostelOpen(false);
                      }}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    >
                      {hostel}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={clearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users?.map((user) => user?._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hostel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents?.map((user, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user._id]);
                        } else {
                          setSelectedUsers(
                            selectedUsers.filter((id) => id !== user._id)
                          );
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-wrap">
                    {user?.isRector ? "Rector" : "High Authority"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {user?.hostelId || "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <MdEdit className="w-5 h-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">10</span> of{" "}
                <span className="font-medium">{users.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition duration-200 group">
        <MdAdd className="w-6 h-6" />
        <span className="absolute right-full mr-2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Add New User
        </span>
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-6">
              Are you sure you want to perform this action?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  // Implement bulk action logic
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeeAllAdmins;
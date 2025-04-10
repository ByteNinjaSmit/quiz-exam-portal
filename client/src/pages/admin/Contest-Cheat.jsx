import { useEffect, useState } from "react"
import { Eye, Trash2, AlertTriangle, Shield, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../../store/auth"

export default function CheatMonitoringDashboardContest() {
  const { user, isLoggedIn, authorizationToken, API } = useAuth()
  const params = useParams()
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 10

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API}/api/faculty/get-contest-cheat/${params?.problemId}`, {
        headers: {
          Authorization: authorizationToken,
        },
        withCredentials: true,
      })

      if (response.status === 200) {
        // console.log("Fetched Data Response ", response.data)
        setData(response.data.cheatData)
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to fetch cheat data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params?.problemId])

  // Filter data based on search term and flagged toggle
  const filteredData = data.filter((item) => {
    const matchesSearch =
      (item.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFlagged = showOnlyFlagged ? item.isCheat || item.isWarning : true
    return matchesSearch && matchesFlagged
  })

  // Calculate summary statistics
  const totalCheats = data.filter((item) => item.isCheat).length
  const totalWarnings = data.filter((item) => item.isWarning).length
  const totalEntries = data.length

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Handle actions
  const handleDelete = async (id) => {
    try {
      // API call to delete the record would go here
      const response = await axios.delete(`${API}/api/faculty/delete-contest-cheat/${id}/${params.problemId}`, {
        headers: { 'Authorization': authorizationToken },
        withCredentials: true,
      })
      if (response.status === 200) {
        toast.success(response.data.message)
        fetchData();
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete record")
    }
  }

  const handleToggleWarning = async (id) => {
    try {
      // API call to update warning status would go here
      const response = await axios.patch(`${API}/api/faculty/update-warning-contest-cheat`,
        {
          studentId: id,
          problemId: params?.problemId,
        },
        {
          headers: { 'Authorization': authorizationToken },
          withCredentials: true,
        }
      )
      if (response.status === 200) {
        toast.success(response.data.message)
        fetchData();
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to update warning status")
    }
  }

  const handleToggleCheat = async (id) => {
    try {

      // API call to update cheat status would go here
      const response = await axios.patch(`${API}/api/faculty/update-ischeat-contest-cheat`,
        {
          studentId: id,
          problemId: params?.problemId,
        },
        {
          headers: { 'Authorization': authorizationToken },
          withCredentials: true,
        }
      )
      if (response.status === 200) {
        toast.success(response.data.message)
        fetchData();
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to update cheat status")
    }
  }

  const handleViewReason = (student, reason) => {
    setSelectedRecord({ studentName: student, reason })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3 mr-4">
            <Shield className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Cheats</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCheats}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3 mr-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Warnings</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalWarnings}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3 mr-4">
            <Eye className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Entries</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalEntries}</h3>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setSearchTerm("")}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>

          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showOnlyFlagged}
                onChange={() => setShowOnlyFlagged(!showOnlyFlagged)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Show only flagged entries
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Data Table (Desktop) */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Student
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Reason
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Timestamp
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.user?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.user?.username || "No username"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.user?.department} - {item.user?.classy} {item.user?.division} ({item.user?.rollNo})
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isCheat
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        {item.isCheat ? "Cheat Detected" : "No Cheat"}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isWarning
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.isWarning ? "Warning" : "No Warning"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{item?.reason}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewReason(item.user?.name || "Unknown Student", item?.reason)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleWarning(item.user._id)}
                        className={`p-1 rounded-full transition-colors ${
                          item.isWarning
                            ? "text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title={item.isWarning ? "Remove Warning" : "Mark as Warning"}
                      >
                        <AlertTriangle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleCheat(item.user._id)}
                        className={`p-1 rounded-full transition-colors ${
                          item.isCheat
                            ? "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title={item.isCheat ? "Remove Cheat Flag" : "Mark as Cheat"}
                      >
                        <Shield className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.user._id)}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No cheat data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Data Cards (Mobile) */}
      <div className="md:hidden space-y-4 mb-6">
        {paginatedData.length > 0 ? (
          paginatedData.map((item) => (
            <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.user?.name || "Unknown"}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.user?.username || "No username"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.user?.department} - {item.user?.classy} {item.user?.division} ({item.user?.rollNo})
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleViewReason(item.user?.name || "Unknown Student", item?.reason)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.user._id)}
                    className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.isCheat
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  }`}
                >
                  {item.isCheat ? "Cheat Detected" : "No Cheat"}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.isWarning
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item.isWarning ? "Warning" : "No Warning"}
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{item?.reason}</p>

              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleWarning(item.user._id)}
                    className={`p-1 rounded-full transition-colors ${
                      item.isWarning
                        ? "text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                    title={item.isWarning ? "Remove Warning" : "Mark as Warning"}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleToggleCheat(item.user._id)}
                    className={`p-1 rounded-full transition-colors ${
                      item.isCheat
                        ? "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                    title={item.isCheat ? "Remove Cheat Flag" : "Mark as Cheat"}
                  >
                    <Shield className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center text-gray-500 dark:text-gray-400">
            No cheat data found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of{" "}
                <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === index + 1
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    } text-sm font-medium`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing full reason */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedRecord.studentName}</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Flag:</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedRecord?.reason}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

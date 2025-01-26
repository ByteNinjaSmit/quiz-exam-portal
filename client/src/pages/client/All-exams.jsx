import React, { useState, useEffect } from "react"
import { MdAccessTime, MdCheckCircle, MdPlayCircleOutline, MdSearch } from "react-icons/md"
import axios from "axios"
import { useAuth } from "../../store/auth";
import { Link } from "react-router-dom";

// Mock data for exams
const mockExams = [
    { id: 1, title: "Mathematics 101", time: "2025-02-01T10:00:00", status: "Upcoming" },
    { id: 2, title: "History of Science", time: "2025-02-03T14:00:00", status: "Upcoming" },
    { id: 3, title: "Introduction to Literature", time: "2025-01-28T09:00:00", status: "In Progress" },
    { id: 4, title: "Computer Science Basics", time: "2025-01-25T13:00:00", status: "Completed" },
]

export default function ExamListPage() {
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
    const [isMobileView, setIsMobileView] = useState(false);
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")


    const getExams = async () => {
        try {
            const response = await axios.get(`${API}/api/user/get-exams/${user.classy}`, {
                headers: {
                    Authorization: authorizationToken,
                    withCredentials: true,
                }
            });
            if (response.status === 200) {
                const data = response.data.exams;
                setExams(data);

            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Simulating API call
        getExams();
    }, [])

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // You can adjust this threshold based on your needs
                setIsMobileView(true);
            } else {
                setIsMobileView(false);
            }
        };

        // Initial check on component mount
        handleResize();

        // Add resize event listener
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);



    const filteredExams = exams.filter(
        (exam) =>
            exam?.title.toLowerCase().includes(searchTerm.toLowerCase())
    )


    const getStatusColor = (status) => {
        switch (status) {
            case "Upcoming":
                return "bg-blue-100 text-blue-800"
            case "On Going":
                return "bg-yellow-100 text-yellow-800"
            case "Completed":
                return "bg-gray-100 text-gray-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getButtonColor = (status) => {
        switch (status) {
            case "Upcoming":
                return "bg-blue-500 hover:bg-blue-600"
            case "On Going":
                return "bg-green-500 hover:bg-green-600"
            case "Completed":
                return "bg-gray-500 hover:bg-gray-600"
            default:
                return "bg-gray-500 hover:bg-gray-600"
        }
    }

    
    // Function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: "numeric", month: "numeric", day: "numeric" };
        return date.toLocaleDateString("en-IN", options);
    };

    // Function to format the time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const options = { hour: "2-digit", minute: "2-digit", hour12: true };
        return date.toLocaleTimeString("en-US", options);
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Exam List</h1>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search exams..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MdSearch className="absolute left-3 top-2.5 text-gray-400 text-xl" />
                </div>
            </div>
            {
                !isMobileView ? (
                    loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExams.map((exam, index) => {
                                        const currentTime = new Date();
                                        const examStartTime = new Date(exam.startTime);
                                        const examEndTime = new Date(exam.endTime);
                                        const isExamOngoing = currentTime >= examStartTime && currentTime <= examEndTime;
                                        const isExamScheduled = currentTime < examStartTime;
                                        const isExamEnded = currentTime > examEndTime;
                                        const status = isExamScheduled ? "Upcoming" : isExamEnded ? "Completed" : isExamOngoing ? "On Going" : "";
                                        return (
                                            <tr key={index} className="hover:bg-gray-50" >
                                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap font-medium">{exam.title}</p>
                                                </td>
                                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                                    <div className="flex items-center">
                                                        <MdAccessTime className="text-gray-500 mr-2" />
                                                        <p className="text-gray-900 whitespace-no-wrap">
                                                            {exam?.startTime && formatDate(exam.startTime)} at{" "}
                                                            {exam?.startTime && formatTime(exam.startTime)} to{" "}
                                                            {exam?.endTime && formatTime(exam.endTime)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                                    <span
                                                        className={`relative inline-block px-3 py-1 font-semibold rounded-full ${getStatusColor(status)}`}
                                                    >
                                                        <MdCheckCircle className="inline-block mr-1" />
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                                    {
                                                        isExamScheduled && (
                                                            <button
                                                                className={`${getButtonColor(status)} text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-not-allowed opacity-50`}
                                                                disabled={true}
                                                            >
                                                                <MdPlayCircleOutline className="mr-2" />
                                                                Exam is Scheduled
                                                            </button>
                                                        )
                                                    }
                                                    {
                                                        isExamOngoing && (
                                                            <Link to={`/user/paper/${exam?.title}/${exam?.paperKey}/${exam?._id}`}>
                                                                <button
                                                                    className={`${getButtonColor(status)} text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                                                    disabled={status === "Completed"}
                                                                    aria-label={`Take ${exam.title} exam`}
                                                                >
                                                                    <MdPlayCircleOutline className="mr-2" />
                                                                    Take Exam
                                                                </button>
                                                            </Link>
                                                        )
                                                    }
                                                    {
                                                        isExamEnded && (
                                                            <button
                                                                className={`${getButtonColor(status)} text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-not-allowed opacity-50`}
                                                                disabled={status === "Completed"}
                                                            >
                                                                <MdPlayCircleOutline className="mr-2" />
                                                                Exam is ended
                                                            </button>
                                                        )
                                                    }

                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="md:hidden space-y-4 mt-4">
                        {filteredExams.map((exam, index) => {
                            const currentTime = new Date();
                            const examStartTime = new Date(exam.startTime);
                            const examEndTime = new Date(exam.endTime);
                            const isExamOngoing = currentTime >= examStartTime && currentTime <= examEndTime;
                            const isExamScheduled = currentTime < examStartTime;
                            const isExamEnded = currentTime > examEndTime;
                            const status = isExamScheduled ? "Upcoming" : isExamEnded ? "Completed" : isExamOngoing ? "On Going" : "";
                            return (
                                <div key={index} className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="font-bold text-lg mb-2">{exam.title}</h3>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <MdAccessTime className="mr-2" />
                                        {exam?.startTime && formatDate(exam.startTime)} at{" "}
                                        {exam?.startTime && formatTime(exam.startTime)} to{" "}
                                        {exam?.endTime && formatTime(exam.endTime)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                                            <MdCheckCircle className="inline-block mr-1" />
                                            {status}
                                        </span>
                                        {
                                            isExamScheduled && (
                                                <button
                                                    className={`${getButtonColor(status)} text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-not-allowed opacity-50`}
                                                    disabled={true}
                                                >
                                                    <MdPlayCircleOutline className="mr-2" />
                                                    Exam is Scheduled
                                                </button>
                                            )
                                        }
                                        {
                                            isExamOngoing && (
                                                <Link to={`/user/paper/${exam?.title}/${exam?.paperKey}/${exam?._id}`}>
                                                    <button
                                                        className={`${getButtonColor(status)} text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                                        disabled={status === "Completed"}
                                                        aria-label={`Take ${exam.title} exam`}
                                                    >
                                                        <MdPlayCircleOutline className="mr-2" />
                                                        Take Exam
                                                    </button>
                                                </Link>
                                            )
                                        }
                                        {
                                            isExamEnded && (
                                                <button
                                                    className={`${getButtonColor(status)} text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-not-allowed opacity-50`}
                                                    disabled={status === "Completed"}
                                                >
                                                    <MdPlayCircleOutline className="mr-2" />
                                                    Exam is ended
                                                </button>
                                            )
                                        }

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            }
        </div >
    )
}


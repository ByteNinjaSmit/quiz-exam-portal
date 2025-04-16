import React, { useState, useEffect } from "react";
import {
  FaUserEdit,
  FaGraduationCap,
  FaRegUserCircle,
  FaTrophy,
  FaFileAlt,
  FaBriefcase,
  FaChartBar,
  FaBell,
  FaCode,
  FaCalendarAlt,
} from "react-icons/fa";
import { IoMdTimer } from "react-icons/io";
import { useAuth } from "../../store/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
const Dashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [problemData, setProblemData] = useState([]);
  const [contestData, setContestData] = useState([]);
  useEffect(() => {
    if (!isLoggedIn) {
      return navigate("/");
    }
  }, []);

  // console.log(user.classy);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
  
      const config = {
        headers: { Authorization: authorizationToken },
        withCredentials: true,
      };
  
      try {
        // 1. Fetch Exams
        try {
          const examRes = await axios.get(`${API}/api/user/get-exam/${user.classy}`, config);
          setExams(examRes.data.exams);
        } catch (err) {
          console.warn("Exams fetch failed:", err.message);
        }
  
        // 2. Fetch Problems
        try {
          const problemRes = await axios.get(`${API}/api/problem/get-all-problems`, config);
          setProblemData(problemRes.data.problems);
        } catch (err) {
          console.warn("Problems fetch failed:", err.message);
        }
  
        // 3. Fetch Contest
        try {
          const contestRes = await axios.get(`${API}/api/problem/get-latest-contest`, config);
          setContestData(contestRes.data.contest);
          // console.log("Contest Data: ", contestRes.data);
          
        } catch (err) {
          console.warn("Contest fetch failed:", err.message);
        }
  
        // 4. Fetch Results
        try {
          const resultRes = await axios.get(`${API}/api/exam/get/results/${user._id}`, config);
          setResults(resultRes.data);
        } catch (err) {
          console.warn("Results fetch failed:", err.message);
        }
  
        // 5. Fetch Leaderboard
        try {
          const leaderboardRes = await axios.get(`${API}/api/exam/get/leaderboard`);
          setLeaderboardData(leaderboardRes.data.data);
        } catch (err) {
          console.warn("Leaderboard fetch failed:", err.message);
        }
  
      } catch (err) {
        console.error("Something unexpected failed:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [API]);
  

  const dummyData = {
    profile: {
      name: "John Doe",
      course: "Computer Engineering",
      department: "Engineering",
      year: "3rd Year",
      gpa: "3.8",
      attendance: "92%",
      image: "images.unsplash.com/photo-1633332755192-727a05c4013d",
    },
    leaderboard: [
      { rank: 1, name: "Alice Smith", score: 98 },
      { rank: 2, name: "Bob Johnson", score: 95 },
      { rank: 3, name: "John Doe", score: 92 },
    ],
    interviews: [
      { company: "Tech Corp", date: "2024-02-18", status: "Scheduled" },
      { company: "Innovation Labs", date: "2024-02-22", status: "Pending" },
    ],
    examResults: [
      { subject: "Computer Networks", score: 92, grade: "A" },
      { subject: "Operating Systems", score: 88, grade: "B+" },
    ],
    projects: [
      { name: "AI Chat Application", tech: "Python, React" },
      { name: "IoT Smart Home", tech: "Arduino, Node.js" },
    ],
  };

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
  // console.log(results);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <div className="relative">
            <FaBell
              className="text-2xl text-indigo-600 cursor-pointer hover:text-purple-600 transition-colors duration-300"
              onClick={() => setShowNotifications(!showNotifications)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">Profile</h2>
              <FaUserEdit className="text-purple-600 cursor-pointer hover:text-indigo-600 transition-colors duration-300" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <FaRegUserCircle className="w-20 h-20 text-indigo-500 ring-4 ring-purple-200 rounded-full p-1 bg-white" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-sm text-indigo-600">PRN: @{user?.username}</p>
                <p className="text-sm text-indigo-600">Department: {user?.department}</p>
                <p className="text-sm text-indigo-600">
                  Class: {user?.classy} {user?.division}
                </p>
                <p className="text-sm text-indigo-600">Batch: {user?.batch}</p>
                <p className="text-sm text-purple-600">Roll No: {user?.rollNo}</p>
                <p className="text-sm text-indigo-600">
                  Honors Student: {user?.isHonors}
                </p>
              </div>
            </div>
            {/* <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl">
                <p className="text-sm text-gray-600">GPA</p>
                <p className="text-xl font-semibold text-indigo-600">
                  {dummyData.profile.gpa}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl">
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-xl font-semibold text-purple-600">
                  {dummyData.profile.attendance}
                </p>
              </div>
            </div> */}
            <Link to={`/user/edit-profile`}>
              <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                Edit Profile
              </button>
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">
                Upcoming Quiz Exams
              </h2>
              <IoMdTimer className="text-purple-600" />
            </div>
            {
              exams.length > 0 ? (
                exams?.slice(0, 2).map((exam, index) => {
                  const currentTime = new Date();
                  const examStartTime = new Date(exam.startTime);
                  const examEndTime = new Date(exam.endTime);
                  const isExamOngoing =
                    currentTime >= examStartTime && currentTime <= examEndTime;
                  const isExamScheduled = currentTime < examStartTime;
                  const isExamEnded = currentTime > examEndTime;

                  return (
                    <div
                      key={index}
                      className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
                    >
                      <h3 className="font-semibold text-indigo-700">
                        {exam?.title}
                      </h3>
                      <p className="text-purple-600">
                        {exam?.startTime && formatDate(exam.startTime)} at{" "}
                        {exam?.startTime && formatTime(exam.startTime)} to{" "}
                        {exam?.endTime && formatTime(exam.endTime)}
                      </p>
                      {isExamScheduled && (
                        <p className="text-yellow-600 font-medium mt-2">
                          Exam is scheduled
                        </p>
                      )}
                      {isExamEnded && (<>
                        <p className="text-red-600 font-medium mt-2">
                          Exam is ended
                        </p>
                        {results?.some(r => r.paperKey === exam?.paperKey) && (
                          <Link to={`/user/quiz-leaderboard/${exam?.paperKey}`}>
                            <button className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                              See Your Rank
                            </button>
                          </Link>
                        )}
                      </>
                      )}
                      {isExamOngoing && (
                        <Link
                          to={`/user/paper/${exam?.title}/${exam?.paperKey}/${exam?._id}`}
                        >
                          <button className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                            Take Exam
                          </button>
                        </Link>
                      )}
                      {/* {!isExamOngoing && !isExamEnded && (
                        <button
                          className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
                          disabled
                        >
                          Take Exam
                        </button>
                      )} */}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md">
                  <h3 className="font-semibold text-red-600">No Quiz Exams found</h3>
                  <p className="text-gray-600">Please check back later or try searching for something else.</p>
                </div>
              )
            }
            <Link to={`/user/exams`}>
              <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                View All Quiz Exams
              </button>
            </Link>
          </div>
          {/* Problem Solving Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">
                Problem Solving
              </h2>
              <FaChartBar className="text-purple-600" />
            </div>

            {problemData.length > 0 ? (
              problemData.slice(0, 2).map((problem, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
                >
                  <h3 className="font-semibold text-indigo-700">{problem?.title}</h3>
                  <div className="flex justify-between mt-2">
                    <span className="text-purple-600">Difficulty: {problem?.difficulty}</span>
                    {/* Properly Styled Button */}
                    <Link to={`/user/problem-solving/${problem._id}`}>
                      <button
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Solve Problem
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md">
                <h3 className="font-semibold text-red-600">No Problems found</h3>
                <p className="text-gray-600">Please check back later or try searching for something else.</p>
              </div>
            )}
            {
              problemData.length > 2 && (
                <Link to={`/user/problem-solving`}>
                  <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    View All Problems
                  </button>
                </Link>
              )
            }
          </div>
          {/* Coding Contest Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">
                Coding Contest
              </h2>
              <FaCode className="text-purple-600" />
            </div>

            {contestData.length > 0 ? (
              contestData?.slice(0, 2).map((problem, index) => {
                const currentTime = new Date();
                const examStartTime = new Date(problem.startTime);
                const examEndTime = new Date(problem.endTime);
                const isExamOngoing =
                  currentTime >= examStartTime && currentTime <= examEndTime;
                const isExamScheduled = currentTime < examStartTime;
                const isExamEnded = currentTime > examEndTime;

                return (
                  <div
                    key={index}
                    className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
                  >
                    <h3 className="font-semibold text-indigo-700">
                      {problem?.name}
                    </h3>
                    <p className="text-purple-600">
                      {problem?.startTime && formatDate(problem.startTime)} at{" "}
                      {problem?.startTime && formatTime(problem.startTime)} to{" "}
                      {problem?.endTime && formatTime(problem.endTime)}
                    </p>
                    {isExamScheduled && (
                      <p className="text-yellow-600 font-medium mt-2">
                        Contest is scheduled
                      </p>
                    )}
                    {isExamEnded || problem.ended && (
                      <p className="text-red-600 font-medium mt-2">
                        Contest is ended
                      </p>
                    )}
                    {isExamOngoing && !problem.ended && (
                      <Link
                        to={`/user/coding-contest/${problem?._id}`}
                      >
                        <button className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                          Take Contest
                        </button>
                      </Link>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md">
                <h3 className="font-semibold text-red-600">No Contest found</h3>
                <p className="text-gray-600">Please check back later or try searching for something else.</p>
              </div>
            )}
            {
              contestData.length > 2 && (
                <Link to={`/user/coding-contest-all`}>
                  <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    View All Contest
                  </button>
                </Link>
              )
            }
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">
                Global Leaderboard
              </h2>
              <FaTrophy className="text-yellow-500" />
            </div>
            {(leaderboardData.length > 0) ? (leaderboardData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between mb-3 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="ml-3 text-gray-800">{item.name}</span>
                </div>
                <span className="font-semibold text-purple-600">
                  {item.totalPoints}
                </span>
              </div>
            ))) : (
              <div className="p-6 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md">
                <h3 className="font-semibold text-red-600">No Leaderboard found</h3>
                <p className="text-gray-600">Please check back later or try searching for something else.</p>
              </div>
            )}
            <Link to={`/user/global-leaderboard`}>
              <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                View All
              </button>
            </Link>
          </div>

          {/* Remaining sections with similar styling */}
          {/* Projects Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">
                Projects
              </h2>
              <FaCode className="text-purple-600" />
            </div>
            <div className="p-6 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md">
              <h3 className="font-semibold text-red-600">No Projects found</h3>
              <p className="text-gray-600">Please check back later or try searching for something else.</p>
            </div>
          </div>

          {/* Interviews Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">
                Interviews
              </h2>
              <FaBriefcase className="text-purple-600" />
            </div>
            <div className="p-6 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md">
              <h3 className="font-semibold text-red-600">No Interviews found</h3>
              <p className="text-gray-600">Please check back later or try searching for something else.</p>
            </div>
          </div>

          {/* Exam Results Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">
                Exam Results
              </h2>
              <FaChartBar className="text-purple-600" />
            </div>

            {results.length > 0 ? (
              results.map((result, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
                >
                  <h3 className="font-semibold text-indigo-700">{result?.title}</h3>
                  <div className="flex justify-between mt-2">
                    <span className="text-purple-600">Score: {result?.totalPoints}</span>
                    {/* Properly Styled Button */}
                    <Link to={`/user/result/${user?._id}/${result?.paperKey}`}>
                      <button
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        View Result
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md">
                <h3 className="font-semibold text-red-600">No results found</h3>
                <p className="text-gray-600">Please check back later or try searching for something else.</p>
              </div>
            )}
            {
              results.length > 0 && (
                <Link to={`/user/results`}>
                  <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    View All Results
                  </button>
                </Link>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState,useEffect } from "react";
import { FaUserEdit, FaGraduationCap, FaTrophy, FaFileAlt, FaBriefcase, FaChartBar, FaBell, FaCode, FaCalendarAlt } from "react-icons/fa";
import { IoMdTimer } from "react-icons/io";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user,isLoggedIn } = useAuth(); // Custom hook from AuthContext3
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
        return navigate('/')
    }
},[])
  const dummyData = {
    profile: {
      name: "John Doe",
      course: "Computer Engineering",
      department: "Engineering",
      year: "3rd Year",
      gpa: "3.8",
      attendance: "92%",
      image: "images.unsplash.com/photo-1633332755192-727a05c4013d"
    },
    exams: [
      { id: 1, subject: "Advanced Algorithms", date: "2024-02-20", time: "10:00 AM" },
      { id: 2, subject: "Database Systems", date: "2024-02-25", time: "2:00 PM" }
    ],
    leaderboard: [
      { rank: 1, name: "Alice Smith", score: 98 },
      { rank: 2, name: "Bob Johnson", score: 95 },
      { rank: 3, name: "John Doe", score: 92 }
    ],
    interviews: [
      { company: "Tech Corp", date: "2024-02-18", status: "Scheduled" },
      { company: "Innovation Labs", date: "2024-02-22", status: "Pending" }
    ],
    examResults: [
      { subject: "Computer Networks", score: 92, grade: "A" },
      { subject: "Operating Systems", score: 88, grade: "B+" }
    ],
    projects: [
      { name: "AI Chat Application", tech: "Python, React" },
      { name: "IoT Smart Home", tech: "Arduino, Node.js" }
    ]
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Student Dashboard</h1>
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
            <div className="flex items-center mb-4">
              <img
                src={`https://${dummyData.profile.image}`}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-200"
              />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-indigo-600">{user?.username}</p>
                <p className="text-indigo-600">{user?.classy} {user?.division}</p>
                <p className="text-purple-600">{user?.rollNo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl">
                <p className="text-sm text-gray-600">GPA</p>
                <p className="text-xl font-semibold text-indigo-600">{dummyData.profile.gpa}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl">
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-xl font-semibold text-purple-600">{dummyData.profile.attendance}</p>
              </div>
            </div>
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">Edit Profile</button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">Upcoming Exams</h2>
              <IoMdTimer className="text-purple-600" />
            </div>
            {dummyData.exams.map((exam) => (
              <div key={exam.id} className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h3 className="font-semibold text-indigo-700">{exam.subject}</h3>
                <p className="text-purple-600">{exam.date} at {exam.time}</p>
                <button className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">Take Exam</button>
              </div>
            ))}
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">View All Exams</button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">Leaderboard</h2>
              <FaTrophy className="text-yellow-500" />
            </div>
            {dummyData.leaderboard.map((item) => (
              <div key={item.rank} className="flex items-center justify-between mb-3 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center">{item.rank}</span>
                  <span className="ml-3 text-gray-800">{item.name}</span>
                </div>
                <span className="font-semibold text-purple-600">{item.score}</span>
              </div>
            ))}
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">View All</button>
          </div>

          {/* Remaining sections with similar styling */}
          {/* Projects Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">Projects</h2>
              <FaCode className="text-purple-600" />
            </div>
            {dummyData.projects.map((project, index) => (
              <div key={index} className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h3 className="font-semibold text-indigo-700">{project.name}</h3>
                <p className="text-purple-600">{project.tech}</p>
              </div>
            ))}
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">View Projects</button>
          </div>

          {/* Interviews Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">Interviews</h2>
              <FaBriefcase className="text-purple-600" />
            </div>
            {dummyData.interviews.map((interview, index) => (
              <div key={index} className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h3 className="font-semibold text-indigo-700">{interview.company}</h3>
                <p className="text-purple-600">{interview.date}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm">{interview.status}</span>
              </div>
            ))}
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">View Interviews</button>
          </div>

          {/* Exam Results Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 relative pb-16 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">Exam Results</h2>
              <FaChartBar className="text-purple-600" />
            </div>
            {dummyData.examResults.map((result, index) => (
              <div key={index} className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h3 className="font-semibold text-indigo-700">{result.subject}</h3>
                <div className="flex justify-between mt-2">
                  <span className="text-purple-600">Score: {result.score}</span>
                  <span className="text-indigo-600 font-semibold">Grade: {result.grade}</span>
                </div>
              </div>
            ))}
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">View All Results</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
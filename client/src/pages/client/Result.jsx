import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  MdPerson,
  MdDescription,
  MdSchedule,
  MdAccessTime,
  MdFormatListNumbered,
  MdCheckCircle,
  MdCancel,
  MdStar,
  MdStarBorder,
  MdScore,
  MdThumbUp,
  MdThumbDown,
  MdDownload,
  MdShare,
  MdAutorenew,
  MdArrowBack,
  MdSearch,
  MdFilterList,
  MdInbox,
} from "react-icons/md";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Importing Some Global state package
import { useAuth } from "../../store/auth";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";

const QuestionPaperResult = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API}/api/exam/get/result/${user?._id}/${params?.paperkey}`,
          {
            headers: {
              Authorization: authorizationToken,
            },
            withCredentials: true,
            credentials: "include",
          }
        );
        if (response.status === 200) {
          //   setData(response.data);
          console.log(response.data);
          setResultData(response.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error Occurred While Getting Results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [API]);



  const totalPoints = resultData?.questions?.reduce(
    (sum, question) => sum + question?.points,
    0
  );
  const maxPoints = resultData?.totalPoints;
  const passingThreshold = maxPoints * 0.4;

  const chartData = {
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        label: "Questions Distribution",
        data: [
          resultData?.questions?.filter((q) => q.isCorrect).length,
          resultData?.questions?.filter((q) => !q.isCorrect).length
        ],
        backgroundColor: ["#4CAF50", "#FF4C4C"]
      }
    ]
  };

  const filteredQuestions = resultData?.questions?.filter(
    (question) =>
      question?.question?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterType === "all" ||
        (filterType === "correct" && question.isCorrect) ||
        (filterType === "incorrect" && !question.isCorrect))
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Function to format the time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
    return date.toLocaleTimeString("en-US", options);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFB]">
        <MdAutorenew className="animate-spin text-6xl text-primary" />
      </div>
    );
  }
  // if (!filteredQuestions.length) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-background">
  //       <MdInbox className="text-6xl text-muted-foreground mb-4" />
  //       <p className="text-xl text-muted-foreground">No result found</p>
  //     </div>
  //   );
  // }
  return (
    <div className="min-h-screen bg-[#FAFAFB] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[28px] font-semibold text-[#7209B7]">Question Paper Result</h1>
          <div className="flex gap-4 max-md:flex-col">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#F72585] text-[#FFFFFF] rounded hover:opacity-90 transition-opacity">
              <MdDownload /> Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F1F3] text-[#7209B7] rounded hover:opacity-90 transition-opacity">
              <MdShare /> Share
            </button>
            <Link to={`/user/dashboard`}>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded hover:bg-[#F0F1F3] transition-colors">
                <MdArrowBack /> Back
              </button>
            </Link>

          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFFFFF] p-4 rounded shadow-sm flex items-center gap-3">
            <MdPerson className="text-2xl text-[#F72585]" />
            <div>
              <p className="text-sm text-[#3A0CA3]">Student Name</p>
              <p className="font-semibold">{user?.name}</p>
            </div>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded shadow-sm flex items-center gap-3">
            <MdDescription className="text-2xl text-[#F72585]" />
            <div>
              <p className="text-sm text-[#3A0CA3]">Paper Title</p>
              <p className="font-semibold">{resultData?.title}</p>
            </div>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded shadow-sm flex items-center gap-3">
            <MdSchedule className="text-2xl text-[#F72585]" />
            <div>
              <p className="text-sm text-[#3A0CA3]">Start Time</p>
              <p className="font-semibold">{resultData?.startTime && formatDate(resultData.startTime)} {resultData?.startTime && formatTime(resultData.startTime)} </p>
            </div>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded shadow-sm flex items-center gap-3">
            <MdAccessTime className="text-2xl text-[#F72585]" />
            <div>
              <p className="text-sm text-[#3A0CA3]">End Time</p>
              <p className="font-semibold">{resultData?.endTime && formatDate(resultData.endTime)} {resultData?.endTime && formatTime(resultData.endTime)} </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A0CA3]" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded focus:outline-none focus:ring-2 focus:ring-[#F72585]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-[#E0E0E0] rounded focus:outline-none focus:ring-2 focus:ring-[#F72585]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Questions</option>
              <option value="correct">Correct Only</option>
              <option value="incorrect">Incorrect Only</option>
            </select>
          </div>

          <div className="hidden md:block">
            <table className="w-full border-collapse">
              <thead className="bg-[#F0F1F3]">
                <tr>
                  <th className="p-4 text-left w-12">No.</th>
                  <th className="p-4 text-left w-2/5">Question</th>
                  <th className="p-4 text-left w-1/4">Your Answer</th>
                  <th className="p-4 text-left w-1/6">Result</th>
                  <th className="p-4 text-left w-1/6">Points</th>
                </tr>
              </thead>
              <tbody>
                {(filteredQuestions.length > 0) ? (filteredQuestions?.map((question, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#F0F1F3]"}
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4 whitespace-pre-wrap text-sm">{question.question}</td>
                    <td className="p-4">{question.userAnswer}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded ${question.isCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {question.isCorrect ? (
                          <MdCheckCircle className="text-green-600" />
                        ) : (
                          <MdCancel className="text-red-600" />
                        )}
                        {question.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-1">
                      {question.points}
                      <MdStar className="text-chart-4" />
                    </td>
                  </tr>
                ))) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <MdInbox className="text-6xl text-gray-400 mb-4" />
                        <p className="text-xl text-gray-500">No results found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredQuestions?.map((question, index) => (
              <div key={index} className="bg-[#FFFFFF] p-4 rounded shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold">Question {index}</span>
                    <p className="text-sm mt-1">{question?.question}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded ${question?.isCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {question?.isCorrect ? (
                      <MdCheckCircle className="text-green-600" />
                    ) : (
                      <MdCancel className="text-red-600" />
                    )}
                    {question?.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <div className="text-sm">
                  <p>
                    <span className="text-[#3A0CA3]">Your Answer:</span>{" "}
                    {question?.userAnswer}
                  </p>
                  <p className="flex items-center gap-1 mt-1">
                    <span className="text-[#3A0CA3]">Points:</span>{" "}
                    {question?.points}
                    <MdStar className="text-chart-4" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8 overflow-x-auto">
          <div className="bg-[#FFFFFF] p-6 rounded shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Score Summary</h2>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MdScore className="text-2xl text-[#F72585]" />
                <span className="text-xl font-bold">
                  {totalPoints} / {maxPoints}
                </span>
              </div>
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded ${totalPoints >= passingThreshold
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}
              >
                {totalPoints >= passingThreshold ? (
                  <MdThumbUp className="text-green-600" />
                ) : (
                  <MdThumbDown className="text-red-600" />
                )}
                {totalPoints >= passingThreshold ? "Pass" : "Fail"}
              </div>
            </div>
            <div className="h-60">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom"
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="bg-[#FFFFFF] p-6 rounded shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Time Statistics</h2>
            <div className="space-y-4">
              {resultData?.questions.map((question, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-[#F0F1F3] rounded"
                >
                  <span>Question {index + 1}</span>
                  <span className="font-semibold">{question?.timing && formatTime(question.timing)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperResult;
import React, { useEffect, useState } from "react";
import {
  MdAccessTime,
  MdCheckCircle,
  MdCancel,
  MdImage,
  MdEdit,
  MdDelete,
  MdInfoOutline,
  MdTimer,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import axios from "axios";
import { useAuth } from "../../store/auth";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { IoArrowBackCircleSharp } from "react-icons/io5";

const ViewQuestionPaper = () => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
  const questionsPerPage = 5;
  const params = useParams();
  const [examData, setExamData] = useState(null);


  useEffect(() => {
    const fetchPaper = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API}/api/exam/view/exam/${params.examId}/${params.title}/${params.paperkey}`,
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
          console.log(response.data.data);
          setExamData(response.data.data);
        }
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, []);



  const toggleQuestion = (id) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[28px] font-semibold text-[#3A0CA3]">
            View Question Paper
          </h1>
          <div className="flex gap-4">
            <Link to={`/admin/dashboard/exam`}>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#F72585] text-white rounded-md hover:bg-opacity-90 transition-all">
                <IoArrowBackCircleSharp size={20} />
                Go Back
              </button>
            </Link>
          </div>
        </div>

        {/* Exam Details */}
        <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#3A0CA3] mb-4">
                {examData?.title}
              </h2>
              <div className="flex items-center gap-2 text-[#3A0CA3]">
                <MdAccessTime size={20} />
                <span>
                  {formatDate(examData?.startTime)} -{" "}
                  {formatDate(examData?.endTime)}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              {examData?.isQuiz && (
                <div className="flex items-center gap-1 text-[#3A0CA3]">
                  <MdInfoOutline size={20} />
                  <span>Quiz</span>
                </div>
              )}
              {examData?.isFastQuiz && (
                <div className="flex items-center gap-1 text-[#F72585]">
                  <MdTimer size={20} />
                  <span>Fast Quiz</span>
                </div>
              )}
              {examData?.isPublished ? (
                <div className="flex items-center gap-1 text-[#4CAF50]">
                  <MdCheckCircle size={20} />
                  <span>Published</span>
                </div>
              ):(
                <div className="flex items-center gap-1 text-yellow-600">
                  <MdCheckCircle size={20} />
                  <span>Draft</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {examData?.questions?.map((question, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] rounded-lg shadow-sm overflow-hidden"
            >
              <div
                className="p-4 flex justify-between items-start cursor-pointer hover:bg-[#F0F1F3] transition-all"
                onClick={() => toggleQuestion(question._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">Q{index + 1}.</span>
                    <p className="text-[#3A0CA3] whitespace-pre text-wrap">
                      {question.questionText}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm text-[#3A0CA3]">
                    <span className="flex items-center gap-1">
                      <MdAccessTime size={16} />
                      {question?.timeLimit} sec
                    </span>
                    <span>Max Points: {question.maxPoint}</span>
                    {question.image !== null && (
                      <span className="flex items-center gap-1">
                        <MdImage size={16} />
                        Image attached
                      </span>
                    )}
                  </div>
                </div>
                {expandedQuestion === question._id ? (
                  <MdExpandLess size={24} className="text-[#3A0CA3]" />
                ) : (
                  <MdExpandMore size={24} className="text-[#3A0CA3]" />
                )}
              </div>

              {expandedQuestion === question._id && (
                <div className="p-4 border-t border-[#E0E0E0]">
                  {question?.image !== null && (
                    <img
                      src={`${API}${question.image}`}
                      alt="Question"
                      className="w-full h-auto max-w-md object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#F0F1F3] transition-all"
                      >
                        {option?.isCorrect ? (
                          <MdCheckCircle size={20} className="text-[#4CAF50]" />
                        ) : (
                          <MdCancel size={20} className="text-[#FF4C4C]" />
                        )}
                        <span>{option?.optionText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ViewQuestionPaper;

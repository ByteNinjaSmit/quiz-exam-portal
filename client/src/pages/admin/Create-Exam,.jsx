import React, { useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaImage,
  FaGripVertical,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestion,
  FaEdit,
  FaSave,
  FaFileAlt,
  FaPaperPlane,
  FaDraft2Digital,
  FaRegClock,
  FaLock,
  FaStar,
} from "react-icons/fa";
import { IoCalendarOutline, IoChevronBackCircle } from "react-icons/io5";
// Importing axios from packgaes
import axios from "axios";

// Global State
import { useAuth } from "../../store/auth";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const CreateExam = () => {
  const { API, authorizationToken } = useAuth();
  const navigate = useNavigate();
  const [examData, setExamData] = useState({
    title: "",
    classYear: "",
    startTime: "",
    endTime: "",
    paperKey: "",
    questions: [],
  });

  const [showPaperKey, setShowPaperKey] = useState(false);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [isFastQuiz, setIsFastQuiz] = useState(false);
  const [isQuiz, setIsQuiz] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [progress, setProgress] = useState(0); // State to track upload progress
  const [showQuestionEdit, setShowQuestionEdit] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    timeLimit: "",
    image: null,
    options: [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
  });
  const [editCurrentQuestion, setEditCurrentQuestion] = useState({
    questionText: "",
    timeLimit: "",
    image: null,
    options: [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
  });
  const [editQuestionIndex, setEditQuestionIndex] = useState(0);

  // For Image Resizing States


  const handleAddQuestion = () => {
    setShowQuestionEditor(true);
  };

  const handleEditQuestion = (index) => {
    const questionToEdit = examData.questions[index]; // Get the selected question
    setEditQuestionIndex(index);
    setEditCurrentQuestion(questionToEdit); // Set the current question state
    setShowQuestionEdit(true); // Open the edit modal
  };

  const handleAddOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { optionText: "", isCorrect: false }],
    }));
  };
  const handleEditAddOption = () => {
    setEditCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { optionText: "", isCorrect: false }],
    }));
  };

  const handleRemoveOption = (index) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };
  const handleEditRemoveOption = (index) => {
    setEditCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSaveQuestion = () => {
    setExamData((prev) => ({
      ...prev,
      questions: [...prev.questions, currentQuestion],
    }));
    setShowQuestionEditor(false);
    setCurrentQuestion({
      questionText: "",
      timeLimit: "",
      image: null,
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
    });
  };

  //  Handling edited Question
  const handleSaveEditedQuestion = () => {
    const updatedQuestions = [...examData.questions];

    updatedQuestions[editQuestionIndex] = editCurrentQuestion;

    setExamData((prevData) => ({
      ...prevData,
      questions: updatedQuestions,
    }));
    setShowQuestionEdit(false);
    toast.success("Question updated successfully!");
    setEditCurrentQuestion({
      questionText: "",
      timeLimit: "",
      image: null,
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
    });
    setEditQuestionIndex(null);
  };

  function convertToISTAndFormatForMongo(data) {
    // Step 1: Create a Date object from the input time (assuming it's in UTC)
    if (!data) {
      return null;
    }
    const examStartTimeUTC = new Date(data);

    // Step 2: Convert to IST by adding UTC+5:30
    const examStartTimeIST = new Date(
      examStartTimeUTC.getTime() + (5 * 60 + 30) * 60000
    );

    // Step 3: Format the date in ISO string format to store in MongoDB
    const formattedDateForMongo =
      examStartTimeIST.toISOString().slice(0, 19) + "+05:30";

    return formattedDateForMongo;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      // Append non-file fields
      formData.append("isQuiz", isQuiz);
      formData.append("isFastQuiz", isFastQuiz);
      formData.append("isPublished", isPublished=true);
      formData.append("classyear", examData.classYear);
      formData.append(
        "startTime",
        convertToISTAndFormatForMongo(examData.startTime)
      );
      formData.append(
        "endTime",
        convertToISTAndFormatForMongo(examData.endTime)
      );
      formData.append("paperKey", examData.paperKey);
      formData.append("title", examData.title);

      // Append questions as a JSON string
      formData.append("questions", JSON.stringify(examData.questions));

      // Append file uploads (if any)
      examData.questions.forEach((question, index) => {
        if (question.image && question.image instanceof File) {
            formData.append('files', question.image); // Append each file
        }
    });

      const response = await axios.post(
        `${API}/api/exam/new-exam`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: authorizationToken,
          },
          withCredentials: true, // Ensures cookies are sent with the request (if needed)
          credentials: "include",
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentage); // Update progress state
          },
        }
      );
      const data = await response.data;
      if (response.status !== 201) {
        toast.error(data.message);
        setProgress(0);
      }
      if (response.status === 201) {
        toast.success(data.message);
        setProgress(0);
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setProgress(0);
      console.error(error);
      toast.error("An error occurred during the exam creation.");
    }
  };

  // handeling save as draft
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      // Append non-file fields
      formData.append("isQuiz", isQuiz);
      formData.append("isFastQuiz", isFastQuiz);
      formData.append("isPublished", isPublished=false);
      formData.append("classyear", examData.classYear);
      formData.append(
        "startTime",
        convertToISTAndFormatForMongo(examData.startTime)
      );
      formData.append(
        "endTime",
        convertToISTAndFormatForMongo(examData.endTime)
      );
      formData.append("paperKey", examData.paperKey);
      formData.append("title", examData.title);

      // Append questions as a JSON string
      formData.append("questions", JSON.stringify(examData.questions));

      // Append file uploads (if any)
      examData.questions.forEach((question, index) => {
        if (question.image && question.image instanceof File) {
            formData.append('files', question.image); // Append each file
        }
    });

      const response = await axios.post(
        `${API}/api/exam/new-exam`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: authorizationToken,
          },
          withCredentials: true, // Ensures cookies are sent with the request (if needed)
          credentials: "include",
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentage); // Update progress state
          },
        }
      );
      const data = await response.data;
      if (response.status !== 201) {
        toast.error(data.message);
        setProgress(0);
      }
      if (response.status === 201) {
        toast.success(data.message);
        setProgress(0);
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setProgress(0);
      console.error(error);
      toast.error("An error occurred during the exam creation.");
    }
  };

  // Question Delete Function
  const handleDeleteQuestion = (questionIndex) => {
    // Create a new array excluding the question to be deleted
    const updatedQuestions = examData.questions.filter(
      (_, index) => index !== questionIndex
    );

    // Update the state with the new array
    setExamData((prevData) => ({
      ...prevData,
      questions: updatedQuestions,
    }));
    toast.success(`Question ${questionIndex + 1} deleted successfully!`);
  };
  console.log(examData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-indigo-800 mb-8 flex items-center">
          <FaFileAlt className="mr-4" />
          Create New Exam
        </h1>

        <div className="space-y-8 mb-8">
          <div>
            <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
              <FaEdit className="mr-2" />
              Exam Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter exam title"
              value={examData.title}
              onChange={(e) =>
                setExamData({ ...examData, title: e.target.value })
              }
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                <FaQuestion className="mr-2" />
                Class Year
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={examData.classYear}
                onChange={(e) =>
                  setExamData({ ...examData, classYear: e.target.value })
                }
              >
                <option value="">Select Class Year</option>
                <option value="ALL">ALL</option>
                <option value="FY">FY</option>
                <option value="SY">SY</option>
                <option value="TY">TY</option>
                <option value="B.Tech">B.Tech</option>
              </select>
            </div>

            <div>
              <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                <FaLock className="mr-2" />
                Paper Key
              </label>
              <div className="relative">
                <input
                  type={showPaperKey ? "text" : "password"}
                  className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter paper key"
                  value={examData.paperKey}
                  onChange={(e) =>
                    setExamData({ ...examData, paperKey: e.target.value })
                  }
                />
                <button
                  onClick={() => setShowPaperKey(!showPaperKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  {showPaperKey ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                <FaRegClock className="mr-2" />
                Start Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={examData.startTime}
                onChange={(e) =>
                  setExamData({ ...examData, startTime: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                <FaRegClock className="mr-2" />
                End Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={examData.endTime}
                onChange={(e) =>
                  setExamData({ ...examData, endTime: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Make Here Two Check tick boxe for isQuiz and another for isFastQuiz */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="flex items-center relative group">
            <input
              type="checkbox"
              id="isQuiz"
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              onChange={(e) => setIsQuiz(e.target.checked)}
            />
            <label
              htmlFor="isQuiz"
              className="ml-2 text-sm font-medium text-indigo-700 cursor-pointer"
            >
              Is Quiz
            </label>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden w-max rounded-md bg-gray-800 text-white text-xs p-2 shadow-lg group-hover:block ">
              Select this if the activity is a regular quiz. In this to submit
              answer separate button
            </div>
          </div>

          <div className="flex items-center relative group">
            <input
              type="checkbox"
              id="isFastQuiz"
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              onChange={(e) => setIsFastQuiz(e.target.checked)}
            />
            <label
              htmlFor="isFastQuiz"
              className="ml-2 text-sm font-medium text-indigo-700 cursor-pointer"
            >
              Is Fast Quiz
            </label>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden w-max rounded-md bg-gray-800 text-white text-xs p-2 shadow-lg group-hover:block">
              Select this for a fast-paced quiz mode. In That On Options once
              click submit answer
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-indigo-800 flex items-center">
              Questions
              <FaQuestion className="mr-3" />
            </h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <FaPlus className="mr-2" /> Add Question
            </button>
          </div>

          <div className="space-y-6">
            {examData.questions.map((question, index) => (
              <div
                key={index}
                className="border-2 border-indigo-100 rounded-xl p-6 bg-white hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FaGripVertical className="text-indigo-400 mr-3" />
                    <span className="font-medium text-indigo-700">
                      Question {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <FaClock className="text-indigo-500" />
                    <span className="text-indigo-600">
                      {question.timeLimit} sec
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{question.questionText}</p>
                {/* Set Proper Design Style Using TailwindCss show properly */}
                {question.image && (
                  <div className="my-4">
                    <img
                      src={URL.createObjectURL(question.image)}
                      alt="Question Illustration"
                      className="w-full h-auto rounded-lg border p-6 border-gray-200 shadow-md"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-3">
                      {option.isCorrect ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaTimesCircle className="text-red-500" />
                      )}
                      <span
                        className={`${option.isCorrect ? "text-green-700" : "text-gray-700"
                          }`}
                      >
                        {option.optionText}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Add here with react icon edit and delete buttons*/}
                <div className="flex items-center justify-end mt-1 space-x-4">
                  <button
                    className="flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => handleEditQuestion(index)} // Replace with your edit logic
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </button>
                  <button
                    className="flex items-center px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => handleDeleteQuestion(index)} // Replace with your delete logic
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showQuestionEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold text-indigo-800 mb-6 flex items-center">
                <FaPlus className="mr-3" />
                Add Question
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                    <FaEdit className="mr-2" />
                    Question Text
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    rows="3"
                    value={currentQuestion.questionText}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        questionText: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                      <FaClock className="mr-2" />
                      Time Limit ( Seconds )
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={currentQuestion.timeLimit}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          timeLimit: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                      <FaImage className="mr-2" />
                      Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple={false}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCurrentQuestion({
                              ...currentQuestion,
                              image: file,
                            });
                          };
                          reader.readAsDataURL(file); // Converts file to base64 string for preview
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    {currentQuestion.image && (
                      <div>
                        <img
                          src={URL.createObjectURL(currentQuestion.image)} // Create preview from the stored image file
                          alt="Uploaded preview"
                          className="w-32 h-32 object-cover mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                      <FaStar className="mr-2" />
                      Max Points ( 0-1000 )
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={currentQuestion.maxPoint}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          maxPoint: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-indigo-700 text-sm font-semibold flex items-center">
                    <FaCheckCircle className="mr-2" />
                    Options
                  </label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index].isCorrect = e.target.checked;
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions,
                          });
                        }}
                        className="w-5 h-5 text-indigo-500 rounded focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index].optionText = e.target.value;
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions,
                          });
                        }}
                        className="flex-1 px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder={`Option ${index + 1}`}
                      />
                      {index > 1 && (
                        <button
                          onClick={() => handleRemoveOption(index)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddOption}
                    className="text-indigo-500 hover:text-indigo-600 font-medium flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Option
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowQuestionEditor(false)}
                  className="px-6 py-3 border-2 border-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all flex items-center"
                >
                  <FaTimesCircle className="mr-2" /> Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center"
                >
                  <FaSave className="mr-2" /> Save Question
                </button>
              </div>
            </div>
          </div>
        )}

        {showQuestionEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold text-indigo-800 mb-6 flex items-center">
                <FaPlus className="mr-3" />
                Edit Question
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                    <FaEdit className="mr-2" />
                    Question Text
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    rows="3"
                    value={editCurrentQuestion.questionText}
                    onChange={(e) =>
                      setEditCurrentQuestion({
                        ...editCurrentQuestion,
                        questionText: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                      <FaClock className="mr-2" />
                      Time Limit ( Seconds )
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={editCurrentQuestion.timeLimit}
                      onChange={(e) =>
                        setEditCurrentQuestion({
                          ...editCurrentQuestion,
                          timeLimit: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                      <FaImage className="mr-2" />
                      Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple={false}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditCurrentQuestion({
                              ...editCurrentQuestion,
                              image: file,
                            });
                          };
                          reader.readAsDataURL(file); // Converts file to base64 string for preview
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    {editCurrentQuestion.image && (
                      <div>
                        <img
                          src={URL.createObjectURL(editCurrentQuestion.image)} // Create preview from the stored image file
                          alt="Uploaded preview"
                          className="w-32 h-32 object-cover mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                      <FaStar className="mr-2" />
                      Max Points ( 0-1000 )
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={editCurrentQuestion.maxPoint}
                      onChange={(e) =>
                        setEditCurrentQuestion({
                          ...editCurrentQuestion,
                          maxPoint: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-indigo-700 text-sm font-semibold flex items-center">
                    <FaCheckCircle className="mr-2" />
                    Options
                  </label>
                  {editCurrentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => {
                          const newOptions = [...editCurrentQuestion.options];
                          newOptions[index].isCorrect = e.target.checked;
                          setEditCurrentQuestion({
                            ...editCurrentQuestion,
                            options: newOptions,
                          });
                        }}
                        className="w-5 h-5 text-indigo-500 rounded focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) => {
                          const newOptions = [...editCurrentQuestion.options];
                          newOptions[index].optionText = e.target.value;
                          setEditCurrentQuestion({
                            ...editCurrentQuestion,
                            options: newOptions,
                          });
                        }}
                        className="flex-1 px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder={`Option ${index + 1}`}
                      />
                      {index > 1 && (
                        <button
                          onClick={() => handleEditRemoveOption(index)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleEditAddOption}
                    className="text-indigo-500 hover:text-indigo-600 font-medium flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Option
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowQuestionEdit(false)}
                  className="px-6 py-3 border-2 border-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all flex items-center"
                >
                  <FaTimesCircle className="mr-2" /> Cancel
                </button>
                <button
                  onClick={handleSaveEditedQuestion}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center"
                >
                  <FaSave className="mr-2" /> Save Question
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Link to={`/admin/dashboard/exam`}>
            <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center">
              <IoChevronBackCircle className="mr-2" /> Go Back
            </button>
          </Link>

          {/* <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <FaEye className="mr-2" /> Preview Exam
          </button> */}
          <button
            className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center"
            onClick={(e) => {
              setIsPublished(false);
              handleSaveDraft(e);
            }}
          >
            <FaDraft2Digital className="mr-2" /> Save as Draft
          </button>
          <button
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center"
            onClick={(e) => {
              setIsPublished(true);
              handleSubmit(e);
            }}
          >
            <FaPaperPlane className="mr-2" /> Publish Exam
          </button>
        </div>
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExam;

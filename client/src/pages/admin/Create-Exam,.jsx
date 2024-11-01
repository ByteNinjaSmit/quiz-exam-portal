import React, { useState } from "react";
import { FaPlus, FaTrash, FaEye, FaEyeSlash, FaClock, FaImage, FaGripVertical, FaCheckCircle, FaTimesCircle, FaQuestion, FaEdit, FaSave, FaFileAlt, FaPaperPlane, FaDraft2Digital, FaRegClock, FaLock } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";

const CreateExam = () => {
  const [examData, setExamData] = useState({
    title: "",
    classYear: "",
    startTime: "",
    endTime: "",
    paperKey: "",
    questions: []
  });

  const [showPaperKey, setShowPaperKey] = useState(false);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    timeLimit: "",
    image: null,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ]
  });

  const handleAddQuestion = () => {
    setShowQuestionEditor(true);
  };

  const handleAddOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }]
    }));
  };

  const handleRemoveOption = (index) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSaveQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, currentQuestion]
    }));
    setShowQuestionEditor(false);
    setCurrentQuestion({
      text: "",
      timeLimit: "",
      image: null,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ]
    });
  };

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
              onChange={(e) => setExamData({ ...examData, title: e.target.value })}
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
                onChange={(e) => setExamData({ ...examData, classYear: e.target.value })}
              >
                <option value="">Select Class Year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
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
                  onChange={(e) => setExamData({ ...examData, paperKey: e.target.value })}
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
                onChange={(e) => setExamData({ ...examData, startTime: e.target.value })}
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
                onChange={(e) => setExamData({ ...examData, endTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-indigo-800 flex items-center">
              <FaQuestion className="mr-3" />
              Questions
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
              <div key={index} className="border-2 border-indigo-100 rounded-xl p-6 bg-white hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FaGripVertical className="text-indigo-400 mr-3" />
                    <span className="font-medium text-indigo-700">Question {index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <FaClock className="text-indigo-500" />
                    <span className="text-indigo-600">{question.timeLimit} min</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{question.text}</p>
                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-3">
                      {option.isCorrect ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaTimesCircle className="text-red-500" />
                      )}
                      <span className={`${option.isCorrect ? "text-green-700" : "text-gray-700"}`}>
                        {option.text}
                      </span>
                    </div>
                  ))}
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
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-indigo-700 text-sm font-semibold mb-2 flex items-center">
                      <FaClock className="mr-2" />
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={currentQuestion.timeLimit}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: e.target.value })}
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
                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, image: e.target.files[0] })}
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
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        className="w-5 h-5 text-indigo-500 rounded focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index].text = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
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

        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <FaEye className="mr-2" /> Preview Exam
          </button>
          <button className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center">
            <FaDraft2Digital className="mr-2" /> Save as Draft
          </button>
          <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center">
            <FaPaperPlane className="mr-2" /> Publish Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;

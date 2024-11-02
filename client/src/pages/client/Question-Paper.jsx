import React, { useState, useEffect,useRef } from "react";
import { FaExpandAlt, FaCompress } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { BiTimer } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from 'react-router-dom';
import { useAuth } from "../../store/auth";
import io from 'socket.io-client';

const ExamInterface = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isOptionLocked, setIsOptionLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isTabActive, setIsTabActive] = useState(true);
    const [timer, setTimer] = useState(30);
    const [isLocked, setIsLocked] = useState(false);

    // Socket Io states
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(null); // null = no answer yet
    const [remainingTime, setRemainingTime] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isExamEnded, setIsExamEnded] = useState(false); // Track if the exam has ended
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Getting Global state
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3

    // Create a ref to hold the socket connection
    const socketRef = useRef();

    // Getting Parameter 
    const { id, title, paperKey } = useParams();

    // Creating Post Function To hit server for start exam
    useEffect(() => {
        const makePostFunction = async () => {
            setIsLoading(true);
            setError(null); // Reset error state before making request
            try {
                const response = await fetch(`${API}/api/question/start-exam`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: authorizationToken,
                    },
                    body: JSON.stringify({
                        title,
                        paperKey,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text(); // Get the raw response text
                console.log('Raw response:', text); //
                // Handle success response here (e.g., updating state)
            } catch (error) {
                console.error('Error occurred while making POST request:', error);
                setError(error.message); // Set error message to state
            } finally {
                setIsLoading(false);
            }
        };

        makePostFunction();
    }, [title, paperKey]); // Include title in dependency array

    // Socket Connection
    useEffect(() => {
        socketRef.current = io(API);
        socketRef.current.emit("loadExam", { title, paperKey });// Join the socket room based on paper key

        socketRef.current.on('question', (data) => {
            if (!isExamEnded) { // Prevent updating question data if exam has ended
                setCurrentQuestion(data.question);
                setQuestionIndex(data.questionIndex);
                setRemainingTime(data.remainingTime);
                setIsAnswerCorrect(null); // Reset answer state on new question

                // Reset the option selection state for the new question
                setIsOptionLocked(false); // Unlock options for the new question
                setSelectedOption(null); // Reset the selected option
            }
        });

        socketRef.current.on('examEnd', () => {
            setIsExamEnded(true); // Set exam end state
            setCurrentQuestion(null);
            setQuestionIndex(null);
            setRemainingTime(null); // Clear the current question
        });

        return () => {
            socketRef.current.off('question');
            socketRef.current.off('examEnd');
            // socketRef.current.disconnect();
        };
    }, [isExamEnded, title, paperKey]);




    // Handle tab visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setShowWarning(true);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);


    // Main exam countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    // Handle full screen toggle
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    // Handle option selection and display feedback color based on answer correctness
    const handleOptionSelect = (answer) => {
        if (!isOptionLocked && currentQuestion) {
            const isCorrect = currentQuestion.options.some(option => option.optionText === answer && option.isCorrect);
            // const isCorrect = optionIndex === examQuestions[currentQuestion].correctAnswer;
            setIsAnswerCorrect(isCorrect);
            setSelectedOption(answer);

            // Lock options until timer reaches 0
            setIsOptionLocked(true);
        }
    };

    // When new Question come 
    //     setIsOptionLocked(false); // Unlock options for the new question
    //     setIsAnswerCorrect(null);
    //     setSelectedOption(null);
    // const handleNextQuestion = () => {
    //     setIsOptionLocked(false); // Unlock options for the new question
    //     setIsAnswerCorrect(null);
    //     setSelectedOption(null);

    // };


    useEffect(() => {
        if (!isExamEnded && remainingTime > 0) {
            const countdown = setInterval(() => {
                setRemainingTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(countdown); // Stop countdown when time is up
                        // Handle time-out actions here if needed
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(countdown); // Clean up interval on unmount or if exam ends
        }
    }, [isExamEnded, remainingTime]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(0);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (isExamEnded) {
        return <p>Exam ended</p>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
                        <div className="flex items-center justify-center text-red-500 mb-4">
                            <IoWarningOutline size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-center mb-4">
                            Tab Switching Detected!
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Please refrain from switching tabs during the exam. This incident has been recorded.
                        </p>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-blue-500 p-4 text-white flex justify-between items-center">
                    <div className="text-xl font-bold">Online Exam</div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-600 px-4 py-2 rounded-lg">
                            Time Left: {formatTime(timeLeft)}
                        </div>
                        <button
                            onClick={toggleFullScreen}
                            className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                        >
                            {isFullScreen ? <FaCompress size={20} /> : <FaExpandAlt size={20} />}
                        </button>
                    </div>
                </div>

                {/* Question Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-end space-x-2 text-indigo-600">
                            <BiTimer className="text-2xl" />
                            <span className="text-xl font-semibold">{formatTime(remainingTime)}s</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-4">
                            {/* Question {currentQuestion + 1} of {examQuestions.length} */}
                        </h2>

                        <p className="text-gray-700 text-lg mb-4">
                            {currentQuestion?.questionText}
                        </p>

                        {/* For Showing Image */}

                        {/* {examQuestions[currentQuestion]?.image && (
                            <img
                                src={`https://${examQuestions[currentQuestion].image}`}
                                alt="Question illustration"
                                className="w-full h-80 object-cover rounded-lg mb-6"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1516979187457-637abb4f9353";
                                }}
                            />
                        )} */}
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        {currentQuestion?.options?.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(option.optionText)}
                                disabled={isOptionLocked}
                                className={`w-full p-4 text-left rounded-lg transition-colors ${selectedOption === option.optionText
                                    ? isAnswerCorrect
                                        ? "bg-green-500 text-white"
                                        : "bg-red-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                                    } ${isOptionLocked && "cursor-not-allowed opacity-75"}`}
                            >
                                {option.optionText}
                            </button>
                        ))}
                    </div>

                    {/* Question Time Left Bar */}
                    <p className="mt-5 text-xs">Question Time Left:</p>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 transition-all duration-1000"
                            style={{ width: `${(remainingTime / currentQuestion.timeLimit) * 100}%` }}
                        ></div>
                    </div>
                    {/* Progress Bar */}
                    <p className="mt-5 text-xs">Exam Progress:</p>
                    {/* <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                            style={{
                                width: `${((currentQuestion + 1) / examQuestions.length) * 100}%`,
                            }}
                        ></div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default ExamInterface;

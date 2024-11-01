import React, { useState, useEffect } from "react";
import { FaExpandAlt, FaCompress } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { BiTimer } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

const ExamInterface = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isOptionLocked, setIsOptionLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isTabActive, setIsTabActive] = useState(true);
    const [timer, setTimer] = useState(30);
    const [isLocked, setIsLocked] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

    // Dummy exam data
    const examQuestions = [
        {
            id: 1,
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            image: "images.unsplash.com/photo-1502602898657-3e91760cbb34",
            correctAnswer: 2
        },
        {
            id: 2,
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            image: "images.unsplash.com/photo-1614728263952-84ea256f9679",
            correctAnswer: 1
        },
        {
            id: 3,
            question: "What is the largest mammal on Earth?",
            options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
            image: "images.unsplash.com/photo-1568430328012-21ed450453ea",
            correctAnswer: 1
        }
    ];

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

    // Timer countdown for question
    useEffect(() => {
        if (timer === 0) {
            handleNextQuestion();
        } else {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

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

    // Format time for display
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

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
    const handleOptionSelect = (optionIndex) => {
        if (!isOptionLocked) {
            const isCorrect = optionIndex === examQuestions[currentQuestion].correctAnswer;
            setIsAnswerCorrect(isCorrect);
            setSelectedOption(optionIndex);
            
            // Lock options until timer reaches 0
            setIsOptionLocked(true);
        }
    };
    
    const handleNextQuestion = () => {
        setIsOptionLocked(false); // Unlock options for the new question
        setIsAnswerCorrect(null);
        setSelectedOption(null);
    
        if (currentQuestion < examQuestions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            setTimer(30);
        }
    };
    

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
                            <span className="text-xl font-semibold">{timer}s</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-4">
                            Question {currentQuestion + 1} of {examQuestions.length}
                        </h2>

                        <p className="text-gray-700 text-lg mb-4">
                            {examQuestions[currentQuestion].question}
                        </p>
                        {examQuestions[currentQuestion].image && (
                            <img
                                src={`https://${examQuestions[currentQuestion].image}`}
                                alt="Question illustration"
                                className="w-full h-80 object-cover rounded-lg mb-6"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1516979187457-637abb4f9353";
                                }}
                            />
                        )}
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        {examQuestions[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                disabled={isOptionLocked}
                                className={`w-full p-4 text-left rounded-lg transition-colors ${
                                    selectedOption === index
                                        ? isAnswerCorrect
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                        : "bg-gray-100 hover:bg-gray-200"
                                } ${isOptionLocked && "cursor-not-allowed opacity-75"}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {/* Question Time Left Bar */}
                    <p className="mt-5 text-xs">Question Time Left:</p>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 transition-all duration-1000"
                            style={{ width: `${(timer / 30) * 100}%` }}
                        ></div>
                    </div>
                    {/* Progress Bar */}
                    <p className="mt-5 text-xs">Exam Progress:</p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                            style={{
                                width: `${((currentQuestion + 1) / examQuestions.length) * 100}%`,
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamInterface;

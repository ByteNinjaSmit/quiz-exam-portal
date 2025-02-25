import React, { useState, useEffect, useRef } from "react";
import { FaExpandAlt, FaCompress } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { BiTimer } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import io from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";
const ExamInterface = () => {
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState(null);
  const [isOptionLocked, setIsOptionLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [timer, setTimer] = useState(30);
  const [isLocked, setIsLocked] = useState(false);

  //  Make State For Option Selection Manually for Store
  const [optionSelected, setOptionSelected] = useState(null);
  const [isSubmitActive, setIsSubmitActive] = useState(false);


  // For Is Cheated or Not with First And Second Warning
  const [isCheated, setIsCheated] = useState(false);


  // Socket Io states
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null); // null = no answer yet
  const [remainingTime, setRemainingTime] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isExamEnded, setIsExamEnded] = useState(false); // Track if the exam has ended
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Question Paper Data Store
  const [examData, setExamData] = useState(null);
  const [isStarting, setIsStarting] = useState(true);
  // Getting Global state
  const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3

  // Create a ref to hold the socket connection
  const socketRef = useRef();

  // Getting Parameter
  const { id, title, paperKey } = useParams();

  // if Paramter null or any value navigate to home
  if (!id || !title || !paperKey) {
    return <Navigate to="/" />;
  } else if (
    id === "undefined" ||
    title === "undefined" ||
    paperKey === "undefined"
  ) {
    return <Navigate to="/" />;
  }

  // Creating Post Function To hit server for start exam
  useEffect(() => {
    const makePostFunction = async () => {
      setIsLoading(true);
      setError(null); // Reset error state before making request
      try {
        const response = await fetch(`${API}/api/question/start-exam`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

        const data = await response.json(); // Get the raw response text
        setExamData(data);
        // Handle success response here (e.g., updating state)
      } catch (error) {
        console.error("Error occurred while making POST request:", error);
        setError(error.message); // Set error message to state
      } finally {
        setIsLoading(false);
      }
    };

    makePostFunction();
  }, [title, paperKey]); // Include title in dependency array

  useEffect(() => {
    const now = new Date();
    const examStartTime = new Date(examData?.startTime);

    if (now >= examStartTime) {
      setIsStarting(false); // Exam has started
    } else {
      setIsStarting(true); // Exam has not started yet
    }
  }, [examData?.startTime]);

  // Socket Connection
  useEffect(() => {
    if (!title || !paperKey) return;

    // Ensure socket initializes only once
    if (!socketRef.current) {
      socketRef.current = io(API, {
        reconnection: true, // Auto-reconnect enabled
        reconnectionAttempts: 10, // Max attempts
        reconnectionDelay: 3000, // Delay between attempts
        reconnectionDelayMax: 10000, // Max delay in ms
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected, requesting exam data...");
        socketRef.current.emit("loadExam", { title, paperKey });
      });

      socketRef.current.on("question", (data) => {
        if (!isExamEnded) {
          setCurrentQuestion(data.question);
          setQuestionIndex(data.questionIndex);
          setRemainingTime(data.remainingTime);
          setIsSubmitActive(false);
          setIsOptionLocked(false);
          setSelectedOption(null);
        }
      });

      socketRef.current.on("examEnd", () => {
        setIsExamEnded(true);
        setCurrentQuestion(null);
        setQuestionIndex(null);
        setRemainingTime(null);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected, attempting to reconnect...");
      });
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off("question");
        socketRef.current.off("examEnd");
        socketRef.current.disconnect();
        socketRef.current = null; // Reset ref to avoid stale socket instance
      }
    };
  }, [title, paperKey]); // ✅ Removed `isExamEnded` from dependencies


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



  // Handle CheatFunction
  const handleCheatFunction = async (e) => {
    e.preventDefault();

    const cheatData = {
      user: user._id, // Replace with the actual user ID from your application state
      paperKey: paperKey, // Replace with the actual paper key from your application state
    };

    try {
      const response = await axios.post(
        `${API}/api/exam/set/cheat`, // Endpoint URL
        cheatData,
        {
          headers: {
            Authorization: authorizationToken, // Replace with the actual token
            "Content-Type": "application/json",
          },
          withCredentials: true, // Ensures cookies are sent with the request (if needed)
          credentials: "include",
        }
      );

      // Handle success response
      if (response.status === 200 || response.status === 201) {
        GetIsCheated()
      } else {
        toast.error(response.data.message); // Display error message if not 200/201
      }

    } catch (error) {
      // Handle errors
      if (error.response) {
        toast.error(error.response.data.message || "An error occurred while submitting.");
      } else if (error.request) {
        toast.error("No response received from the server.");
      } else {
        toast.error("An error occurred while setting up the request.");
      }
    }
  };


  const GetIsCheated = async () => {
    try {
      // Assuming `user._id` and `paperKey` are available from your app state or context
      const userId = user._id;
      const PaperKey = paperKey;

      // Make GET request to check cheat status
      const response = await axios.get(
        `${API}/api/exam/cheat-status/${userId}/${PaperKey}`,
        {
          headers: {
            Authorization: authorizationToken, // Include the auth token
          },
          withCredentials: true, // Ensures cookies are sent with the request (if needed)
          credentials: "include",

        }
      );

      // Handle success response
      if (response.status === 200) {
        const { isCheat } = response.data;

        // If isCheat is true, update state and navigate to dashboard
        if (isCheat) {
          setIsCheated(true);
          toast.warning("You Cheated Exam Go OUT");
          navigate("/user/dashboard"); // Navigate to dashboard
        } else {
          setIsCheated(false); // Set false if not cheated
        }
      } else {
        // Handle non-200 responses
        console.log(response.data.message);
      }
    } catch (error) {
      console.error(`Error occurred while getting cheat status: ${error}`);
      // Handle error: You can show a toast or any other user feedback
    }
  };
  useEffect(() => {
    GetIsCheated();
  }, []);

  // HANDLE FOR SUBMITING MANNUALY IF NOT FAST QUIZ
  const handleSubmitMannual = async (e) => {
    e.preventDefault();

    if (!examData.isFastQuiz && currentQuestion) {


      // console.log("Answer submitted:", selectedOption);
      // Additional submission logic here (e.g., saving points or answer)
      if (!isOptionLocked && currentQuestion) {
        const isCorrect = currentQuestion.options.some(
          (option) => option.optionText === selectedOption && option.isCorrect
        );
        setIsAnswerCorrect(isCorrect);
        let final_point = 0;
        if (isCorrect) {
          const defaultPoints = 1000; // default point for Mannual Quiz
          const pointsForCorrectAnswer =
            currentQuestion.maxPoint || defaultPoints;
          // console.log(`Answer is correct ${pointsForCorrectAnswer}`);
          final_point = pointsForCorrectAnswer;
        }
        if (!isCorrect) {
          const defaultPoints = 0; // default point for Mannual Quiz
          const pointsForIncorrectAnswer = defaultPoints;
          // console.log(`Answer is Incorrect ${pointsForIncorrectAnswer}`);
          final_point = pointsForIncorrectAnswer;
        }

        try {
          // Axios POST request to store the answer
          const response = await axios.post(
            `${API}/api/exam/set/result`,
            {
              question: currentQuestion.questionText, // Question text or ID
              answer: selectedOption, // Selected answer
              points: final_point, // Points earned
              paperKey: paperKey, // Paper key for identification
              user: user._id, // User ID
            },
            {
              headers: {
                Authorization: authorizationToken, // Replace 'userToken' with the token variable
                "Content-Type": "application/json", // Specify JSON content type
              },
              withCredentials: true, // Ensures cookies are sent with the request (if needed)
              credentials: "include",
            }
          );
          const data = response.data; // Directly access response data

          if (response.status !== 201) {
            toast.error(data.message || "An unexpected error occurred.");
          } else {
            toast.success(data.message || "Submission successful!");
            setIsSubmitActive(true);
            setIsOptionLocked(true); // Lock all options after submission
          }
        } catch (error) {
          // Handle errors
          if (error.response) {
            toast.error(error.response.data.message || "An error occurred while submitting.");
          } else if (error.request) {
            toast.error("No response received from the server.");
          } else {
            toast.error("An error occurred while setting up the request.");
          }
        }
      }
    }
  };

  // Handle option selection and display feedback color based on answer correctness
  const handleOptionSelect = async (answer) => {
    if (!examData.isFastQuiz) {
      setSelectedOption(answer); // Allow users to change their selection before submission
      setIsAnswerCorrect(false); // Reset correctness state
      setIsOptionLocked(false);
    }

    if (examData.isFastQuiz) {
      if (!isOptionLocked && currentQuestion) {
        const isCorrect = currentQuestion.options.some(
          (option) => option.optionText === answer && option.isCorrect
        );
        // const isCorrect = optionIndex === examQuestions[currentQuestion].correctAnswer;
        setIsAnswerCorrect(isCorrect);
        setSelectedOption(answer);
        // log points what he earned based on time and if wrong then set point to zero
        let earnedPoints = 0;
        if (isCorrect) {
          // Total time limit of the question
          const totalTimeLimit = currentQuestion.timeLimit; // e.g., 30 seconds
          const defaultPoints = 800; // Default points if currentQuestion.points is undefined
          const pointsForCorrectAnswer =
            currentQuestion.maxPoint || defaultPoints; // Points for the question

          // Calculate the earned points based on remaining time
          const timeSegments = 20; // Number of segments
          const segmentDuration = totalTimeLimit / timeSegments; // Duration of each segment
          const maxPointsPercent = 100; // Maximum percentage of points

          // Calculate the segment index based on remaining time
          const segmentIndex = Math.max(
            0,
            Math.floor(remainingTime / segmentDuration)
          );

          // Determine the percentage of points based on the segment index
          const percentagePoints = Math.min(
            maxPointsPercent,
            5 + segmentIndex * 5
          ); // Starting at 5% and increasing by 5% per segment

          // Calculate the earned points
          earnedPoints =
            (percentagePoints * pointsForCorrectAnswer) / maxPointsPercent;

          // Log or save the points earned
          // console.log(`Points earned: ${earnedPoints}`);
        }

        // Log or save the points earned
        // console.log(`Points earned: ${earnedPoints}`);
        // Lock options until timer reaches 0

        try {
          // Axios POST request to store the answer
          const response = await axios.post(
            `${API}/api/exam/set/result`,
            {
              question: currentQuestion.questionText, // Question text or ID
              answer: answer, // Selected answer
              points: earnedPoints, // Points earned
              paperKey: paperKey, // Paper key for identification
              user: user._id, // User ID
            },
            {
              headers: {
                Authorization: authorizationToken, // Replace 'userToken' with the token variable
                "Content-Type": "application/json", // Specify JSON content type
              },
              withCredentials: true, // Ensures cookies are sent with the request (if needed)
              credentials: "include",
            }
          );
          const data = response.data; // Directly access response data

          if (response.status !== 201) {
            toast.error(data.message || "An unexpected error occurred.");
          } else {
            toast.success(data.message || "Submission successful!");
            setIsOptionLocked(true); // Lock all options after submission
          }
        } catch (error) {
          // Handle errors
          if (error.response) {
            toast.error(error.response.data.message || "An error occurred while submitting.");
            setIsOptionLocked(true);
          } else if (error.request) {
            toast.error("No response received from the server.");
          } else {
            toast.error("An error occurred while setting up the request.");
          }
        }
      }
    }
  };

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
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Function to format the time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    return date.toLocaleTimeString("en-US", options);
  };

  // -----------------------
  // Cheating Logic
  // --------------------------


  // Detect Tab Switching
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
  // Block Right-click, Inspect Element, and Copying
  useEffect(() => {
    const disableRightClick = (event) => event.preventDefault();
    const disableDevTools = (event) => {
      if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && event.key === "I") || // Ctrl + Shift + I
        (event.ctrlKey && event.key === "u") // Ctrl + U (View Source)
      ) {
        event.preventDefault();
        setShowWarning(true);
      }
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableDevTools);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableDevTools);
    };
  }, []);

  // Disable Clipboard & Input Pasting
  useEffect(() => {
    const disablePaste = (event) => {
      event.preventDefault();
      setShowWarning(true);
    };

    document.addEventListener("paste", disablePaste);
    return () => {
      document.removeEventListener("paste", disablePaste);
    };
  }, []);

  // Disable All Keyboard Inputs (Detect Any Key Press)
  useEffect(() => {
    const blockAllKeys = (event) => {
      event.preventDefault();
      setShowWarning(true);
    };

    document.addEventListener("keydown", blockAllKeys);
    return () => {
      document.removeEventListener("keydown", blockAllKeys);
    };
  }, []);

  // Force Fullscreen on Load
  useEffect(() => {
    const enterFullScreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error("Fullscreen request failed", err);
        });
      }
    };

    enterFullScreen(); // Trigger fullscreen on component mount

    // Detect Fullscreen Exit & Force Re-entry
    const checkFullScreen = () => {
      if (!document.fullscreenElement) {
        setShowWarning(true);
        enterFullScreen(); // Re-enter fullscreen if exited
      }
    };

    document.addEventListener("fullscreenchange", checkFullScreen);
    return () => {
      document.removeEventListener("fullscreenchange", checkFullScreen);
    };
  }, []);
  // Handle Fullscreen Toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };
  // Detect Browser Back/Forward Navigation
  useEffect(() => {
    const preventBackNavigation = () => {
      setShowWarning(true);
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href); // Prevent navigation
    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);
  // Detect and Prevent Page Refresh (F5, Ctrl+R, Swipe Down on Mobile)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // Some browsers require this for confirmation
      handleCheatFunction(e);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (isExamEnded) {
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 2000); // 2 seconds delay
    }
  }, [isExamEnded, navigate]);

  if (isLoading) {
    return (
      <>
        <p>Loading exam...</p>
        <p>You will automatic redirect to Dashboard...</p>
      </>
    )
  }

  if (isStarting) {
    return (
      <p>
        Exam is sheduled at{" "}
        {formatDate(examData?.startTime) && formatDateTime(examData?.startTime)}
        ...
      </p>
    );
  }

  if (isExamEnded) {
    return <p>Exam ended</p>;
  }

  if (currentQuestion === null) {
    return <p>exam sheduled</p>;
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
              Cheating is Detected!
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Please refrain from switching tabs during the exam. This incident
              has been recorded.
            </p>
            <button
              onClick={(e) => {
                setShowWarning(false);
                console.log("exam cheated");
                handleCheatFunction(e); // this is function
              }}
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
              {/* Time Left: {formatTime(timeLeft)} */}
            </div>
            <button
              onClick={toggleFullScreen}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
            >
              {isFullScreen ? (
                <FaCompress size={20} />
              ) : (
                <FaExpandAlt size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-end space-x-2 text-indigo-600">
              <BiTimer className="text-2xl" />
              <span className="text-xl font-semibold">
                {formatTime(remainingTime)}s
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-4">
              {/* Question {currentQuestion + 1} of {examQuestions.length} */}
            </h2>
            {/* <div className="p-8"> */}
            {/* <div className="p-2 bg-[#F7F8FA] rounded-sm border border-[#E0E0E0] flex justify-between items-start"> */}
            <div className="text-xl text-gray-700 whitespace-pre-wrap font-mono font-semibold">
              {currentQuestion?.questionText}
            </div>
            {/* </div> */}
            {/* </div> */}



            {/* <p className="text-gray-700 text-lg mb-4">
              
            </p> */}

            {currentQuestion.image !== null && (
              <div className="my-4">
                <img
                  src={`${API}${currentQuestion.image}`}
                  alt="Question Illustration"
                  className="w-full h-auto rounded-lg border object-cover p-6 border-gray-200 shadow-md"
                />
              </div>
            )}
          </div>

          {/* Options */}
          {/* <div className="space-y-4">
            {currentQuestion?.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option.optionText)}
                disabled={examData.isFastQuiz && isOptionLocked}
                className={`w-full p-4 text-left rounded-lg transition-colors ${
                  selectedOption === option.optionText
                    ? isAnswerCorrect
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                } ${isOptionLocked && "cursor-not-allowed opacity-75"}`}
              >
                {option.optionText}
              </button>
            ))}
          </div> */}
          <div className="space-y-4">
            {currentQuestion?.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option.optionText)}
                disabled={isOptionLocked} // Lock only for fast quizzes after selection
                className={`w-full p-4 text-left rounded-lg transition-colors ${selectedOption === option.optionText
                  ? "bg-gray-400 text-white" // Highlight selected option in gray
                  : "bg-gray-100 hover:bg-gray-200"
                  } ${isOptionLocked ||
                    (!examData.isFastQuiz &&
                      isOptionLocked &&
                      selectedOption !== option.optionText)
                    ? "cursor-not-allowed opacity-75"
                    : ""
                  }`}
              >
                {option.optionText}
              </button>
            ))}
          </div>

          {/* Submit Answer Button */}
          {!examData.isFastQuiz && (
            <div className="mt-6 text-center">
              <button
                onClick={handleSubmitMannual}
                disabled={!selectedOption || isOptionLocked || isSubmitActive} // Disable if no option selected or already submitted
                className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${!selectedOption || isOptionLocked || isSubmitActive
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Question Time Left Bar */}
          <p className="mt-5 text-xs">Question Time Left:</p>
          <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-1000"
              style={{
                width: `${(remainingTime / currentQuestion.timeLimit) * 100}%`,
              }}
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

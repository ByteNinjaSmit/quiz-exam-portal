import { useEffect, useState, useRef } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { oneDark } from "@codemirror/theme-one-dark"
import axios from "axios"
import { useAuth } from "../../store/auth"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"

// Heroicons
import {
  BookmarkIcon,
  CodeBracketIcon,
  PlayIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InboxIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ServerIcon,
  LightBulbIcon,
  BeakerIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  TagIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline"

const boilerplate = {
  python: `# Python boilerplate
def main():
  print("Hello, Python!")
  
if __name__ == "__main__":
  main()
`,
  cpp: `// C++ boilerplate
#include <iostream>
using namespace std;

int main() {
  cout << "Hello, C++!" << endl;
  return 0;
}
`,
  java: `// Java boilerplate You Don't Have to Change Class name instead of code becuase our file name is code.java
public class code {
  public static void main(String[] args) {
      System.out.println("Hello, Java!");
  }
}
`,
  javascript: `// JavaScript boilerplate
console.log("Hello, JavaScript!");
`,
}

const CodingContestPlatform = () => {
  const { user, isLoggedIn, authorizationToken, API } = useAuth()
  const params = useParams()
  const navigate = useNavigate()
  const editorRef = useRef(null)

  // UI State
  const [problemModel, setProblemModel] = useState(true)
  const [submissionModel, setSubmissionModel] = useState(false)
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isScreenFullScreen, setIsScreenFullScreen] = useState(false)
  const [editorTheme, setEditorTheme] = useState("dark")

  // Contest State
  const [isStarting, setIsStarting] = useState(true)
  const [isExamEnded, setIsExamEnded] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [isCheated, setIsCheated] = useState(false)
  const [cheatReason , setCheatReason ] = useState("");
  const [showWarning, setShowWarning] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)

  // Problem Data
  const [problem, setProblem] = useState(null)
  const [submissionData, setSubmissionData] = useState([])
  const [testCases, setTestCases] = useState([])
  const [testCaseResults, setTestCaseResults] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState("python")
  const [code, setCode] = useState(boilerplate.python)

  // Execution State
  const [isLoading, setIsLoading] = useState(false)
  const [getLoading, setGetLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isExecuted, setIsExecuted] = useState(false)
  const [isExecutionStart, setIsExecutionStart] = useState(false)
  const [output, setOutput] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [testCasesPassedNumber, setTestCasesPassedNumber] = useState(0)
  const [expandedId, setExpandedId] = useState(null)

  // Stats
  const [submissionStats, setSubmissionStats] = useState({
    submissions: 0,
    accuracy: 0,
    runtime: 0,
  })

  const languages = [
    { id: "python", name: "Python", icon: "🐍" },
    { id: "cpp", name: "C++", icon: "⚡" },
    { id: "java", name: "Java", icon: "☕" },
  ]

  // Toggle expanded submission
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Handle language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value
    setSelectedLanguage(lang)
    setCode(boilerplate[lang])
  }

  // Clean error details based on language
  function cleanErrorDetails(errorDetails, selectedLanguage) {
    let cleanedErrorDetails = errorDetails

    if (selectedLanguage === "python") {
      cleanedErrorDetails = cleanedErrorDetails.replace(/File "\/sandbox\/.*?", /g, "")
    } else if (selectedLanguage === "cpp" || selectedLanguage === "java") {
      cleanedErrorDetails = cleanedErrorDetails.replace(/\/sandbox\/code\.(cpp|java):\d+(:\d+)?(: \w+)?/g, "")
    }

    return cleanedErrorDetails
  }

  // Fetch problem data
  const getProblem = async () => {
    setGetLoading(true)
    try {
      const response = await axios.get(`${API}/api/problem/get-contest/${params.id}`, {
        headers: {
          Authorization: authorizationToken,
        },
        withCredentials: true,
      })
      if (response.status === 200) {
        const data = response.data.problem
        setProblem(data)
        setCode(data.code)
        setSelectedLanguage(data.language)
        setTestCases(data.testCases)
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to load contest problem")
    } finally {
      setGetLoading(false)
    }
  }

  // Fetch submission data
  const getSubmissions = async () => {
    try {
      const response = await axios.get(`${API}/api/problem/get-contest-submission/${params.id}/${user._id}`, {
        headers: {
          Authorization: authorizationToken,
        },
        withCredentials: true,
      })
      if (response.status === 200) {
        const data = response.data
        setSubmissionData(data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Initial data loading
  useEffect(() => {
    getProblem()
    getSubmissions()

  }, [API])

  // Handle code submission
  const handleSubmitCode = async (e) => {
    e.preventDefault()
    setIsExecuted(false)
    setIsError(false)
    setIsLoading(true)
    setIsExecutionStart(true)
    setTestCaseResults([])

    let passedCount = 0
    setTestCasesPassedNumber(0)
    let totalExecutionTime = 0
    const totalTestCases = testCases.length
    let finalOutput = ""
    let accuracyPass = 0
    let avgTime = 0
    let isSuccessfullyRun = false
    const newTestCaseResults = []
    let score = 0;
    try {
      for (let i = 0; i < testCases.length; i++) {
        const { input, output: expectedOutput } = testCases[i]

        // Update UI to show which test case is running
        newTestCaseResults.push({
          index: i,
          status: "running",
          input,
          expectedOutput,
          actualOutput: "",
          executionTime: 0,
        })
        setTestCaseResults([...newTestCaseResults])

        const response = await axios.post(
          `${API}/api/code/new-code-judge`,
          {
            language: selectedLanguage,
            code: code,
            input: input,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: authorizationToken,
            },
            withCredentials: true,
          },
        )

        if (response.data.status === "completed") {
          const actualOutput = response.data.output.trim()
          const expectedTrimmed = expectedOutput.trim()
          const executionTime = response.data.executionTime

          totalExecutionTime += executionTime

          // Update the test case result
          newTestCaseResults[i] = {
            ...newTestCaseResults[i],
            status: actualOutput === expectedTrimmed ? "passed" : "failed",
            actualOutput,
            executionTime,
          }
          setTestCaseResults([...newTestCaseResults])

          if (actualOutput !== expectedTrimmed) {
            setTestCasesPassedNumber(passedCount)
            finalOutput = `Test case ${i + 1} failed.\nExpected: "${expectedTrimmed}"\nReceived: "${actualOutput}"`
            setOutput(finalOutput)
            setIsExecuted(true)

            setSubmissionStats((prevStats) => ({
              ...prevStats,
              submissions: prevStats.submissions + 1,
              accuracy: ((passedCount / totalTestCases) * 100).toFixed(2),
              runtime: (totalExecutionTime / (i + 1)).toFixed(2),
            }))

            accuracyPass = ((passedCount / totalTestCases) * 100).toFixed(2)
            avgTime = (totalExecutionTime / (i + 1)).toFixed(2)
            isSuccessfullyRun = false
            score = Math.round((problem.score * accuracyPass) / 100);

            // Complete remaining test cases as "not run"
            for (let j = i + 1; j < testCases.length; j++) {
              newTestCaseResults.push({
                index: j,
                status: "not-run",
                input: testCases[j].input,
                expectedOutput: testCases[j].output,
                actualOutput: "",
                executionTime: 0,
              })
            }
            setTestCaseResults([...newTestCaseResults])
            break
          }
          passedCount++
        } else if (response.data.status === "error") {
          const errorDetails = response.data.error || "Unknown error occurred."
          const cleanedErrorDetails = cleanErrorDetails(errorDetails, selectedLanguage)

          setErrorMessage({
            error: "Code Execution Error",
            details: cleanedErrorDetails,
          })

          finalOutput = cleanedErrorDetails
          setOutput(finalOutput)
          setIsError(true)

          // Mark current test case as error and remaining as not run
          newTestCaseResults[i] = {
            ...newTestCaseResults[i],
            status: "error",
            actualOutput: cleanedErrorDetails,
          }

          for (let j = i + 1; j < testCases.length; j++) {
            newTestCaseResults.push({
              index: j,
              status: "not-run",
              input: testCases[j].input,
              expectedOutput: testCases[j].output,
              actualOutput: "",
              executionTime: 0,
            })
          }
          setTestCaseResults([...newTestCaseResults])
          return
        }
      }

      // If all test cases passed
      if (passedCount === totalTestCases) {
        setTestCasesPassedNumber(passedCount)
        finalOutput = `All ${passedCount} test cases passed successfully.`

        setSubmissionStats((prevStats) => ({
          ...prevStats,
          submissions: prevStats.submissions + 1,
          accuracy: ((passedCount / totalTestCases) * 100).toFixed(2),
          runtime: (totalExecutionTime / totalTestCases).toFixed(2),
        }))

        accuracyPass = ((passedCount / totalTestCases) * 100).toFixed(2)
        avgTime = (totalExecutionTime / totalTestCases).toFixed(2)
        isSuccessfullyRun = true
        // Calculate score based on accuracy
        score = Math.round((problem.score * accuracyPass) / 100);
        setOutput(finalOutput)
        setIsExecuted(true)
        setErrorMessage(null)
      }
    } catch (error) {
      setIsError(true)

      if (error.response && error.response.data) {
        const errorDetails = error.response.data.error || "Unknown error occurred."
        const cleanedErrorDetails = cleanErrorDetails(errorDetails, selectedLanguage)

        setErrorMessage({
          error: "Execution Error",
          details: cleanedErrorDetails,
        })

        finalOutput = cleanedErrorDetails
      } else {
        setErrorMessage({
          error: "Unexpected Error",
          details: error.message || "Execution failed.",
        })
        finalOutput = "Execution failed."
      }

      setOutput(finalOutput)

      // Mark all remaining test cases as not run
      const currentLength = newTestCaseResults.length
      for (let i = currentLength; i < testCases.length; i++) {
        newTestCaseResults.push({
          index: i,
          status: "not-run",
          input: testCases[i].input,
          expectedOutput: testCases[i].output,
          actualOutput: "",
          executionTime: 0,
        })
      }
      setTestCaseResults([...newTestCaseResults])
    } finally {
      setIsLoading(false)
      setIsExecutionStart(false)
      await codeSubmission(finalOutput, passedCount, accuracyPass, avgTime, isSuccessfullyRun, score)
    }
  }

  // Submit code to server
  const codeSubmission = async (output, passedCount, accuracyPass, avgTime, isSuccessfullyRun, score) => {
    try {
      const response = await axios.post(
        `${API}/api/problem/submit-contest`,
        {
          problemId: problem._id,
          score: score,
          userId: user._id,
          code: code,
          output: output,
          accuracy: accuracyPass,
          avgRuntime: avgTime,
          testCasesPassed: passedCount,
          isSuccessfullyRun: isSuccessfullyRun,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationToken,
          },
          withCredentials: true,
        },
      )

      toast.success(response.data.message)
      getSubmissions()
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to submit code")
      }
      console.log(error)
    }
  }

  // Run code (test run)
  const handleRunCode = async (e) => {
    e.preventDefault()
    setIsExecuted(false)
    setIsError(false)
    setIsLoading(true)
    setIsExecutionStart(true)
    setTestCaseResults([])

    try {
      // Show the first test case as running
      setTestCaseResults([
        {
          index: 0,
          status: "running",
          input: testCases[0]?.input || "",
          expectedOutput: testCases[0]?.output || "",
          actualOutput: "",
          executionTime: 0,
        },
      ])

      const response = await axios.post(
        `${API}/api/code/new-code-judge`,
        {
          language: selectedLanguage,
          code: code,
          input: testCases[0]?.input || " ",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationToken,
          },
          withCredentials: true,
        },
      )

      if (response.data.status === "completed") {
        const actualOutput = response.data.output.trim()
        const expectedOutput = testCases[0]?.output?.trim() || ""
        const executionTime = response.data.executionTime

        setOutput(actualOutput)
        setErrorMessage(null)
        setIsExecuted(true)

        // Update test case result
        setTestCaseResults([
          {
            index: 0,
            status: actualOutput === expectedOutput ? "passed" : "failed",
            input: testCases[0]?.input || "",
            expectedOutput,
            actualOutput,
            executionTime,
          },
        ])
      } else if (response.data.status === "error") {
        const errorDetails = response.data.error || "Unknown error occurred."
        const cleanedErrorDetails = cleanErrorDetails(errorDetails, selectedLanguage)

        setErrorMessage({
          error: "Compilation Error",
          details: cleanedErrorDetails,
        })
        setOutput(cleanedErrorDetails)
        setIsError(true)

        // Update test case result with error
        setTestCaseResults([
          {
            index: 0,
            status: "error",
            input: testCases[0]?.input || "",
            expectedOutput: testCases[0]?.output || "",
            actualOutput: cleanedErrorDetails,
            executionTime: 0,
          },
        ])
      }
    } catch (error) {
      setIsError(true)

      let errorMessage = "Execution failed."

      if (error.response && error.response.data) {
        const errorDetails = error.response.data.details || "Unknown error occurred."
        const errorSummary = error.response.data.error || "Code execution failed"

        setErrorMessage({
          error: errorSummary,
          details: errorDetails,
        })
        errorMessage = errorDetails
      } else {
        setErrorMessage({
          error: "Unexpected Error",
          details: error.message || "Execution failed.",
        })
      }

      setOutput(errorMessage)

      // Update test case result with error
      setTestCaseResults([
        {
          index: 0,
          status: "error",
          input: testCases[0]?.input || "",
          expectedOutput: testCases[0]?.output || "",
          actualOutput: errorMessage,
          executionTime: 0,
        },
      ])
    } finally {
      setIsLoading(false)
      setIsExecutionStart(false)
    }
  }

  // Handle cheating detection
  const handleCheatFunction = async (e) => {
    e.preventDefault()

    const cheatData = {
      user: user?._id,
      problemId: problem?._id,
      reason:cheatReason,
    }

    try {
      const response = await axios.post(`${API}/api/problem/set/cheat`, cheatData, {
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })

      if (response.status === 200 || response.status === 201) {
        GetIsCheated()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "An error occurred while submitting.")
      } else if (error.request) {
        toast.error("No response received from the server.")
      } else {
        toast.error("An error occurred while setting up the request.")
      }
    }
  }

  // Check if user has cheated
  const GetIsCheated = async () => {
    try {
      const userId = user._id;
      const problemId = problem._id;

      const response = await axios.get(`${API}/api/problem/cheat-status/${userId}/${problemId}`, {
        headers: {
          Authorization: authorizationToken,
        },
        withCredentials: true,
        credentials: "include",
      })

      if (response.status === 200) {
        const { isCheat } = response.data
        if (isCheat) {
          setIsCheated(true)
          toast.warning("You have been flagged for cheating. You will be redirected to the dashboard.")
          navigate("/user/dashboard")
        } else {
          setIsCheated(false)
        }
      }
    } catch (error) {
      console.error(`Error occurred while getting cheat status: ${error}`)
    }
  }
  useEffect(() => {
    if (user?._id && problem?._id) {
      GetIsCheated();
    }
  }, [user?._id, problem?._id]);


  // Format time for display
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`
    }

    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check contest status and set timer
  useEffect(() => {
    if (!problem?.startTime || !problem?.endTime) return

    const now = new Date()
    const examStartTime = new Date(problem.startTime)
    const examEndTime = new Date(problem.endTime)

    if (now < examStartTime) {
      setIsStarting(true)
      setIsExamEnded(false)
      setRemainingTime(0)

      // Set timer to check again when contest starts
      const timeUntilStart = examStartTime - now
      const timer = setTimeout(() => {
        window.location.reload()
      }, timeUntilStart)

      return () => clearTimeout(timer)
    } else if (now > examEndTime) {
      setIsStarting(false)
      setIsExamEnded(true)
      setRemainingTime(0)
    } else {
      setIsStarting(false)
      setIsExamEnded(false)
      setRemainingTime(Math.floor((examEndTime - now) / 1000))
    }
  }, [problem?.startTime, problem?.endTime])

  // Countdown timer
  useEffect(() => {
    if (!isExamEnded && remainingTime > 0) {
      const countdown = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(countdown)
            setIsExamEnded(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(countdown)
    }
  }, [isExamEnded, remainingTime])

  // Redirect when exam ends
  useEffect(() => {
    if (isExamEnded) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
      }
      toast.info("The contest has ended. You will be redirected to the dashboard.")
      setTimeout(() => {
        navigate("/user/dashboard")
      }, 3000)
    }
  }, [isExamEnded, navigate])

  // Anti-Cheat: Detect Tab Switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1)
        if (tabSwitchCount >= 0) {
          toast.warning("Switching tabs is not allowed during the contest!");
          setCheatReason("Detected Tab Switching")
          setShowWarning(true)
        } else {
          toast.warning("Switching tabs is not allowed during the contest!")
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [tabSwitchCount])

  // Anti-Cheat: Block Right-click, Inspect Element, and Copying
  useEffect(() => {
    const disableRightClick = (event) => {
      event.preventDefault()
      toast.warning("Right-clicking is disabled during the contest")
    }

    const disableDevTools = (event) => {
      if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && event.key === "I") ||
        (event.ctrlKey && event.key === "u")
      ) {
        event.preventDefault()
        setWarningCount((prev) => prev + 1)
        if (warningCount >= 1) {
          setCheatReason("Block Right-click, Inspect Element, and Copying");
          setShowWarning(true)
          // handleCheatFunction(); 
        } else {
          toast.warning("Developer tools are disabled during the contest!")
        }
      }
    }

    document.addEventListener("contextmenu", disableRightClick)
    document.addEventListener("keydown", disableDevTools)

    return () => {
      document.removeEventListener("contextmenu", disableRightClick)
      document.removeEventListener("keydown", disableDevTools)
    }
  }, [warningCount])

  // Block Page Refresh (F5, Ctrl+R)

  useEffect(() => {
    const disablePageRefresh = (event) => {
      if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
        event.preventDefault();
        setWarningCount((prev) => {
          if (prev >= 1) {
            setCheatReason("Page Refresh (F5, Ctrl+R)");
            setShowWarning(true);
            // handleCheatFunction();
          }
          return prev + 1;
        });
        toast.warning("Page refresh is disabled during the contest!");
      }
    };

    document.addEventListener("keydown", disablePageRefresh);

    return () => {
      document.removeEventListener("keydown", disablePageRefresh);
    };
  }, [warningCount]);

  // Block Mobile Refresh (Pull-to-Refresh)

  useEffect(() => {
    const disableMobileRefresh = (event) => {
      if (window.scrollY === 0) {
        event.preventDefault();
        setWarningCount((prev) => {
          if (prev >= 1) {
            setCheatReason("Mobile Refresh (Pull-to-Refresh)");
            setShowWarning(true);
            // handleCheatFunction();
          }
          return prev + 1;
        });
        toast.warning("Pull-to-refresh is disabled during the contest!");
      }
    };

    document.addEventListener("touchmove", disableMobileRefresh, { passive: false });

    return () => {
      document.removeEventListener("touchmove", disableMobileRefresh);
    };
  }, [warningCount]);

  // Block Split-Screen & Multiple Tabs

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((prev) => {
          if (prev >= 1) {
            setCheatReason("Split-Screen & Multiple Tabs");
            setShowWarning(true);
            // handleCheatFunction();
          }
          return prev + 1;
        });
        toast.warning("Switching tabs or using split-screen is not allowed!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [warningCount]);


  // Anti-Cheat: Disable Clipboard & Input Pasting
  useEffect(() => {
    const disablePaste = (event) => {
      if (!editorRef.current?.contains(event.target)) {
        event.preventDefault()
        setWarningCount((prev) => prev + 1)

        if (warningCount >= 1) {
          setCheatReason("Disable Clipboard & Input Pasting");
          setShowWarning(true)
          // handleCheatFunction() // 🔥 Call anti-cheat function after 2 warnings
        } else {
          toast.warning("Pasting is only allowed in the code editor")
        }
      }
    }

    const disableCopy = (event) => {
      if (!editorRef.current?.contains(event.target)) {
        event.preventDefault()
        setWarningCount((prev) => prev + 1)

        if (warningCount >= 1) {
          setCheatReason("Clipboard & Input Pasting")
          setShowWarning(true)
          // handleCheatFunction() // 🔥 Call anti-cheat function after 2 warnings
        } else {
          toast.warning("Copying is only allowed from the code editor")
        }
      }
    }

    document.addEventListener("paste", disablePaste)
    document.addEventListener("copy", disableCopy)

    return () => {
      document.removeEventListener("paste", disablePaste)
      document.removeEventListener("copy", disableCopy)
    }
  }, [warningCount]) // 🛠 Dependency added to track `warningCount`


  // Anti-Cheat: Force Fullscreen
  // Force Fullscreen on Load
  useEffect(() => {
    const enterFullScreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen request failed", err);
      }
    };
  
    enterFullScreen(); // Trigger fullscreen on mount
  
    const checkFullScreen = () => {
      if (!document.fullscreenElement) {
        setCheatReason("user exits fullscreen");
        setShowWarning(true); // 🚨 Show warning when user exits fullscreen
  
        // 🔥 Ensure re-entry on the next user interaction
        document.addEventListener("click", enterFullScreen, { once: true });
      }
    };
  
    document.addEventListener("fullscreenchange", checkFullScreen);
  
    return () => {
      document.removeEventListener("fullscreenchange", checkFullScreen);
      document.removeEventListener("click", enterFullScreen);
    };
  }, []);
  
  
  

  // Anti-Cheat: Detect Browser Back/Forward Navigation
  useEffect(() => {
    const preventBackNavigation = () => {
      setWarningCount((prev) => prev + 1)
      if (warningCount >= 1) {
        setCheatReason("Detect Browser Back/Forward Navigation");
        setShowWarning(true)
      } else {
        toast.warning("Navigation is not allowed during the contest!")
      }
      window.history.pushState(null, "", window.location.href)
    }

    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", preventBackNavigation)

    return () => {
      window.removeEventListener("popstate", preventBackNavigation)
    }
  }, [warningCount])

  // Anti-Cheat: Detect Alt+Tab & Win+Tab Attempts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Detect Alt+Tab or Win+Tab
      if ((event.altKey || event.metaKey) && event.key === "Tab") {
        event.preventDefault()
        setWarningCount((prev) => prev + 1)
        if (warningCount >= 1) {
          setCheatReason("Switching applications Detect Alt+Tab & Win+Tab Attempts");
          setShowWarning(true)
        } else {
          toast.warning("Switching applications is not allowed during the contest!")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [warningCount])

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
        setCheatReason("Fullscreen Exit & Force Re-entry");
        setShowWarning(true);
        enterFullScreen(); // Re-enter fullscreen if exited
      }
    };

    document.addEventListener("fullscreenchange", checkFullScreen);
    return () => {
      document.removeEventListener("fullscreenchange", checkFullScreen);
    };
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  // Get status icon for test cases
  const getStatusIcon = (status) => {
    switch (status) {
      case "passed":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case "failed":
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case "running":
        return <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      case "error":
        return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
      case "not-run":
        return <ClockIcon className="w-5 h-5 text-gray-400" />
      default:
        return null
    }
  }

  // Loading state
  if (getLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl font-medium text-indigo-600">Loading contest...</div>
        </div>
      </div>
    )
  }

  // Contest not started yet
  if (isStarting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <ClockIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Contest Scheduled</h2>
            <p className="text-gray-600 mt-2">This contest will begin at {formatDate(problem?.startTime)}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="font-medium text-indigo-800 mb-2">{problem?.title}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>
                Duration: {formatTime(Math.floor((new Date(problem?.endTime) - new Date(problem?.startTime)) / 1000))}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Contest ended
  if (isExamEnded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Contest Ended</h2>
            <p className="text-gray-600 mt-2">Thank you for participating in this contest.</p>
          </div>
          <p className="text-center text-gray-500 mb-4">You will be redirected to the dashboard in a few seconds...</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cheating Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <ShieldExclamationIcon className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Cheating Detected!</h3>
            <p className="text-gray-600 text-center mb-6">
              Suspicious activity has been detected. This incident has been recorded and may result in disqualification.
            </p>
            <button
              onClick={(e) => {
                setShowWarning(false)
                handleCheatFunction(e)
              }}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Timer Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-gray-800">{problem?.title}</h1>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium 
                                ${problem?.difficulty?.toLowerCase() === "easy"
                    ? "bg-green-100 text-green-800"
                    : problem?.difficulty?.toLowerCase() === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
              >
                {problem?.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full 
                                ${remainingTime < 300
                    ? "bg-red-100 text-red-800 animate-pulse"
                    : remainingTime < 600
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
              >
                <ClockIcon className="w-5 h-5" />
                <span className="font-mono font-medium">{formatTime(remainingTime)}</span>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full flex items-center space-x-2">
                <TagIcon className="w-5 h-5" />
                <span className="font-medium">{problem?.score || 0} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)] overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div
          className={`${isDescriptionVisible ? "block" : "hidden"} lg:block lg:w-2/5 bg-white shadow-md overflow-y-auto h-full transition-all duration-300 ease-in-out ${isFullScreen ? "lg:hidden" : ""}`}
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
            <button
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 focus:outline-none
                                ${problemModel ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => {
                setProblemModel(true)
                setSubmissionModel(false)
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <DocumentTextIcon className="w-5 h-5" />
                <span>Problem</span>
              </div>
            </button>
            <button
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 focus:outline-none
                                ${submissionModel ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => {
                setSubmissionModel(true)
                setProblemModel(false)
                getSubmissions()
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <ServerIcon className="w-5 h-5" />
                <span>Submissions</span>
              </div>
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {/* Problem View */}
            {problemModel && problem && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">{problem?.title}</h1>
                  <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors">
                    <BookmarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium 
                                        ${problem?.difficulty?.toLowerCase() === "easy"
                        ? "bg-green-100 text-green-800"
                        : problem?.difficulty?.toLowerCase() === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                  >
                    {problem?.difficulty}
                  </span>
                  {problem?.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                <section className="bg-white rounded-lg p-5 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <LightBulbIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{problem?.description}</p>
                </section>

                <section className="bg-white rounded-lg p-5 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CodeBracketIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Constraints
                  </h2>
                  <pre className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 font-mono overflow-x-auto">
                    {problem?.constraints}
                  </pre>
                </section>

                <section className="bg-white rounded-lg p-5 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <BeakerIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Examples
                  </h2>
                  <div className="space-y-4">
                    {problem?.examples?.slice(0, 3).map((example, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md space-y-3">
                        <div>
                          <span className="font-semibold text-gray-700">Input:</span>
                          <pre className="mt-1 bg-white p-2 rounded border border-gray-200 text-sm font-mono">
                            {example.input}
                          </pre>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Output:</span>
                          <pre className="mt-1 bg-white p-2 rounded border border-gray-200 text-sm font-mono">
                            {example.output}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-lg p-5 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Statistics
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-md p-4 text-center">
                      <p className="text-xs text-gray-500 font-medium">Submissions</p>
                      <p className="text-xl font-bold text-gray-800">{submissionData?.length || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 text-center">
                      <p className="text-xs text-gray-500 font-medium">Accuracy</p>
                      <p className="text-xl font-bold text-gray-800">{submissionStats.accuracy || 0}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 text-center">
                      <p className="text-xs text-gray-500 font-medium">Avg Runtime</p>
                      <p className="text-xl font-bold text-gray-800">{submissionStats.runtime || 0} ms</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Submissions View */}
            {submissionModel && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-gray-900 mb-4">Your Submissions</h1>

                {submissionData?.length > 0 ? (
                  submissionData.map((submission) => (
                    <div
                      key={submission._id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ease-in-out"
                    >
                      {/* Submission Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExpand(submission._id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center 
                                                            ${submission.isSuccessfullyRun ? "bg-green-100" : "bg-red-100"}`}
                            >
                              {submission.isSuccessfullyRun ? (
                                <CheckIcon className="w-5 h-5 text-green-600" />
                              ) : (
                                <XMarkIcon className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800 text-sm">
                                {submission.isSuccessfullyRun ? "Accepted" : "Wrong Answer"}
                              </h3>
                              <p className="text-xs text-gray-500">{formatDate(submission.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="font-medium">Score:</span>
                                <span className="ml-1">{submission.score || 0} pts</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="font-medium">Runtime:</span>
                                <span className="ml-1">{submission.avgRuntime} ms</span>
                              </div>
                            </div>
                            {expandedId === submission._id ? (
                              <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedId === submission._id && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50 animate-fadeIn">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-700 text-sm mb-2">Code</h4>
                              <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto text-xs font-mono">
                                {submission.code}
                              </pre>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 text-sm mb-2">Output</h4>
                              <pre
                                className={`p-3 rounded-md overflow-x-auto text-xs font-mono
                                                                ${submission.isSuccessfullyRun ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                              >
                                {submission.output}
                              </pre>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Test Cases: {submission.testCasesPassed} passed</span>
                              <span>Accuracy: {submission.accuracy}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <InboxIcon className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg text-gray-700 font-medium">No submissions yet</p>
                    <p className="text-gray-500 mt-1 text-sm">Submit your solution to see results here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div
          className={`flex-1 flex flex-col bg-white shadow-md overflow-hidden transition-all duration-300 ease-in-out ${isFullScreen ? "w-full" : ""}`}
        >
          {/* Editor Controls */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    className="appearance-none pl-8 pr-8 py-1.5 bg-white rounded-md text-gray-700 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed opacity-75"
                    disabled
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.icon} {lang.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <CodeBracketIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={editorTheme}
                    onChange={(e) => setEditorTheme(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-1.5 bg-white rounded-md text-gray-700 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="github">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <Cog6ToothIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFullScreen}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
                >
                  {isFullScreen ? (
                    <ArrowsPointingInIcon className="w-5 h-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                  )}
                </button>
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs flex items-center">
                  <LockClosedIcon className="w-3 h-3 mr-1" />
                  Contest Mode
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div ref={editorRef} className="rounded-md overflow-hidden border border-gray-300 shadow-sm">
              <CodeMirror
                value={code}
                height="400px"
                extensions={[
                  selectedLanguage === "javascript"
                    ? javascript()
                    : selectedLanguage === "python"
                      ? python()
                      : selectedLanguage === "cpp"
                        ? cpp()
                        : selectedLanguage === "java"
                          ? java()
                          : javascript(),
                ]}
                theme={editorTheme === "dark" ? oneDark : undefined}
                onChange={(value) => setCode(value)}
                basicSetup={{
                  lineNumbers: true,
                  autocompletion: true,
                  highlightActiveLine: true,
                }}
                className="font-mono text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                className={`flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors
                                    ${isExecutionStart ? "bg-indigo-400 cursor-not-allowed" : ""}`}
                onClick={(e) => handleRunCode(e)}
                disabled={isExecutionStart}
              >
                <PlayIcon className="w-4 h-4" />
                Run
              </button>

              <button
                className={`flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-green-700 transition-colors
                                    ${isExecutionStart ? "bg-green-400 cursor-not-allowed" : ""}`}
                onClick={(e) => handleSubmitCode(e)}
                disabled={isExecutionStart}
              >
                <CodeBracketIcon className="w-4 h-4" />
                Submit
              </button>

              <button
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium shadow-sm hover:bg-gray-300 transition-colors ml-auto"
                onClick={() => setCode("")}
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Test Cases and Output */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {/* Test Cases */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <BeakerIcon className="w-4 h-4 mr-1.5 text-indigo-500" />
                Test Cases
              </h2>

              <div className="space-y-3">
                {testCaseResults.length > 0
                  ? testCaseResults.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-md p-3 shadow-sm border border-gray-200 transition-all duration-300 ease-in-out animate-fadeIn"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="mr-2">{getStatusIcon(result.status)}</div>
                          <h3 className="font-medium text-gray-700 text-sm">
                            Test Case {result.index + 1}
                            {result.status === "running" && (
                              <span className="ml-2 text-xs text-indigo-600 animate-pulse">Running...</span>
                            )}
                            {result.status === "passed" && (
                              <span className="ml-2 text-xs text-green-600">Passed</span>
                            )}
                            {result.status === "failed" && <span className="ml-2 text-xs text-red-600">Failed</span>}
                            {result.status === "error" && <span className="ml-2 text-xs text-amber-600">Error</span>}
                          </h3>
                        </div>
                        {result.executionTime > 0 && (
                          <span className="text-xs text-gray-500">{result.executionTime.toFixed(2)} ms</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Input</label>
                          <div className="bg-gray-50 p-2 rounded-md border border-gray-200 h-16 overflow-auto font-mono text-xs">
                            {result.input}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Expected Output</label>
                          <div className="bg-gray-50 p-2 rounded-md border border-gray-200 h-16 overflow-auto font-mono text-xs">
                            {result.expectedOutput}
                          </div>
                        </div>
                      </div>
                      {(result.status === "failed" || result.status === "passed" || result.status === "error") && (
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            {result.status === "error" ? "Error" : "Your Output"}
                          </label>
                          <div
                            className={`p-2 rounded-md border overflow-auto font-mono text-xs h-16
                                                        ${result.status === "passed"
                                ? "bg-green-50 border-green-200 text-green-800"
                                : result.status === "failed"
                                  ? "bg-red-50 border-red-200 text-red-800"
                                  : "bg-amber-50 border-amber-200 text-amber-800"
                              }`}
                          >
                            {result.actualOutput}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                  : testCases.slice(0, 2).map((testCase, index) => (
                    <div key={index} className="bg-white rounded-md p-3 shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-700 text-sm">Test Case {index + 1}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Input</label>
                          <div className="bg-gray-50 p-2 rounded-md border border-gray-200 h-16 overflow-auto font-mono text-xs">
                            {testCase.input}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Expected Output</label>
                          <div className="bg-gray-50 p-2 rounded-md border border-gray-200 h-16 overflow-auto font-mono text-xs">
                            {testCase.output}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && !testCaseResults.length && (
              <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-indigo-600 font-medium">Executing your code...</p>
                <p className="text-gray-500 text-sm">This may take a few moments</p>
              </div>
            )}

            {/* Output Section */}
            {isExecuted && !isLoading && (
              <div className="animate-fadeIn">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-500" />
                  Output
                </h2>
                <div className="bg-white rounded-md border border-green-200 p-3 shadow-sm">
                  <pre className="text-green-800 whitespace-pre-line font-mono text-sm overflow-auto max-h-60">
                    {output || "No output available"}
                  </pre>
                </div>
              </div>
            )}

            {/* Error Section */}
            {isError && !isLoading && (
              <div className="animate-fadeIn">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1.5 text-red-500" />
                  Error
                </h2>
                <div className="bg-white rounded-md border border-red-200 p-3 shadow-sm">
                  <pre className="text-red-800 whitespace-pre-line font-mono text-sm overflow-auto max-h-60">
                    {output || "No error details available"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        className="fixed bottom-4 right-4 lg:hidden p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50"
        onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
        aria-label={isDescriptionVisible ? "Hide problem description" : "Show problem description"}
      >
        {isDescriptionVisible ? <XMarkIcon className="w-5 h-5" /> : <DocumentTextIcon className="w-5 h-5" />}
      </button>
    </div>
  )
}

export default CodingContestPlatform


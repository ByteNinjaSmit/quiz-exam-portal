import React, { useEffect, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import { FaBookmark, FaCode, FaPlay, FaDownload, FaTimes, FaPlus, FaLandmark, FaSyncAlt } from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Icons for expand/collapse
import {
    MdInbox,
  } from "react-icons/md";
import { BiReset } from "react-icons/bi";
import axios from 'axios';
import { useAuth } from "../../store/auth";

// Code mirror
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';

// Monaco Editor
import MonacoEditor from '@monaco-editor/react';
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

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
};
const CodingProblemPlatform = () => {
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
    const params = useParams();
    const [problemModel, setProblemModel] = useState(true);
    const [submissionModel, setSubmissionModel] = useState(false);
    const [submissionData, setSubmissionData] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState("python");
    const [editorTheme, setEditorTheme] = useState("dark");
    const [code, setCode] = useState(boilerplate.python);
    const [testCases, setTestCases] = useState([]);
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [output, setOutput] = useState(null);
    const [problem, setProblem] = useState(null);
    const [getLoading, setGetLoading] = useState(true);
    const languages = [
        { id: "python", name: "Python", icon: "🐍" },
        { id: "cpp", name: "C++", icon: "⚡" },
        { id: "java", name: "Java", icon: "☕" }
    ];

    // For Error And Proper Execute State
    const [isError, setIsError] = useState(false);
    const [isExecuted, setIsExecuted] = useState(false);
    const [testCasesPassedNumber, setTestCasesPassedNumber] = useState(0);
    const [isExecutionStart, setIsExecutionStart] = useState(false);
    // Loading State
    const [isLoading, setIsLoading] = useState(false);
    const [submissionStats, setSubmissionStats] = useState({
        submissions: 0,
        accuracy: 0,
        runtime: 0, // Average response time in milliseconds
    });
    const [expandedId, setExpandedId] = useState(null);
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setSelectedLanguage(lang);
        setCode(boilerplate[lang]);
    };



    function cleanErrorDetails(errorDetails, selectedLanguage) {
        let cleanedErrorDetails = errorDetails;

        if (selectedLanguage === "python") {
            // For Python, remove the file path and line number part
            cleanedErrorDetails = cleanedErrorDetails.replace(/File "\/sandbox\/.*?", /g, '');
        } else if (selectedLanguage === "cpp" || selectedLanguage === "java") {
            // For C++ and Java, remove file path and line/column information
            cleanedErrorDetails = cleanedErrorDetails.replace(/\/sandbox\/code\.(cpp|java):\d+(:\d+)?(: \w+)?/g, ''); // Remove C++ and Java file paths and line/column numbers
        }

        return cleanedErrorDetails;
    }


    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: "", expectedOutput: "", result: null }]);
    };

    const getProblem = async () => {
        setGetLoading(true);
        try {
            const response = await axios.get(`${API}/api/problem/get-problem/${params.id}`, {
                headers: {
                    'Authorization': authorizationToken,
                },
                withCredentials: true,
            });
            if (response.status === 200) {
                const data = response.data.problem;
                // console.log(data);
                setProblem(data);


                setCode(data.code)
                setSelectedLanguage(data.language)
                setTestCases(data.testCases);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setGetLoading(false);
        }
    }
    const getSubmissions = async () => {
        try {
            const response = await axios.get(`${API}/api/problem/get-submission/${params.id}/${user._id}`, {
                headers: {
                    'Authorization': authorizationToken,
                },
                withCredentials: true,
            });
            if (response.status === 200) {
                const data = response.data
                console.log(data.data);
                setSubmissionData(data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getProblem();
        getSubmissions();
    }, [API]);


    const handleSubmitCode = async (e) => {
        e.preventDefault();
        setIsExecuted(false);
        setIsError(false);
        setIsLoading(true);
        setIsExecutionStart(true);
        let passedCount = 0; // Count of passed test cases
        setTestCasesPassedNumber(0);
        let totalExecutionTime = 0;
        const totalTestCases = testCases.length;
        let finalOutput = '';
        let accuracyPass = 0;
        let avgTime = 0;
        let isSuccessfullyRun = false;

        try {
            const startSubmissionTime = performance.now(); // Start time of full submission

            for (let i = 0; i < testCases.length; i++) {
                const { input, output: expectedOutput } = testCases[i];
                const startTime = performance.now(); // Start time of individual test case

                const response = await axios.post(`${API}/api/code/run-code`,
                    {
                        language: selectedLanguage,
                        code: code,
                        input: input,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: authorizationToken,
                        },
                        withCredentials: true,
                    }
                );
                const endTime = performance.now(); // End time of individual test case
                const executionTime = endTime - startTime; // Calculate execution time for this test case
                totalExecutionTime += executionTime;

                const actualOutput = response.data.result.trim();
                const expectedTrimmed = expectedOutput.trim();

                if (actualOutput !== expectedTrimmed) {
                    setTestCasesPassedNumber(i + 1)
                    // Stop execution if test case fails
                    finalOutput = `Test case ${i + 1} failed.\nExpected: "${expectedTrimmed}"\nReceived: "${actualOutput}"`;
                    setOutput(finalOutput);

                    setIsExecuted(true);
                    // Update stats on failure
                    setSubmissionStats(prevStats => ({
                        ...prevStats,
                        submissions: prevStats.submissions + 1,
                        accuracy: ((passedCount / totalTestCases) * 100).toFixed(2), // Accuracy
                        runtime: (totalExecutionTime / (i + 1)).toFixed(2), // Avg execution time per test case
                    }));
                    accuracyPass = ((passedCount / totalTestCases) * 100).toFixed(2);
                    avgTime = (totalExecutionTime / (i + 1)).toFixed(2);
                    isSuccessfullyRun = true;
                    return;
                }

                passedCount++; // Increase passed count if test case is correct
            }
            const endSubmissionTime = performance.now();
            const totalTimeTaken = endSubmissionTime - startSubmissionTime; // Total time for full submission
            // Update statistics after a successful submission
            setSubmissionStats(prevStats => ({
                ...prevStats,
                submissions: prevStats.submissions + 1,
                accuracy: ((passedCount / totalTestCases) * 100).toFixed(2), // Accuracy in percentage
                runtime: (totalExecutionTime / totalTestCases).toFixed(2), // Avg execution time
            }));
            accuracyPass = ((passedCount / totalTestCases) * 100).toFixed(2);
            avgTime = (totalExecutionTime / totalTestCases).toFixed(2);
            isSuccessfullyRun = true;
            // If all test cases passed
            setTestCasesPassedNumber(passedCount)
            finalOutput = `All ${passedCount} test cases passed successfully.`;

            setOutput(finalOutput);
            setIsExecuted(true);
            setErrorMessage(null);

        } catch (error) {
            setIsError(true);
            // console.log(error);

            if (error.response && error.response.data) {
                // console.error('Error:', error.response.data);

                const errorDetails = error.response.data.details || 'Unknown error occurred.';
                const errorSummary = error.response.data.error || 'Code execution failed';

                // Check for syntax errors and clean the error message
                if (errorDetails.includes('SyntaxError')) {
                    // Use a regular expression to remove the unwanted file path information
                    const cleanedErrorDetails = cleanErrorDetails(errorDetails, selectedLanguage);


                    setErrorMessage({
                        error: errorSummary,
                        details: cleanedErrorDetails,
                    });
                    finalOutput = cleanedErrorDetails;
                }
                // Handle infinite loop or timeout errors
                else if (errorDetails.includes('Command failed')) {
                    setErrorMessage({
                        error: errorSummary,
                        details: 'The code execution may have gone into an infinite loop or timed out.',
                    });
                    finalOutput = 'The code execution may have gone into an infinite loop or timed out.';
                }
                // Default error handling
                else {
                    setErrorMessage({
                        error: errorSummary,
                        details: errorDetails,
                    });
                    finalOutput = errorDetails;
                }
            }
            // Generic fallback for unexpected errors
            else {
                setErrorMessage({
                    error: 'Unexpected Error',
                    details: error.message || 'Execution failed.',
                });
                finalOutput = 'Execution failed.';
            }
            setOutput(finalOutput);
        } finally {
            setIsLoading(false);
            setIsExecutionStart(false);
            await codeSubmission(finalOutput, passedCount, accuracyPass, avgTime, isSuccessfullyRun);
        }
    }
    // console.log(output);
    const codeSubmission = async (output, passedCount, accuracyPass, avgTime, isSuccessfullyRun) => {
        try {
            const response = await axios.post(`${API}/api/problem/submit-problem`,
                {
                    problemId: problem._id,
                    userId: user._id,
                    code: code,
                    output: output,
                    accuracy: accuracyPass,
                    avgRuntime: avgTime,
                    testCasesPassed: passedCount,
                    isSuccessfullyRun: isSuccessfullyRun,

                }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorizationToken,
                },
                withCredentials: true,
            }
            )
            console.log(response.data);
            toast.success(response.data.message);
            getSubmissions();
        } catch (error) {
            console.log(error);
        }
    }

    const handleRunCode = async (e) => {
        e.preventDefault();
        setIsExecuted(false);
        setIsError(false);
        setIsLoading(true);
        setIsExecutionStart(true);
        try {
            const response = await axios.post(`${API}/api/code/run-code`,
                // pass header
                {
                    language: selectedLanguage,
                    code: code,
                    input: testCases[0]?.input || " ",
                },
                // pass header
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: authorizationToken,
                    },
                    withCredentials: true,
                },
                {
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                    },
                },
            );
            // if status 200 then match the result with expected output


            // console.log('Response:', response.data.result);
            setOutput(response.data.result)
            setIsExecuted(true);
            setErrorMessage(null);
        } catch (error) {
            setIsError(true);
            // console.log(error);

            if (error.response && error.response.data) {
                // console.error('Error:', error.response.data);

                const errorDetails = error.response.data.details || 'Unknown error occurred.';
                const errorSummary = error.response.data.error || 'Code execution failed';

                // Check for syntax errors and clean the error message
                if (errorDetails.includes('SyntaxError')) {
                    // Use a regular expression to remove the unwanted file path information
                    const cleanedErrorDetails = cleanErrorDetails(errorDetails, selectedLanguage);


                    setErrorMessage({
                        error: errorSummary,
                        details: cleanedErrorDetails,
                    });
                    setOutput(cleanedErrorDetails);
                }
                // Handle infinite loop or timeout errors
                else if (errorDetails.includes('Command failed')) {
                    setErrorMessage({
                        error: errorSummary,
                        details: 'The code execution may have gone into an infinite loop or timed out.',
                    });
                    setOutput('The code execution may have gone into an infinite loop or timed out.');
                }
                // Default error handling
                else {
                    setErrorMessage({
                        error: errorSummary,
                        details: errorDetails,
                    });
                    setOutput(errorDetails);
                }
            }
            // Generic fallback for unexpected errors
            else {
                setErrorMessage({
                    error: 'Unexpected Error',
                    details: error.message || 'Execution failed.',
                });
                setOutput('Execution failed.');
            }
        } finally {
            setIsLoading(false);
            setIsExecutionStart(false);
        }
    };
    if (getLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading...</div>
            </div>
        )
    }

    // console.log(testCases);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString(); // Converts to local time format
      };
    return (
        <div className="min-h-screen bg-[#FAFAFB]">
            <div className="flex flex-col lg:flex-row overflow-y-auto">
                {/* Left Panel */}
                <div className={`${isDescriptionVisible ? "block" : "hidden"} lg:block lg:w-2/5 bg-card p-6 border-r border-[#E0E0E0]`}>
                    <div className="flex border-b border-gray-300 shadow-md mb-2">
                        <button
                            className={`px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-none
                      ${problemModel ? "border-b-4 border-[#7209B7] bg-gray-100 shadow-inner" : "hover:bg-gray-200"}`}
                            onClick={() => {
                                setProblemModel(true);
                                setSubmissionModel(false);
                                
                            }}
                        >
                            Problem
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-none
                      ${submissionModel ? "border-b-4 border-[#7209B7] bg-gray-100 shadow-inner" : "hover:bg-gray-200"}`}
                            onClick={() => {
                                setSubmissionModel(true);
                                setProblemModel(false);
                                getSubmissions();
                            }}
                        >
                            Submissions
                        </button>
                    </div>

                    {/* Problem Modal */}
                    {problemModel && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-[28px] font-semibold text-[#3A0CA3]">{problem?.title}</h1>
                                <button className="p-2 hover:bg-[#F0F1F3] rounded-sm">
                                    <FaBookmark className="text-[#3A0CA3]" />
                                </button>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <span className="px-3 py-1 bg-[#F72585] text-[#FFFFFF] rounded-sm text-sm">
                                    {problem.difficulty}
                                </span>
                                {problem.tags.map((tag) => (
                                    <span key={tag} className="px-3 py-1 bg-[#F0F1F3] text-[#7209B7] rounded-sm text-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <div className="space-y-6">
                                <section>
                                    <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Description</h2>
                                    <p className="text-body text-[#3A0CA3]">{problem.description}</p>
                                </section>

                                <section>
                                    <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Constraints</h2>
                                    <pre className="bg-[#F0F1F3] p-4 rounded-sm text-sm">{problem.constraints}</pre>
                                </section>

                                <section>
                                    <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Examples</h2>
                                    {problem?.examples.slice(0, 3).map((example, index) => (
                                        <div key={index} className="bg-[#F0F1F3] p-4 rounded-sm space-y-2 mt-1">
                                            <p className="text-sm"><strong>Input:</strong> {example.input}</p>
                                            <p className="text-sm"><strong>Output:</strong> {example.output}</p>
                                        </div>
                                    ))}
                                </section>

                                <section>
                                    <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Statistics</h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-[#F0F1F3] p-4 rounded-sm text-center">
                                            <p className="text-sm text-[#3A0CA3]">Submissions</p>
                                            <p className="font-semibold">{submissionData?.length}</p>
                                        </div>
                                        <div className="bg-[#F0F1F3] p-4 rounded-sm text-center">
                                            <p className="text-sm text-[#3A0CA3]">Accuracy</p>
                                            <p className="font-semibold">{submissionStats.accuracy}%</p>
                                        </div>
                                        <div className="bg-[#F0F1F3] p-4 rounded-sm text-center">
                                            <p className="text-sm text-[#3A0CA3]">Avg Runtime</p>
                                            <p className="font-semibold">{submissionStats.runtime} ms</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </>
                    )}

                    {/* Submission Model */}
                    {submissionModel && (
                        <>
                            {submissionData.length > 0 ? (
                                submissionData.map((submission) => (
                                    <div key={submission._id} className="border border-gray-300 rounded-lg mb-4 p-4 bg-white shadow-md">
                                        {/* Summary Section */}
                                        <div
                                            className="flex justify-between items-center cursor-pointer"
                                            onClick={() => toggleExpand(submission._id)}
                                        >
                                            <div>
                                                <h2 className="text-lg font-semibold text-[#3A0CA3]">Submission ID: {submission._id}</h2>
                                                <p className="text-sm text-gray-700">Accuracy: {submission.accuracy}%</p>
                                                <p className="text-sm text-gray-700">Test Cases Passed: {submission.testCasesPassed}</p>
                                                <p className="text-sm text-gray-700">Submitted At: {formatDate(submission.createdAt)}</p>
                                                <p className="text-sm text-gray-700">Avg Runtime: {(submission.avgRuntime)}ms</p>
                                                <p className={`text-sm font-medium ${submission.isSuccessfullyRun ? "text-green-600" : "text-red-600"}`}>
                                                    {submission.isSuccessfullyRun ? "✅ Passed" : "❌ Failed"}
                                                </p>
                                            </div>
                                            {/* Expand/Collapse Arrow */}
                                            {expandedId === submission._id ? (
                                                <FiChevronUp className="text-xl text-gray-600" />
                                            ) : (
                                                <FiChevronDown className="text-xl text-gray-600" />
                                            )}
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedId === submission._id && (
                                            <div className="mt-3 p-3 bg-gray-100 rounded-md">
                                                <h3 className="font-semibold text-gray-800">Code:</h3>
                                                <pre className="bg-gray-200 p-2 rounded-md overflow-x-auto text-sm">{submission.code}</pre>
                                                <h3 className="font-semibold text-gray-800 mt-2">Output:</h3>
                                                <p className="text-gray-700">{submission.output}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                                <MdInbox className="text-6xl text-muted-foreground mb-4" />
                                <p className="text-xl text-muted-foreground">No Submission found</p>
                              </div>
                            )}
                        </>
                    )}




                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-[#E0E0E0]">
                        <div className="flex items-center gap-4 mb-4">
                            <select
                                value={selectedLanguage}
                                className="px-4 py-2 bg-[#F0F1F3] rounded-sm text-[#3A0CA3] border border-[#E0E0E0] focus:ring-2 focus:ring-[#F72585] cursor-not-allowed opacity-50"
                                disabled
                            >
                                {languages.map((lang) => (
                                    <option key={lang.id} value={lang.id}>
                                        {lang.icon} {lang.name}
                                    </option>
                                ))}
                            </select>


                            <select
                                value={editorTheme}
                                onChange={(e) => setEditorTheme(e.target.value)}
                                className="px-4 py-2 bg-[#F0F1F3] rounded-sm text-[#3A0CA3] border border-[#E0E0E0] focus:ring-2 focus:ring-[#F72585]"
                            >
                                <option value="github">Light Theme</option>
                                {/* <option value="monokai">Dark Theme</option> */}
                                <option value="dark">Dark Theme</option>
                            </select>
                        </div>
                        <CodeMirror
                            value={code}
                            height="400px"
                            extensions={[
                                selectedLanguage === 'javascript' ? javascript() :
                                    selectedLanguage === 'python' ? python() :
                                        selectedLanguage === 'cpp' ? cpp() :
                                            selectedLanguage === 'java' ? java() : javascript(), // Default fallback
                            ]}
                            theme={editorTheme === 'dark' ? oneDark : undefined} // Default theme or dark theme
                            onChange={(value) => setCode(value)} // Updates the state with the editor's content
                            basicSetup={{
                                lineNumbers: true,
                                autocompletion: true,
                                highlightActiveLine: true,
                            }}
                            className="border border-[#E0E0E0] rounded-sm text-sm"
                        />

                        <div className="flex gap-2 mt-4">
                            <button
                                className={`flex items-center gap-2 px-4 py-2 bg-[#F72585] text-[#FFFFFF] rounded-sm hover:bg-opacity-90 
    ${isExecutionStart ? 'bg-[#F72585]/50 cursor-not-allowed opacity-50' : ''}`}
                                onClick={(e) => handleRunCode(e)}
                                disabled={isExecutionStart}
                            >
                                <FaPlay /> Run Code
                            </button>

                            <button className={`flex items-center gap-2 px-4 py-2 bg-[#20D761] text-[#1F202A] rounded-sm hover:bg-opacity-90 ${isExecutionStart ? `cursor-not-allowed opacity-50` : ``}`}
                                onClick={(e) => handleSubmitCode(e)}
                                disabled={isExecutionStart}
                            >
                                <FaCode /> Submit
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F1F3] text-[#3A0CA3] rounded-sm hover:bg-opacity-90"
                                onClick={(e) => setCode("")}
                            >
                                <BiReset /> Clear
                            </button>
                        </div>
                    </div>

                    <div className="p-4 ">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Test Cases</h2>
                            {/* <button
                                onClick={handleAddTestCase}
                                className="flex items-center gap-2 px-4 py-2 bg-[#F0F1F3] text-[#7209B7] rounded-sm hover:bg-opacity-90"
                            >
                                <FaPlus /> Add Test Case
                            </button> */}
                        </div>

                        <div className="space-y-4">
                            {testCases.slice(0, 2).map((testCase, index) => (
                                <div key={index} className="p-4 bg-card border border-[#E0E0E0] rounded-sm">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-semibold text-[#3A0CA3]">Test Case {index + 1}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-[#3A0CA3] mb-1">Input</label>
                                            <textarea
                                                className="w-full p-2 bg-[#F0F1F3] rounded-sm border border-[#E0E0E0] focus:ring-2 focus:ring-[#F72585] cursor-not-allowed"
                                                rows="3"
                                                value={testCase.input}
                                                readOnly
                                                style={{ resize: 'none' }} // Prevent resizing

                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#3A0CA3] mb-1">Expected Output</label>
                                            <textarea
                                                className="w-full p-2 bg-[#F0F1F3] rounded-sm border border-[#E0E0E0] focus:ring-2 focus:ring-[#F72585] cursor-not-allowed"
                                                rows="3"
                                                value={testCase.output}
                                                readOnly
                                                style={{ resize: 'none' }} // Prevent resizing
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Now here show Output code  */}
                        </div>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center p-8">
                    <svg
                        className="animate-spin h-12 w-12 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                    </svg>
                    <p className="text-lg text-blue-500 mt-4">Loading, please wait...</p>
                </div>
            )}
            {isExecuted && !isLoading && (
                <div className="p-8">
                    <h1 className="text-[28px] font-semibold text-[#3A0CA3]">Output</h1>
                    <div className="p-2 bg-[#F7F8FA] rounded-sm border border-[#E0E0E0] flex justify-between items-start">
                        <div className="text-xl text-green-800 whitespace-pre-line">
                            {output || "No output available"}
                        </div>
                    </div>
                </div>
            )
            }
            {
                isError && !isLoading && (
                    <div className="p-8">
                        <h1 className="text-[28px] font-semibold text-[#3A0CA3]">Output</h1>
                        <div className="p-2 bg-[#F7F8FA] rounded-sm border border-[#E0E0E0] flex justify-between items-start">
                            <div className="text-xl text-red-800 whitespace-pre-line">
                                {output || "No output available"}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Mobile Toggle Button */}
            <button
                className="fixed bottom-4 right-4 lg:hidden p-4 bg-[#F72585] text-[#FFFFFF] rounded-full shadow-lg"
                onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
            >
                <FaCode />
            </button>
        </div>
    );
};

export default CodingProblemPlatform;
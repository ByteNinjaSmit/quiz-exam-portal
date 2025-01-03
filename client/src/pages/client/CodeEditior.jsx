import React, { useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import { FaBookmark, FaCode, FaPlay, FaDownload, FaTimes, FaPlus, FaLandmark, FaSyncAlt } from "react-icons/fa";
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
const CodingPlatform = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [editorTheme, setEditorTheme] = useState("dark");
  const [code, setCode] = useState(boilerplate.python);
  const [testCases, setTestCases] = useState([]);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(true);
  const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
  const [errorMessage, setErrorMessage] = useState(null);
  const [output, setOutput] = useState(null);
  const languages = [
    { id: "python", name: "Python", icon: "🐍" },
    { id: "cpp", name: "C++", icon: "⚡" },
    { id: "java", name: "Java", icon: "☕" }
  ];

  // For Error And Proper Execute State
  const [isError, setIsError] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [isExecutionStart, setIsExecutionStart] = useState(false);
  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  const problemData = {
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    constraints: "2 <= nums.length <= 104\n-109 <= nums[i] <= 109\n-109 <= target <= 109",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]"
      }
    ],
    stats: {
      submissions: 12500,
      accuracy: "65%",
      runtime: "85ms"
    }
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
            // console.log(`Upload Progress: ${progress}%`);
          },
        },
      );

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

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="flex flex-col lg:flex-row overflow-y-auto">
        {/* Left Panel */}
        <div className={`${isDescriptionVisible ? "block" : "hidden"} lg:block lg:w-2/5 bg-card p-6 border-r border-[#E0E0E0]`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[28px] font-semibold text-[#3A0CA3]">{problemData.title}</h1>
            <button className="p-2 hover:bg-[#F0F1F3] rounded-sm">
              <FaBookmark className="text-[#3A0CA3]" />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-[#F72585] text-[#FFFFFF] rounded-sm text-sm">
              {problemData.difficulty}
            </span>
            {problemData.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-[#F0F1F3] text-[#7209B7] rounded-sm text-sm">
                #{tag}
              </span>
            ))}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Description</h2>
              <p className="text-body text-[#3A0CA3]">{problemData.description}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Constraints</h2>
              <pre className="bg-[#F0F1F3] p-4 rounded-sm text-sm">{problemData.constraints}</pre>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Examples</h2>
              {problemData.examples.map((example, index) => (
                <div key={index} className="bg-[#F0F1F3] p-4 rounded-sm space-y-2">
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
                  <p className="font-semibold">{problemData.stats.submissions}</p>
                </div>
                <div className="bg-[#F0F1F3] p-4 rounded-sm text-center">
                  <p className="text-sm text-[#3A0CA3]">Accuracy</p>
                  <p className="font-semibold">{problemData.stats.accuracy}</p>
                </div>
                <div className="bg-[#F0F1F3] p-4 rounded-sm text-center">
                  <p className="text-sm text-[#3A0CA3]">Avg Runtime</p>
                  <p className="font-semibold">{problemData.stats.runtime}</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-[#E0E0E0]">
            <div className="flex items-center gap-4 mb-4">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="px-4 py-2 bg-[#F0F1F3] rounded-sm text-[#3A0CA3] border border-[#E0E0E0] focus:ring-2 focus:ring-[#F72585]"
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
                <option value="monokai">Dark Theme</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* <AceEditor
              mode={selectedLanguage}
              theme={editorTheme}
              onChange={setCode}
              value={code}
              name="code-editor"
              width="100%"
              height="400px"
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
              className="border border-[#E0E0E0] rounded-sm text-sm"
            /> */}

            {/* <MonacoEditor
              language={selectedLanguage} // Example: 'javascript', 'python', 'cpp', etc.
              theme={editorTheme === 'dark' ? 'vs-dark' : 'vs-light'} // Monaco themes
              value={code}
              onChange={(value) => setCode(value)} // Updates the state with the editor's content
              options={{
                automaticLayout: true, // Adjust layout automatically
                wordWrap: 'on', // Enable word wrapping
                minimap: { enabled: false }, // Disable the minimap
                fontSize: 14,
                scrollBeyondLastLine: false, // Prevent scrolling beyond content
              }}
              height="400px"
              className="border border-[#E0E0E0] rounded-sm text-sm"
            />; */}

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

              <button className="flex items-center gap-2 px-4 py-2 bg-accent text-[#7209B7] rounded-sm hover:bg-opacity-90">
                <FaCode /> Submit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F1F3] text-[#3A0CA3] rounded-sm hover:bg-opacity-90"
                onClick={(e) => setCode("")}
              >
                <BiReset /> Clear
              </button>
              {/* <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F1F3] text-[#3A0CA3] rounded-sm hover:bg-opacity-90">
                <FaDownload /> Download
              </button> */}
            </div>
          </div>

          <div className="p-4 ">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#3A0CA3] mb-2">Test Cases</h2>
              <button
                onClick={handleAddTestCase}
                className="flex items-center gap-2 px-4 py-2 bg-[#F0F1F3] text-[#7209B7] rounded-sm hover:bg-opacity-90"
              >
                <FaPlus /> Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="p-4 bg-card border border-[#E0E0E0] rounded-sm">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-[#3A0CA3]">Test Case {index + 1}</h3>
                    <button
                      onClick={() => setTestCases(testCases.filter((_, i) => i !== index))}
                      className="text-[#FF4C4C] hover:text-opacity-90"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="yourInput" className="block text-sm text-[#3A0CA3] mb-1">Input</label>
                      <textarea
                        className="w-full p-2 bg-[#F0F1F3] rounded-sm border border-[#E0E0E0] focus:ring-2 focus:ring-[#F72585]"
                        rows="3"
                        value={testCase.input}
                        onChange={(e) => {
                          const newTestCases = [...testCases];
                          newTestCases[index].input = e.target.value;
                          setTestCases(newTestCases);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#3A0CA3] mb-1">Expected Output</label>
                      <textarea
                        className="w-full p-2 bg-[#F0F1F3] rounded-sm border border-[#E0E0E0] focus:ring-2 focus:ring-[#F72585]"
                        rows="3"
                        value={testCase.expectedOutput}
                        onChange={(e) => {
                          const newTestCases = [...testCases];
                          newTestCases[index].expectedOutput = e.target.value;
                          setTestCases(newTestCases);
                        }}
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

export default CodingPlatform;
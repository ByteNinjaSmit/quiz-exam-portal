import React, { useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import { FaBookmark, FaCode, FaPlay, FaDownload, FaTimes, FaPlus } from "react-icons/fa";
import { BiReset } from "react-icons/bi";

const CodingPlatform = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [editorTheme, setEditorTheme] = useState("github");
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(true);

  const languages = [
    { id: "python", name: "Python", icon: "🐍" },
    { id: "javascript", name: "JavaScript", icon: "⚡" },
    { id: "java", name: "Java", icon: "☕" }
  ];

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

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", result: null }]);
  };
  console.log(code);
  
  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left Panel */}
        <div className={`${isDescriptionVisible ? "block" : "hidden"} lg:block lg:w-2/5 bg-card p-6 overflow-y-auto border-r border-[#E0E0E0]`}>
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
                onChange={(e) => setSelectedLanguage(e.target.value)}
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
              </select>
            </div>

            <AceEditor
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
            />

            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#F72585] text-[#FFFFFF] rounded-sm hover:bg-opacity-90">
                <FaPlay /> Run Code
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-accent text-[#7209B7] rounded-sm hover:bg-opacity-90">
                <FaCode /> Submit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F1F3] text-[#3A0CA3] rounded-sm hover:bg-opacity-90">
                <BiReset /> Clear
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F1F3] text-[#3A0CA3] rounded-sm hover:bg-opacity-90">
                <FaDownload /> Download
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto">
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
                      <label className="block text-sm text-[#3A0CA3] mb-1">Input</label>
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
            </div>
          </div>
        </div>
      </div>

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
import React, { useState } from "react";
import { AiOutlineFileText, AiOutlinePlus, AiOutlineCode, AiOutlineCheckCircle, AiOutlineMinusCircle, AiOutlineInfoCircle, AiOutlineFileSearch } from "react-icons/ai";
import { MdStars, MdArrowBack } from "react-icons/md";
import { FaTags, FaClock, FaMemory, FaRegLightbulb, FaCode, FaQuestion, FaRegClock } from "react-icons/fa";
import { BiDetail } from "react-icons/bi";
import { PiStudentBold } from "react-icons/pi";
import { RiErrorWarningLine } from "react-icons/ri";
import { IoCalendarOutline, IoChevronBackCircle } from "react-icons/io5";
import { GrScorecard } from "react-icons/gr";

import { FiAlertCircle } from "react-icons/fi";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../store/auth";
import { toast } from "react-toastify";
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
const CodingContestForm = () => {
    const { user, isLoggedIn, authorizationToken, API } = useAuth(); // Custom hook from AuthContext3
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        title: "",
        difficulty: "",
        language: " ",
        tags: [],
        description: "",
        code: "",
        constraints: "",
        examples: [{ input: "", output: "" }],
        timeComplexity: "",
        spaceComplexity: "",
        solution: "",
        categories: [],
        difficultyExplanation: "",
        testCases: [{ input: "", output: "" }],
        startTime: "",
        endTime: "",
        classyear: "",
        score: "",
        createdBy: user?._id,

    });

    const [errors, setErrors] = useState({});

    const difficultyOptions = ["Easy", "Medium", "Hard"];
    const classyearOptions = ["ALL", "FY", "SY", "TY", "B.Tech"];
    const languageOptions = ["cpp", "java", "python"];
    const tagOptions = ["Arrays", "Strings", "LinkedList", "Trees", "Graphs", "DP"];
    const categoryOptions = ["Array", "Dynamic-Programming", "Graph", "Tree", "String"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };
    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setFormData((prev) => ({
            ...prev,
            language: lang,
            code: boilerplate[lang] || "", // Default to empty if no boilerplate for selected language
        }));
    };

    const handleClassChange = (e) => {
        const classyear = e.target.value;
        setFormData((prev) => ({
            ...prev,
            classyear: classyear,
        }));
    };

    const handleTagChange = (tag) => {
        const updatedTags = formData.tags.includes(tag)
            ? formData.tags.filter((t) => t !== tag)
            : [...formData.tags, tag];
        setFormData({ ...formData, tags: updatedTags });
    };

    const handleCategoryChange = (category) => {
        const updatedCategories = formData.categories.includes(category)
            ? formData.categories.filter((c) => c !== category)
            : [...formData.categories, category];
        setFormData({ ...formData, categories: updatedCategories });
    };

    const addExample = () => {
        setFormData({
            ...formData,
            examples: [...formData.examples, { input: "", output: "" }]
        });
    };

    const removeExample = (index) => {
        const updatedExamples = formData.examples.filter((_, i) => i !== index);
        setFormData({ ...formData, examples: updatedExamples });
    };

    const addTestCase = () => {
        setFormData({
            ...formData,
            testCases: [...formData.testCases, { input: "", output: "" }]
        });
    };

    const removeTestCase = (index) => {
        const updatedTestCases = formData.testCases.filter((_, i) => i !== index);
        setFormData({ ...formData, testCases: updatedTestCases });
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
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.difficulty) newErrors.difficulty = "Difficulty is required";
        if (!formData.description) newErrors.description = "Description is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Ensure startTime is properly converted before sending the request
        const updatedFormData = {
            ...formData,
            startTime: convertToISTAndFormatForMongo(formData.startTime),
            endTime:convertToISTAndFormatForMongo(formData.endTime),
        };


        try {
            const response = await axios.post(`${API}/api/problem/new-coding-contest`, updatedFormData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authorizationToken,
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                console.log("Problem created successfully:", response.data);
                toast.success(response.data.message);
                navigate("/admin/dashboard/contest")
                setFormData({
                    name: "",
                    title: "",
                    difficulty: "",
                    language: "",
                    tags: [],
                    description: "",
                    code: "",
                    constraints: "",
                    examples: [{ input: "", output: "" }],
                    timeComplexity: "",
                    spaceComplexity: "",
                    solution: "",
                    categories: [],
                    difficultyExplanation: "",
                    testCases: [{ input: "", output: "" }],
                    startTime: "",
                    endTime: "",
                    classyear: "",
                    score: "",
                    createdBy: user?._id,
                })
                // Handle success, clear the form, or navigate to another page
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            if (error.response) {
                console.error("Server Error:", error.response.data.error);
            }
        }

        console.log("Form submitted:", formData);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFB] p-4 md:p-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h1 className="text-2xl font-semibold text-purple-800">Create Coding Contest</h1>
                    <Link to={`/admin/dashboard/contest`}>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                            <MdArrowBack /> Back
                        </button>
                    </Link>
                </div>

                {/*Contest Title Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FaCode className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Contest Name</label>
                    </div>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        maxLength={100}
                        placeholder="Enter the Name of Contest"
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Contest Name"
                    />
                    {errors.name && (
                        <div className="flex items-center gap-1 ring-[#FF4C4C] mt-1">
                            <FiAlertCircle />
                            <span>{errors.name}</span>
                        </div>
                    )}
                </div>


                {/*Problem  Title Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <AiOutlineFileText className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Problem Title</label>
                    </div>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        maxLength={100}
                        placeholder="Enter the title of the problem"
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Problem title"
                    />
                    {errors.title && (
                        <div className="flex items-center gap-1 ring-[#FF4C4C] mt-1">
                            <FiAlertCircle />
                            <span>{errors.title}</span>
                        </div>
                    )}
                </div>
                {/* Class Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <PiStudentBold className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Select Class</label>
                    </div>
                    <select
                        name="classyear"
                        value={formData.classyear}
                        onChange={handleClassChange}
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Difficulty level"
                    >
                        <option value="">Select Difficulty</option>
                        {classyearOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Timimg  */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <label className=" text-sm font-semibold mb-2 flex items-center">
                            <FaRegClock className="text-[#F72585] text-xl mr-2" />
                            Start Time
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            value={formData.startTime}
                            onChange={(e) =>
                                setFormData({ ...formData, startTime: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold mb-2 flex items-center">
                            <FaRegClock className="text-[#F72585] text-xl mr-2" />
                            End Time
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            value={formData.endTime}
                            onChange={(e) =>
                                setFormData({ ...formData, endTime: e.target.value })
                            }
                        />
                    </div>
                </div>
                {/* Set Score */}
                <div className="mb-6 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                        <GrScorecard className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Set Score (0-1000)</label>
                    </div>
                    <input
                        type="number"
                        name="score"
                        required
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                        maxLength={100}
                        placeholder="Enter Score of Contest"
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Contest Score"
                    />
                    {errors.score && (
                        <div className="flex items-center gap-1 ring-[#FF4C4C] mt-1">
                            <FiAlertCircle />
                            <span>{errors.score}</span>
                        </div>
                    )}
                </div>
                {/* Difficulty Section */}
                <div className="mb-6 ">
                    <div className="flex items-center gap-2 mb-2">
                        <MdStars className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Difficulty Level</label>
                    </div>
                    <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Difficulty level"
                    >
                        <option value="">Select Difficulty</option>
                        {difficultyOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Language Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <MdStars className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Select Language</label>
                    </div>
                    <select
                        name="difficulty"
                        value={formData.language}
                        onChange={handleLanguageChange}
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Difficulty level"
                    >
                        <option value="">Select Language</option>
                        {languageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tags Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FaTags className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Tags</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tagOptions.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => handleTagChange(tag)}
                                className={`px-3 py-1 rounded-full ${formData.tags.includes(tag)
                                    ? "bg-[#F72585] text-[#FFFFFF]"
                                    : "bg-[#F0F1F3] text-[#7209B7]"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <BiDetail className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Problem Description</label>
                    </div>
                    <textarea
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide a clear problem statement"
                        className="w-full p-3 border rounded-md h-32 focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Problem description"
                    />
                </div>
                {/* Inital Code Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <BiDetail className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Initial Code</label>
                    </div>
                    <MonacoEditor
                        language={formData.language} // Example: 'javascript', 'python', 'cpp', etc.
                        theme={'vs-dark'} // Monaco themes
                        value={formData.code}
                        onChange={(value) => setFormData({ ...formData, code: value })} // Use the value directly
                        options={{
                            automaticLayout: true, // Adjust layout automatically
                            wordWrap: 'on', // Enable word wrapping
                            minimap: { enabled: false }, // Disable the minimap
                            fontSize: 14,
                            scrollBeyondLastLine: false, // Prevent scrolling beyond content
                        }}
                        height="400px"
                        className="border border-[#E0E0E0] rounded-sm text-sm"
                        placeholder="Enter code"
                    />
                </div>

                {/* Constraints Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <BiDetail className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Problem Constraints</label>
                    </div>
                    <textarea
                        name="constraints"
                        value={formData.constraints}
                        onChange={handleInputChange}
                        placeholder="Provide a clear problem constraints"
                        className="w-full p-3 border rounded-md h-32 focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Problem constraints"
                    />
                </div>

                {/* Examples Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <AiOutlineFileSearch className="text-[#F72585] text-xl" />
                            <label className="text-[16px] font-semibold">Examples</label>
                        </div>
                        <button
                            type="button"
                            onClick={addExample}
                            className="flex items-center gap-1 text-[#F72585] hover:text-[#3A0CA3]"
                        >
                            <AiOutlinePlus /> Add Example
                        </button>
                    </div>
                    {formData.examples.map((example, index) => (
                        <div key={index} className="mb-4 p-4 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">Example {index + 1}</span>
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeExample(index)}
                                        className="ring-[#FF4C4C]"
                                    >
                                        <AiOutlineMinusCircle />
                                    </button>
                                )}
                            </div>
                            <div className="grid gap-4">
                                <textarea
                                    placeholder="Input"
                                    value={example.input}
                                    onChange={(e) => {
                                        const newExamples = [...formData.examples];
                                        newExamples[index].input = e.target.value;
                                        setFormData({ ...formData, examples: newExamples });
                                    }}
                                    className="w-full p-2 border rounded-md"
                                />
                                <textarea
                                    placeholder="Output"
                                    value={example.output}
                                    onChange={(e) => {
                                        const newExamples = [...formData.examples];
                                        newExamples[index].output = e.target.value;
                                        setFormData({ ...formData, examples: newExamples });
                                    }}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Complexity Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-[#F72585] text-xl" />
                            <label className="text-[16px] font-semibold">Time Complexity</label>
                        </div>
                        <input
                            type="text"
                            name="timeComplexity"
                            value={formData.timeComplexity}
                            onChange={handleInputChange}
                            placeholder="O(n)"
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FaMemory className="text-[#F72585] text-xl" />
                            <label className="text-[16px] font-semibold">Space Complexity</label>
                        </div>
                        <input
                            type="text"
                            name="spaceComplexity"
                            value={formData.spaceComplexity}
                            onChange={handleInputChange}
                            placeholder="O(n)"
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Categories Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FaCode className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Categories</label>
                    </div>
                    <div className="grid md:grid-cols-3 gap-2">
                        {categoryOptions.map((category) => (
                            <label
                                key={category}
                                className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-[#F0F1F3]"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.categories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                    className="form-checkbox text-[#F72585]"
                                />
                                <span>{category}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Solution Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <BiDetail className="text-[#F72585] text-xl" />
                        <label className="text-[16px] font-semibold">Problem Solution</label>
                    </div>
                    <textarea
                        name="solution"
                        value={formData.solution}
                        onChange={handleInputChange}
                        placeholder="Provide Clear Solution Of Problem / Code"
                        className="w-full p-3 border rounded-md h-32 focus:ring-2 focus:ring-[#F72585] focus:border-transparent"
                        aria-label="Problem Solution"
                    />
                </div>

                {/* Test Cases Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <AiOutlineFileSearch className="text-[#F72585] text-xl" />
                            <label className="text-[16px] font-semibold">Test Cases</label>
                        </div>
                        <button
                            type="button"
                            onClick={addTestCase}
                            className="flex items-center gap-1 text-[#F72585] hover:text-[#3A0CA3]"
                        >
                            <AiOutlinePlus /> Add Test Case
                        </button>
                    </div>
                    {formData.testCases.map((testcase, index) => (
                        <div key={index} className="mb-4 p-4 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">Test Case {index + 1}</span>
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTestCase(index)}
                                        className="ring-[#FF4C4C]"
                                    >
                                        <AiOutlineMinusCircle />
                                    </button>
                                )}
                            </div>
                            <div className="grid gap-4">
                                <textarea
                                    placeholder="Input Of Test Cases"
                                    value={testcase.input}
                                    onChange={(e) => {
                                        const newTestcase = [...formData.testCases];
                                        newTestcase[index].input = e.target.value;
                                        setFormData({ ...formData, testCases: newTestcase });
                                    }}
                                    className="w-full p-2 border rounded-md"
                                />
                                <textarea
                                    placeholder="Output / Expected Output of Testcase"
                                    value={testcase.output}
                                    onChange={(e) => {
                                        const newTestcase = [...formData.testCases];
                                        newTestcase[index].output = e.target.value;
                                        setFormData({ ...formData, testCases: newTestcase });
                                    }}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Submit Button */}
                <div className="sticky bottom-4 bg-card p-4 rounded-lg shadow-lg">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-[#F72585] text-[#FFFFFF] py-3 px-6 rounded-md hover:bg-[#3A0CA3] transition-colors"
                    >
                        <AiOutlineCheckCircle className="text-xl" />
                        Submit Problem
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CodingContestForm;
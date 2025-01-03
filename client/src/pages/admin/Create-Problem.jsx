import React, { useState } from "react";
import { AiOutlineFileText, AiOutlinePlus, AiOutlineCode, AiOutlineCheckCircle, AiOutlineMinusCircle, AiOutlineInfoCircle, AiOutlineFileSearch } from "react-icons/ai";
import { MdStars, MdArrowBack } from "react-icons/md";
import { FaTags, FaClock, FaMemory, FaRegLightbulb, FaCode } from "react-icons/fa";
import { BiDetail } from "react-icons/bi";
import { RiErrorWarningLine } from "react-icons/ri";
import { FiAlertCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

const CodingProblemForm = () => {
    const [formData, setFormData] = useState({
        title: "",
        difficulty: "",
        tags: [],
        description: "",
        constraints: "",
        examples: [{ input: "", output: "" }],
        timeComplexity: "",
        spaceComplexity: "",
        solution: "",
        categories: [],
        difficultyExplanation: "",
        testCases: [{ input: "", output: "" }]
    });

    const [errors, setErrors] = useState({});

    const difficultyOptions = ["Easy", "Medium", "Hard"];
    const tagOptions = ["Arrays", "Strings", "LinkedList", "Trees", "Graphs", "DP"];
    const categoryOptions = ["Array", "Dynamic-Programming", "Graph", "Tree", "String"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.difficulty) newErrors.difficulty = "Difficulty is required";
        if (!formData.description) newErrors.description = "Description is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        console.log("Form submitted:", formData);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFB] p-4 md:p-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h1 className="text-2xl font-semibold text-purple-800">Create Coding Problem</h1>
                    <Link to={`/admin/dashboard`}>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                            <MdArrowBack /> Back
                        </button>
                    </Link>
                </div>


                {/* Title Section */}
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

                {/* Difficulty Section */}
                <div className="mb-6">
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

export default CodingProblemForm;
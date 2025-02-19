const CodeProblem = require("../database/models/code-problem-model");
const CodeSubmission = require("../database/models/code-submission-model");
const mongoose = require('mongoose');

// Controller to create a new coding problem
const createProblem = async (req, res, next) => {
    try {
        const {
            title,
            difficulty,
            code,
            language,
            tags,
            description,
            constraints,
            examples,
            timeComplexity,
            spaceComplexity,
            solution,
            categories,
            testCases,

        } = req.body;

        // Validate mandatory fields
        if (!title || !difficulty || !description || !constraints || !examples.length || !testCases.length || !code || !language) {
            return res.status(400).json({
                message: "Title, difficulty, description, constraints, examples, and test cases are required fields."
            });
        }

        // Validate difficulty
        const validDifficulties = ["Easy", "Medium", "Hard"];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ message: "Invalid difficulty level." });
        }
        const validLanguage = ["cpp", "java", "python"];
        if (!validLanguage.includes(language)) {
            return res.status(400).json({ message: "Invalid Selected language." });
        }
        // Validate examples and test cases structure
        if (!Array.isArray(examples) || !examples.every(e => e.input && e.output)) {
            return res.status(400).json({ message: "Each example must have an input and output." });
        }
        if (!Array.isArray(testCases) || !testCases.every(tc => tc.input && tc.output)) {
            return res.status(400).json({ message: "Each test case must have an input and output." });
        }

        // Create a new problem instance
        const newProblem = new CodeProblem({
            title,
            difficulty,
            code,
            language,
            tags,
            description,
            constraints,
            examples,
            timeComplexity,
            spaceComplexity,
            solution,
            category: categories,
            testCases
        });

        // Save the problem to the database
        const savedProblem = await newProblem.save();

        return res.status(200).json({
            message: "Coding problem created successfully.",
        });
    } catch (error) {
        console.error("Error creating problem:", error);
        next(error); // Pass error to the error-handling middleware
    }
};


// Controller to get a particular problem by ID
const getProblemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Problem ID is required." });
        }
        const problem = await CodeProblem.findById(id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        return res.status(200).json({ problem });
    } catch (error) {
        console.error("Error fetching problem by ID:", error);
        next(error);
    }
};

const getProblems = async (req, res, next) => {
    try {
        const problems = await CodeProblem.find().select('title difficulty category');
        return res.status(200).json({ problems });
    } catch (error) {
        next(error);
    }
};

const submitSubmission = async (req, res, next) => {
    try {
        const { problemId, userId, code, accuracy, avgRuntime, testCasesPassed, output, isSuccessfullyRun } = req.body;

        // Validate required fields
        if (!problemId || !userId || !code || !output || accuracy === undefined || avgRuntime === undefined || testCasesPassed === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Check if problemId and userId are valid MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ success: false, message: "Invalid problemId." });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId." });
        }

        // Create a new submission entry
        const newSubmission = new CodeSubmission({
            problemId,
            userId,
            code,
            output,
            accuracy,
            avgRuntime,
            testCasesPassed,
            isSuccessfullyRun,
        });

        // Save to the database
        await newSubmission.save();

        res.status(200).json({
            success: true,
            message: "Code submission recorded successfully.",
        });

    } catch (error) {
        console.error("Error submitting code:", error);
        next(error);
    }
};


const getAllSubmissionByUserByProblem = async (req, res, next) => {
    try {

        const { problemId, userId } = req.params;

        // Validate input
        if (!problemId || !userId) {
            return res.status(400).json({ success: false, message: "Invalid problemId or userId." });
        }

        // Validate MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ success: false, message: "Invalid problemId." });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId." });
        }

        // Fetch submissions
        const submissions = await CodeSubmission.find({ problemId, userId });
        // Send response
        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        console.error("Error in getAllSubmissionByUserByProblem:", error);
        next(error); // Pass error to middleware
    }
};

const deleteProblemById = async (req, res, next) => {
    try {
        const { problemId } = req.params;
        if (!problemId) {
            return res.status(400).json({ success: false, message: "Invalid problemId." });
        }
        // Validate MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ success: false, message: "Invalid problemId." });
        }
        // Find And Delte from CodeProblem _id: problemId
        // Find and Delete All from CodeSubmission problemId:problemId
        const deletedProblem = await CodeProblem.findByIdAndDelete(problemId);
        if (!deletedProblem) {
            return res.status(404).json({ success: false, message: "Problem not found." });
        }
        // Delete all submissions related to the problem
        await CodeSubmission.deleteMany({ problemId });
        console.log(`Problem ${problemId} and related submissions deleted successfully.`);
        
        return res.status(200).json({ success: true, message: "Problem and related submissions deleted successfully." });
    } catch (error) {
        console.error("Error in Delete Problem: ", error);

        next(error);
    }
}



module.exports = { createProblem, getProblemById, getProblems, submitSubmission, getAllSubmissionByUserByProblem, deleteProblemById};
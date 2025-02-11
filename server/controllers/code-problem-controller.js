const CodeProblem = require("../database/models/code-problem-model");


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
            testCases
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
        if(!id){
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



module.exports = { createProblem, getProblemById,getProblems };
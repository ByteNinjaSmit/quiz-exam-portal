const mongoose = require('mongoose');

const codeProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"], // Restricting values to predefined difficulties
        required: true,
    },
    language:{
        type: String,
        enum: ["cpp", "java", "python"], // Restricting values to predefined difficulties
        required: true,
    },
    code:{
        type: String,
        required:true,
    },
    tags: {
        type: [String], // Array of strings
        default: [],
    },
    description: {
        type: String,
        required: true,
    },
    constraints: {
        type: String,
        required: true,
    },
    timeComplexity: {
        type: String,
    },
    spaceComplexity: {
        type: String,
    },
    solution: {
        type: String,
    },
    category: {
        type: [String], // Array of categories
    },
    examples: {
        type: [
            {
                input: { type: String, required: true }, // Example input
                output: { type: String, required: true }, // Example output
            }
        ],
        required: true, // At least one example is mandatory
    },
    testCases: {
        type: [
            {
                input: { type: String, required: true }, // Example input
                output: { type: String, required: true }, // Example output
            }
        ],
        required: true, // At least one example is mandatory
    },
}, { timestamps: true });

const CodeProblem = mongoose.model('CodeProblem', codeProblemSchema);
module.exports = CodeProblem;

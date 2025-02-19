const mongoose = require('mongoose');

const codeContestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"], // Restricting values to predefined difficulties
        required: true,
    },
    language: {
        type: String,
        enum: ["cpp", "java", "python"], // Restricting values to predefined difficulties
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    classyear: {
        type: String,
        required: true,
      },
    score: {
        type: Number,  
        required: true
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
    startTime: {
        type: String,
        required: true, // Ensure a start time is set
    },
    endTime: {
        type: String,
        required: true, // Ensure an end time is set
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
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

const CodeContest = mongoose.model('CodeContest',codeContestSchema);
module.exports = CodeContest;

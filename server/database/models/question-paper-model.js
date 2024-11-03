const mongoose = require('mongoose');

// Define the schema for options
const optionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

// Define the schema for questions
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [optionSchema], // Array of options
  timeLimit: {
    type: Number, // Time for each question in seconds or minutes
    required: true,
  },
  image: {
    type: String,
  },
  maxPoint: {
    type: Number,
    required: true
  },
});

// Define the schema for the question paper
const questionPaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  classyear: {
    type: String,
    required: true,
  },
  questions: [questionSchema], // Array of questions
  startTime: {
    type: Date,
    required: true, // Ensure a start time is set
  },
  endTime: {
    type: Date,
    required: true, // Ensure an end time is set
  },
  paperKey: {
    type: String,
    required: true, // Make the paperKey mandatory
  },
  currentQuestionIndex: { type: Number, default: 0 },
}, { timestamps: true }
);

// Create models
const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
module.exports = QuestionPaper;
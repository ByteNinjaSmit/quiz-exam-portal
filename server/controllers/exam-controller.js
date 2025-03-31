// controllers/exam-controller.js
const QuestionPaper = require("../database/models/question-paper-model");
const Result = require("../database/models/result-model");
const Cheat = require("../database/models/cheat-model");
const User = require("../database/models/user-model");
const fs = require('fs');
const mongoose = require('mongoose');

const path = require('path');
// Variables For Question Paper Broadcasting Logic

let examStartTime;
let examEndTime;
// let currentQuestionIndex = 0;
// let questionPaper = null;
const activeTimers = {}; // Store active timers per paperKey
const examData = new Map(); // Key: paperKey, Value: { questionPaper, currentQuestionIndex, examStartTime, examEndTime }

// Load the question paper from the database
async function loadQuestionPaper(title, paperKey) {
    if (examData.has(paperKey)) return examData.get(paperKey).questionPaper; // Use existing data

    try {
        const questionPaper = await QuestionPaper.findOne({ title, paperKey }); // Include paperKey in the query
        if (questionPaper) {
            console.log(`Loaded question paper for ${paperKey}:`, questionPaper.title);
            examData.set(paperKey, {
                questionPaper,
                currentQuestionIndex: questionPaper.currentQuestionIndex || 0,
                examStartTime: new Date(questionPaper.startTime).getTime(),
                examEndTime: new Date(questionPaper.endTime).getTime()
            });
        }
        return questionPaper; // Return the question paper
    } catch (error) {
        console.error("Failed to load question paper:", error);
        return null; // Return null if there's an error
    }
}

// Calculate the current question index based on elapsed time
function getElapsedQuestionIndex(paperKey) {
    const exam = examData.get(paperKey);
    if (!exam) return 0;
    const { questionPaper, examStartTime } = exam;
    const timeElapsed = (Date.now() - examStartTime) / 1000;
    let cumulativeTime = 0;
    for (let i = 0; i < questionPaper.questions.length; i++) {
        cumulativeTime += questionPaper.questions[i].timeLimit;
        if (timeElapsed < cumulativeTime) return i;
    }
    return questionPaper.questions.length - 1;
}
// Start the exam and broadcast the first question
function startExam(io, paperKey) {
    console.log("Starting the exam...");
    broadcastCurrentQuestion(io, paperKey);
}

// Broadcast the current question
async function broadcastCurrentQuestion(io, paperKey) {
    const exam = examData.get(paperKey);
    if (!exam) return;
    const { questionPaper, examStartTime, examEndTime } = exam;

    const currentTime = Date.now();
    if (currentTime >= examEndTime) {
        endExam(io, paperKey);
        return;
    }

    exam.currentQuestionIndex = getElapsedQuestionIndex(paperKey);
    const currentQuestion = questionPaper.questions[exam.currentQuestionIndex];
    const cumulativeTime = questionPaper.questions.slice(0, exam.currentQuestionIndex).reduce((total, q) => total + q.timeLimit, 0);
    const timeSpentOnCurrentQuestion = (currentTime - examStartTime) / 1000 - cumulativeTime;
    const remainingTime = (currentQuestion.timeLimit - timeSpentOnCurrentQuestion) * 1000;

    console.log(`Broadcasting Question ${exam.currentQuestionIndex + 1} for ${paperKey}:`, currentQuestion.questionText);

    io.to(paperKey).emit("question", {
        question: currentQuestion,
        questionIndex: exam.currentQuestionIndex + 1,
        remainingTime: remainingTime / 1000,
    });

    await QuestionPaper.updateOne(
        { title: questionPaper.title, paperKey },
        { currentQuestionIndex: exam.currentQuestionIndex }
    );

    setTimeout(() => {
        broadcastCurrentQuestion(io, paperKey);
    }, remainingTime);
}

// End the exam
function endExam(io, paperKey) {
    io.to(paperKey).emit("examEnd", { message: "Exam has ended" });
    console.log(`Exam ended for room: ${paperKey}`);
}

// Check if it's time to start the exam
function checkAndStartExam(io, paperKey) {
    const exam = examData.get(paperKey);
    if (!exam) return;
    const { examStartTime, examEndTime } = exam;
    const now = Date.now();

    if (now >= examStartTime && now <= examEndTime) {
        startExam(io, paperKey);
    } else {
        console.log(`Waiting for scheduled start time for ${paperKey}`);
        setTimeout(() => startExam(io, paperKey), examStartTime - now);
    }
}

// Handle new client connections
function handleSocketConnection(io) {
    io.on("connection", (socket) => {
        console.log("New client connected");

        socket.on("loadExam", async ({ title, paperKey }) => {
            if (!title || !paperKey) {
                socket.emit("error", { message: "Exam title and paperKey are required." });
                return;
            }

            const questionPaper = await loadQuestionPaper(title, paperKey);
            if (!questionPaper) {
                console.log(`Question paper not found for ${paperKey}`);
                socket.emit("error", { message: "Question paper not found." });
                return;
            }

            socket.join(paperKey);
            console.log(`User joined room: ${paperKey}`);
            checkAndStartExam(io, paperKey);

            const exam = examData.get(paperKey);
            if (!exam) return;
            const { examStartTime, examEndTime, currentQuestionIndex } = exam;
            const currentTime = Date.now();

            if (currentTime >= examEndTime) {
                endExam(io, paperKey);
                return;
            }

            if (examStartTime) {
                exam.currentQuestionIndex = getElapsedQuestionIndex(paperKey);
                const currentQuestion = questionPaper.questions[exam.currentQuestionIndex];
                const cumulativeTime = questionPaper.questions.slice(0, exam.currentQuestionIndex).reduce((total, q) => total + q.timeLimit, 0);
                const timeSpentOnCurrentQuestion = (currentTime - examStartTime) / 1000 - cumulativeTime;
                const remainingTime = (currentQuestion.timeLimit - timeSpentOnCurrentQuestion) * 1000;

                io.to(paperKey).emit("question", {
                    question: currentQuestion,
                    questionIndex: exam.currentQuestionIndex + 1,
                    remainingTime: remainingTime / 1000,
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected, will attempt to reconnect...");
        });
    });
}

// Start Exam POST Request
const startExamQue = async (req, res, io) => {
    const { title, paperKey } = req.body;

    try {
        const questionPaper = await loadQuestionPaper(title, paperKey);
        if (!questionPaper) {
            return res.status(404).send(`Question paper "${title}" not found.`);
        }

        const data = await QuestionPaper.findOne({ title, paperKey }).select(
            "-questions"
        );
        checkAndStartExam(io, paperKey);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error starting exam:", error);
        res.status(500).send("An error occurred while starting the exam.");
    }
};

// To show Exam All
const getExams = async (req, res, next) => {
    try {
        // Fetch exams without the questions
        const exams = await QuestionPaper.find()
            .select("-questions") // Use -questions to exclude it from the result
            .sort({ createdAt: -1 }); // Use -questions to exclude it from the result

        // Send the exams data back to the client
        res.status(200).json(exams);
    } catch (error) {
        // Handle any errors
        console.error(error);
        next(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// ------------------------
// GET Exams By Created
// --------------------------
const getExamsByCreated = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        
        const { isTeacher, isHod, isTnp, _id } = req.user;
        let exams = [];

        if ((isTeacher || isTnp) && !isHod) {
            // Fetch exams created by the specific user
            exams = await QuestionPaper.find({ createdBy: _id })
                .select("-questions")
                .sort({ createdAt: -1 });
        } else if (isHod) {
            // Fetch all exams (HOD has full access)
            exams = await QuestionPaper.find()
                .select("-questions")
                .sort({ createdAt: -1 });
        }

        return res.status(200).json(exams);
    } catch (error) {
        next(error);
    }
};


// ----------------
// POST USER RESULT OF EACH QUESTION
// -------------------

const storeResult = async (req, res, next) => {
    const { question, user, paperKey, points, answer } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        // Check if all required data (question, user, paperKey) is provided
        if (!question || !user || !paperKey || !answer) {
            return res.status(400).json({ message: "Missing required data." });
        }

        // Check if the result for this question, user, and paperKey already exists
        const existingResult = await Result.findOne({ question, user, paperKey });

        if (existingResult) {
            // If a result already exists, respond with an appropriate message
            return res
                .status(400)
                .json({ message: "You have already submitted Answer." });
        }

        // If no existing result is found, create a new result entry
        const newResult = new Result({
            question,
            user,
            paperKey,
            points,
            answer,
        });

        await newResult.save();

        // Respond with a success message
        res.status(201).json({ message: "Answer submitted successfully." });
    } catch (error) {
        // Catch and handle any errors
        next(error);
        res
            .status(500)
            .json({ message: "Server error. Please try again later.", error });
    }
};

// ----------------
// POST TO STUDENT IS CHEATED
// -------------------

const postCheat = async (req, res, next) => {
    const { user, paperKey } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        // Validate required fields
        if (!user || !paperKey) {
            return res.status(400).json({ message: "Missing required data." });
        }

        // Check if a record for this user and paperKey already exists
        let cheatRecord = await Cheat.findOne({ user, paperKey });

        if (cheatRecord) {
            // If record exists, check if `isWarning` is true
            if (cheatRecord.isWarning) {
                // If `isWarning` is true, update `isCheat` to true
                cheatRecord.isCheat = true;
                await cheatRecord.save();
                return res
                    .status(200)
                    .json({ message: "Cheat status updated successfully." });
            } else {
                // If `isWarning` is false, set `isWarning` to true
                cheatRecord.isWarning = true;
                await cheatRecord.save();
                return res
                    .status(200)
                    .json({ message: "Warning status set successfully." });
            }
        } else {
            // If no record exists, create a new record with `isWarning` true
            const newCheatRecord = new Cheat({
                user,
                paperKey,
                isWarning: true, // Setting `isWarning` to true on creation
            });

            await newCheatRecord.save();
            return res
                .status(201)
                .json({ message: "Cheat status recorded successfully." });
        }
    } catch (error) {
        next(error);
    }
};
// ----------------
// GET CHEAT STATUS BY USER AND PAPERKEY
// -------------------

const getCheatStatus = async (req, res, next) => {
    const { user, paperKey } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        // Validate required parameters
        if (!user || !paperKey) {
            return res.status(400).json({ message: "Missing required parameters." });
        }

        // Find the cheat record by user and paperKey
        const cheatRecord = await Cheat.findOne({ user, paperKey });

        if (cheatRecord) {
            // Return the cheat status if the record exists
            return res.status(200).json({
                message: "Cheat status found.",
                isCheat: cheatRecord.isCheat,
            });
        } else {
            // If no record is found, indicate that no cheating is recorded
            return res
                .status(404)
                .json({ message: "No cheat record found for this user and paper." });
        }
    } catch (error) {
        next(error);
        // Error handling
        res
            .status(500)
            .json({ message: "Server error. Please try again later.", error });
    }
};

const newExam = async (req, res, next) => {
    // console.log('Files:', req.files);
    // console.log('Body:', req.body);

    const {
        isQuiz,
        isFastQuiz,
        isPublished,
        classyear,
        division,
        batch,
        startTime,
        endTime,
        questions,
        paperKey,
        userId,
        title,
    } = req.body;

    try {
        // Check required fields
        if (typeof isQuiz === "undefined") {
            return res.status(400).json({ message: "isQuiz is required." });
        }
        if (typeof isFastQuiz === "undefined") {
            return res.status(400).json({ message: "isFastQuiz is required." });
        }
        if (typeof isPublished === "undefined") {
            return res.status(400).json({ message: "isPublished is required." });
        }
        if (!division) {
            return res.status(400).json({ message: "division is required." });
        }
        if (!batch) {
            return res.status(400).json({ message: "batch is required." });
        }
        if (!classyear) {
            return res.status(400).json({ message: "Class year is required." });
        }
        if (!startTime || !endTime) {
            return res.status(400).json({ message: "Start time and End time are required." });
        }
        if (!questions) {
            return res.status(400).json({ message: "Questions are required." });
        }

        // Parse the questions if it's a string
        let parsedQuestions = [];
        try {
            parsedQuestions = JSON.parse(questions); // Parse questions if it's a string
        } catch (error) {
            return res.status(400).json({ message: "Invalid questions format." });
        }

        // Ensure questions is an array
        if (!Array.isArray(parsedQuestions)) {
            return res.status(400).json({ message: "Questions must be an array." });
        }

        if (!paperKey) {
            return res.status(400).json({ message: "Paper key is required." });
        }
        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }

        // Check if the exam already exists
        const existingExam = await QuestionPaper.findOne({ paperKey });
        if (existingExam) {
            return res.status(400).json({ message: "Exam already exists." });
        }

        // Log the parsed questions for debugging
        // console.log('Parsed Questions:', parsedQuestions);

        // Map the questions to include the uploaded image
        let i = 0
        const uploadedFiles = req.files;
        const updatedQuestions = parsedQuestions.map((question, index) => {

            // If an image exists for the current question, set the image field
            if (question.image !== null) {

                question.image = `/database/uploads/${uploadedFiles[i].filename}`;
                i++;
            } else {
                question.image = null;
            }
            return question;
        });

        // console.log('Updated Questions:', updatedQuestions);

        // Create and save the new exam
        const newQuestionPaper = new QuestionPaper({
            isQuiz,
            isFastQuiz,
            isPublished,
            classyear,
            division,
            batch,
            startTime,
            endTime,
            questions: updatedQuestions,
            paperKey,
            title,
            createdBy: req.user._id,
        });

        await newQuestionPaper.save();

        return res.status(201).json({ message: "New exam created successfully!" });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

//--------------------
// Update QuestionPaper
//----------------------
const updateExam = async (req, res, next) => {
    const {
        isQuiz,
        isFastQuiz,
        isPublished,
        classyear,
        division,
        batch,
        startTime,
        endTime,
        questions,
        paperKey,
        title,
        userId,
    } = req.body;
    try {
        // Check required fields
        if (typeof isQuiz === "undefined") {
            return res.status(400).json({ message: "isQuiz is required." });
        }
        if (typeof isFastQuiz === "undefined") {
            return res.status(400).json({ message: "isFastQuiz is required." });
        }
        if (typeof isPublished === "undefined") {
            return res.status(400).json({ message: "isPublished is required." });
        }
        if (!classyear) {
            return res.status(400).json({ message: "Class year is required." });
        }
        if (!division) {
            return res.status(400).json({ message: "Division is required." });
            }
        if(!batch){
            return res.status(400).json({ message: "Batch is required." });
        }
        if (!startTime || !endTime) {
            return res.status(400).json({ message: "Start time and End time are required." });
        }
        if (!questions) {
            return res.status(400).json({ message: "Questions are required." });
        }

        // Parse the questions if it's a string
        let parsedQuestions = [];
        try {
            parsedQuestions = JSON.parse(questions); // Parse questions if it's a string
        } catch (error) {
            return res.status(400).json({ message: "Invalid questions format." });
        }

        // Ensure questions is an array
        if (!Array.isArray(parsedQuestions)) {
            return res.status(400).json({ message: "Questions must be an array." });
        }

        if (!paperKey) {
            return res.status(400).json({ message: "Paper key is required." });
        }
        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }



        // Log the parsed questions for debugging
        // console.log('Parsed Questions:', parsedQuestions);
        // Check if the exam already exists
        const existingExam = await QuestionPaper.findOne({ paperKey: paperKey });
        if (!existingExam) {
            return res.status(400).json({ message: "Exam does not exist." });
        }
        // Map the questions to include the uploaded image
        let i = 0
        const uploadedFiles = req.files;
        const updatedQuestions = parsedQuestions.map((question, index) => {

            // If an image exists for the current question, set the image field
            // image !== null || image != startwith(/database/uploads)
            console.log(question.image);
            // /database/uploads/files_1735160153032_665663958.jpeg
            if (question.image !== null && (typeof question.image !== "string")) {
                question.image = `/database/uploads/${uploadedFiles[i].filename}`;
                i++;
            }
            return question;
        });

        // Update the exam
        const updatedExam = await QuestionPaper.findOneAndUpdate(
            { paperKey },
            {
                $set: {
                    isQuiz,
                    isFastQuiz,
                    isPublished,
                    classyear,
                    division,
                    batch,
                    startTime,
                    endTime,
                    questions: updatedQuestions,
                    title,
                    createdBy: req.user._id,
                },
            },
            { new: true } // Return the updated document
        );

        if (!updatedExam) {
            return res.status(500).json({ message: "Failed to update exam." });
        }
        return res.status(200).json({ message: "Exam updated successfully.", exam: updatedExam });
    } catch (error) {
        next(error);
    }
}

//  GET Result OF Student OF All Recent For Home Page
const GetResultsOfUserRecent = async (req, res, next) => {
    try {
        const userId = req.params.userId; // Get the userId from request parameters
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        // Fetch all results for the user
        const results = await Result.find({ user: userId });

        if (results.length === 0) {
            return res.status(404).json({ message: "No results found for the user." });
        }

        // Group results by paperKey
        const groupedResults = results.reduce((acc, result) => {
            if (!acc[result.paperKey]) {
                acc[result.paperKey] = [];
            }
            acc[result.paperKey].push(result);
            return acc;
        }, {});

        // Prepare response data
        const responseData = [];

        for (const paperKey of Object.keys(groupedResults)) {
            const paperResults = groupedResults[paperKey];

            // Calculate total points for this paperKey
            const totalPoints = paperResults.reduce((sum, result) => sum + result.points, 0);

            // Fetch the corresponding question paper
            const questionPaper = await QuestionPaper.findOne({ paperKey });

            if (!questionPaper) {
                return res.status(404).json({ message: `Question paper with paperKey ${paperKey} not found.` });
            }

            // Push data for this paperKey to response array
            responseData.push({
                title: questionPaper.title,
                paperKey,
                totalPoints,
            });
        }

        // Sort response data by creation time (assumes latest entries are at the end) and return the last two entries
        const latestResults = responseData.slice(-2);
        // Return the grouped results with calculated points
        return res.status(200).json(latestResults);
    } catch (error) {
        console.error("Error fetching student results:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}

// For All Results Of User
const GetResultsOfUser = async (req, res, next) => {
    try {
        const userId = req.params.userId; // Get the userId from request parameters
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        // Fetch all results for the user
        const results = await Result.find({ user: userId });

        if (results.length === 0) {
            return res.status(404).json({ message: "No results found for the user." });
        }

        // Group results by paperKey
        const groupedResults = results.reduce((acc, result) => {
            if (!acc[result.paperKey]) {
                acc[result.paperKey] = [];
            }
            acc[result.paperKey].push(result);
            return acc;
        }, {});

        // Prepare response data
        const responseData = [];

        for (const paperKey of Object.keys(groupedResults)) {
            const paperResults = groupedResults[paperKey];

            // Calculate total points for this paperKey
            const totalPoints = paperResults.reduce((sum, result) => sum + result.points, 0);

            // Fetch the corresponding question paper
            const questionPaper = await QuestionPaper.findOne({ paperKey });

            if (!questionPaper) {
                return res.status(404).json({ message: `Question paper with paperKey ${paperKey} not found.` });
            }

            // Push data for this paperKey to response array
            responseData.push({
                title: questionPaper.title,
                paperKey,
                totalPoints,
                time: questionPaper.startTime,
            });
        }

        // Return the grouped results with calculated points
        return res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
}

// For Single Result
const GetResultOfSinglePaper = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const paperKey = req.params.key;
        if (!userId || !paperKey) {
            return res.status(400).json({ message: "Invalid request parameters." });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Fetch all results for the user and paperKey
        const paperResults = await Result.find({ user: userId, paperKey });
        if (paperResults.length === 0) {
            return res.status(404).json({ success: false, message: "No results found for the user and paper key." });
        }


        // Calculate total points


        const questionPaper = await QuestionPaper.findOne({ paperKey });
        if (!questionPaper) {
            return res.status(404).json({ success: false, message: `Question paper with paperKey ${paperKey} not found.` });
        }
        const totalPoints = questionPaper.questions.reduce((sum, question) => sum + question.maxPoint, 0);

        // Prepare response data
        const responseData = {
            title: questionPaper.title,
            paperKey,
            totalPoints,
            startTime: questionPaper.startTime,
            endTime: questionPaper.endTime,
            questions: paperResults.map(result => ({
                question: result.question,
                userAnswer: result.answer,
                points: result.points,
                timing: result.createdAt,
                isCorrect: result.points > 0,
            })),
        };

        // Return the grouped results with calculated points
        return res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
}

// -------------------------
// Logic For Delete Quesion paper /  exam
// ------------------
const deleteExam = async (req, res, next) => {
    try {
        // Extract examId from request parameters
        const { examId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        // Check if the examId is provided
        if (!examId) {
            return res.status(400).json({ message: "Exam ID is required" });
        }

        // Find the exam to ensure it's available for file deletion
        const exam = await QuestionPaper.findById(examId);

        // If no exam is found, return a 404 error
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        // Loop through questions to delete associated files
        exam.questions.forEach((question) => {
            if (question.image) {
                const filePath = path.join(__dirname, '..', question.image);
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Error deleting file ${filePath}:`, err.message);
                            } else {
                                console.log(`Deleted file: ${filePath}`);
                            }
                        });
                    }
                });
            }
        });

        // Find and delete the exam
        const deletedExam = await QuestionPaper.findByIdAndDelete(examId);

        // If no exam is found, return a 404 error
        if (!deletedExam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        const deleteResults = await Result.deleteMany({ paperKey: deletedExam.paperKey });

        // Delete The Also Cheats
        await Cheat.deleteMany({ paperKey: deletedExam.paperKey });


        // Return a success response
        res.status(200).json({
            message: "Exam, related results, and associated files deleted successfully",
        });
    } catch (error) {
        // Pass the error to the error-handling middleware
        next(error);
    }
};

//------------------------------------
// GET Exam Question Paper All Data
// ------------------------------------
const getExamQuestionPaperData = async (req, res, next) => {
    try {
        const { examId, title, paperkey } = req.params;
        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        if (!examId || !title || !paperkey) {
            return res.status(400).json({ message: "Exam ID, Title and Paper Key are Required" });

        }

        // find in Questionpaper Model
        const examData = await QuestionPaper.findOne({ _id: examId, title, paperKey: paperkey });
        if (!examData) {
            return res.status(404).json({ message: "Exam Data Not Found" });
        }
        // Return a success response with the exam data
        res.status(200).json({
            message: "Exam Data Retrieved Successfully",
            data: examData
        });
    } catch (error) {
        next(error);
    }
}


//-----------------------
// Getting TOP 3 Leader Board
//-----------------------
const getLeaderBoard = async (req, res, next) => {
    try {
        // Fetch all users
        const users = await User.find();

        // Map over users to calculate total points
        const userPoints = await Promise.all(users.map(async (user) => {
            // Fetch results for the user
            const results = await Result.find({ user: user._id });

            // Calculate total points
            const totalPoints = results.reduce((sum, result) => sum + result.points, 0);

            // Return user with total points
            return {
                userId: user._id,
                name: user.name,
                username: user.username,
                totalPoints,
            };
        }));

        // Sort users by total points in descending order
        const sortedUsers = userPoints.sort((a, b) => b.totalPoints - a.totalPoints);

        // Get top 3 users
        const top3Users = sortedUsers.slice(0, 5);

        // Respond with the top 4 users
        return res.status(200).json({
            message: "Data Retrived Successfully",
            success: true,
            data: top3Users,
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    loadQuestionPaper,
    checkAndStartExam,
    handleSocketConnection,
    startExamQue,
    getExams,
    getExamsByCreated,
    storeResult,
    postCheat,
    getCheatStatus,
    newExam,
    GetResultsOfUserRecent,
    GetResultsOfUser,
    GetResultOfSinglePaper,
    deleteExam,
    getLeaderBoard,
    updateExam,
    getExamQuestionPaperData,
};

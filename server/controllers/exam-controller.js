// controllers/exam-controller.js
const QuestionPaper = require("../database/models/question-paper-model");
const Result = require("../database/models/result-model");
const Cheat = require("../database/models/cheat-model");

// Variables For Question Paper Broadcasting Logic

let examStartTime;
let examEndTime;
let currentQuestionIndex = 0;
let questionPaper = null;

// Load the question paper from the database
async function loadQuestionPaper(title, paperKey) {
    try {
        questionPaper = await QuestionPaper.findOne({ title, paperKey }); // Include paperKey in the query
        if (questionPaper) {
            console.log("Loaded question paper:", questionPaper.title);
            examStartTime = new Date(questionPaper.startTime).getTime();
            examEndTime = new Date(questionPaper.endTime).getTime();
            currentQuestionIndex = questionPaper.currentQuestionIndex || 0;
        }
        return questionPaper; // Return the question paper
    } catch (error) {
        console.error("Failed to load question paper:", error);
        return null; // Return null if there's an error
    }
}

// Calculate the current question index based on the elapsed time since examStartTime
function getElapsedQuestionIndex() {
    const timeElapsed = (Date.now() - examStartTime) / 1000; // time in seconds
    let cumulativeTime = 0;

    for (let i = 0; i < questionPaper.questions.length; i++) {
        cumulativeTime += questionPaper.questions[i].timeLimit;
        if (timeElapsed < cumulativeTime) {
            return i;
        }
    }

    return questionPaper.questions.length - 1; // If past the last question, return the last index
}

// Start the exam and broadcast the first question
function startExam(io, paperKey) {
    console.log("Starting the exam...");
    broadcastCurrentQuestion(io, paperKey);
}

// Broadcast the current question and set up the interval for the next question
async function broadcastCurrentQuestion(io, paperKey) {
    const currentTime = Date.now();
    if (currentTime >= examEndTime) {
        endExam(io, paperKey);
        return;
    }

    currentQuestionIndex = getElapsedQuestionIndex();
    const currentQuestion = questionPaper.questions[currentQuestionIndex];
    const cumulativeTime = questionPaper.questions
        .slice(0, currentQuestionIndex)
        .reduce((total, q) => total + q.timeLimit, 0);
    const timeSpentOnCurrentQuestion =
        (currentTime - examStartTime) / 1000 - cumulativeTime;
    const remainingTime =
        (currentQuestion.timeLimit - timeSpentOnCurrentQuestion) * 1000;

    console.log(
        `Broadcasting Question ${currentQuestionIndex + 1}:`,
        currentQuestion.questionText
    );

    io.to(paperKey).emit("question", {
        question: currentQuestion,
        questionIndex: currentQuestionIndex + 1,
        remainingTime: remainingTime / 1000,
    });

    await QuestionPaper.updateOne(
        { title: questionPaper.title },
        { currentQuestionIndex }
    );

    setTimeout(() => {
        currentQuestionIndex++;
        broadcastCurrentQuestion(io, paperKey);
    }, remainingTime);
}

// End the exam
function endExam(io, paperKey) {
    io.to(paperKey).emit("examEnd", { message: "Exam has ended" });
    console.log("Exam has ended");
}

// Check if it's time to start the exam
function checkAndStartExam(io, paperKey) {
    const now = Date.now();
    if (now >= examStartTime && now <= examEndTime) {
        startExam(io, paperKey);
    } else {
        console.log("Waiting for the scheduled start time...");
        const timeUntilStart = examStartTime - now;
        setTimeout(() => startExam(io, paperKey), timeUntilStart);
    }
}

// Handle new client connections and broadcast the current question
function handleSocketConnection(io, loadQuestionPaper, checkAndStartExam) {
    io.on("connection", (socket) => {
        console.log("New client connected");

        socket.on("loadExam", async ({ title, paperKey }) => {
            if (!title || !paperKey) {
                socket.emit("error", {
                    message: "Exam title and paperKey is required.",
                });
                return;
            }

            await loadQuestionPaper(title, paperKey);
            if (!questionPaper) {
                console.log("Question paper not found.");
                socket.emit("error", { message: "Question paper not found." });
                return;
            }
            // console.log(paperKey)
            socket.join(paperKey); // Join the room with paperKey

            console.log(`User joined room: ${paperKey}`);
            checkAndStartExam(io, paperKey);

            const currentTime = Date.now();
            if (currentTime >= examEndTime) {
                endExam(io, paperKey);
                return;
            }

            if (examStartTime) {
                const timeElapsed = currentTime - examStartTime;
                currentQuestionIndex = getElapsedQuestionIndex();
                const currentQuestion = questionPaper.questions[currentQuestionIndex];
                const cumulativeTime = questionPaper.questions
                    .slice(0, currentQuestionIndex)
                    .reduce((total, q) => total + q.timeLimit, 0);
                const timeSpentOnCurrentQuestion =
                    (currentTime - examStartTime) / 1000 - cumulativeTime;
                const remainingTime =
                    (currentQuestion.timeLimit - timeSpentOnCurrentQuestion) * 1000;

                io.to(paperKey).emit("question", {
                    question: currentQuestion,
                    questionIndex: currentQuestionIndex + 1,
                    remainingTime: remainingTime / 1000,
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
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

// ----------------
// POST USER RESULT OF EACH QUESTION
// -------------------

const storeResult = async (req, res, next) => {
    const { question, user, paperKey, points, answer } = req.body;

    try {
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
        startTime,
        endTime,
        questions,
        paperKey,
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
            startTime,
            endTime,
            questions: updatedQuestions,
            paperKey,
            title,
        });

        await newQuestionPaper.save();

        return res.status(201).json({ message: "New exam created successfully!" });
    } catch (error) {
        console.error(error);
        next(error);
    }
};



module.exports = {
    loadQuestionPaper,
    checkAndStartExam,
    handleSocketConnection,
    startExamQue,
    getExams,
    storeResult,
    postCheat,
    getCheatStatus,
    newExam,
};

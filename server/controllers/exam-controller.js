// controllers/exam-controller.js
const QuestionPaper = require('../database/models/question-paper-model');


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
    const timeSpentOnCurrentQuestion = (currentTime - examStartTime) / 1000 - cumulativeTime;
    const remainingTime = (currentQuestion.timeLimit - timeSpentOnCurrentQuestion) * 1000;

    console.log(`Broadcasting Question ${currentQuestionIndex + 1}:`, currentQuestion.questionText);

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
                socket.emit("error", { message: "Exam title and paperKey is required." });
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
                const timeSpentOnCurrentQuestion = (currentTime - examStartTime) / 1000 - cumulativeTime;
                const remainingTime = (currentQuestion.timeLimit - timeSpentOnCurrentQuestion) * 1000;

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

        checkAndStartExam(io, paperKey);
        res.send(`Exam with title "${title}" scheduled.`);
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
            .select('-questions') // Use -questions to exclude it from the result
            .sort({ createdAt: -1 });  // Use -questions to exclude it from the result

        // Send the exams data back to the client
        res.status(200).json(exams);
    } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    loadQuestionPaper,
    checkAndStartExam,
    handleSocketConnection,
    startExamQue,
    getExams,
};
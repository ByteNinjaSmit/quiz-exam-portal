const mongoose = require('mongoose');
const CodeProblem = require("../database/models/code-problem-model");
const CodeSubmission = require("../database/models/code-submission-model");
const CodeContest = require("../database/models/code-contest-model");
const CodeContestSubmission = require("../database/models/codeContest-submission-model");
const ContestCheat = require("../database/models/code-cheat-model");
const User = require("../database/models/user-model");
const EndContest = require("../database/models/end-contest-model");
const { Parser } = require('json2csv'); // Import the json2csv library

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
            testCases,

        });

        // Save the problem to the database
        const savedProblem = await newProblem.save();

        return res.status(200).json({
            message: "Coding Problem created successfully.",
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
        const submissions = await CodeSubmission.find({ problemId, userId }).sort({ createdAt: -1 });;
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


// Controller to create a new coding problem
const createCodeContest = async (req, res, next) => {
    try {
        const {
            name,
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
            classyear,
            division,
            batch,
            score,
            startTime,
            endTime,
            createdBy

        } = req.body;

        // Validate mandatory fields
        if (!name || !title || !difficulty || !description || !constraints || !examples.length || !testCases.length || !code || !language || !classyear || !score || !startTime || !endTime || !createdBy || !division || !batch) {
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
        const newProblem = new CodeContest({
            name,
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
            testCases,
            classyear,
            division,
            batch,
            score,
            startTime,
            endTime,
            createdBy
        });

        // Save the problem to the database
        const savedProblem = await newProblem.save();

        return res.status(200).json({
            message: "Coding Contest created successfully.",
        });
    } catch (error) {
        console.error("Error creating Coding Contest:", error);
        next(error); // Pass error to the error-handling middleware
    }
};

// Update Coding Contest 
const updateCodeContest = async (req, res, next) => {
    try {
        const {
            name,
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
            classyear,
            division,
            batch,
            score,
            startTime,
            endTime,
            createdBy
        } = req.body;
        const id = req.params.id;
        // Validate mandatory fields
        if (!name || !title || !difficulty || !description || !constraints || !examples.length ||
            !testCases.length || !code || !language || !classyear || !score || !startTime || !endTime ||
            !createdBy || !division || !batch) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }
        // Validate id by mongose
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid id." });
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
        // Find the Contest by id
        const contest = await CodeContest.findById(id);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Coding Contest not found" });
        }
        // Update the Contest
        // Update the contest
        const updatedContest = await CodeContest.findByIdAndUpdate(
            id,
            {
                name,
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
                category: categories || [], // Ensure categories is an array
                testCases,
                classyear,
                division,
                batch,
                score,
                startTime,
                endTime,
                createdBy
            },
            { new: true } // Returns the updated contest
        );
        return res.status(200).json({
            success: true,
            message: "Coding Contest updated successfully.",
        });
    } catch (error) {
        next(error);
    }
}


// Controller to get a particular problem by ID
const getContestById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Problem ID is required." });
        }
        const problem = await CodeContest.findById(id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        return res.status(200).json({ problem });
    } catch (error) {
        console.error("Error fetching problem by ID:", error);
        next(error);
    }
};

const getContests = async (req, res, next) => {
    try {
        const contest = await CodeContest.find()
            .select('name difficulty category startTime endTime classyear score createdAt')
            .sort({ createdAt: -1 });
        return res.status(200).json({ contest });
    } catch (error) {
        next(error);
    }
};

const getTop2Contests = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { classy, division, batch, _id } = req.user;
        const classyear = classy;

        // Fetch relevant contests
        const contests = await CodeContest.find({
            $or: [
                { classyear, division, batch },
                { classyear, division, batch: "ALL" },
                { classyear, division: "ALL", batch },
                { classyear, division: "ALL", batch: "ALL" },
                { classyear: "ALL", division, batch },
                { classyear: "ALL", division: "ALL", batch: "ALL" },
            ],
        })
            .select('name difficulty category startTime endTime classyear score createdAt')
            .sort({ createdAt: -1 })
            .limit(2);

        // Fetch user's ended contests
        const ended = await EndContest.find({ user: _id });

        // Create a Set of ended contest IDs for quick lookup
        const endedContestIds = new Set(ended.map(e => e.problemId.toString()));

        // Add `ended: true/false` flag to each contest
        const contestWithStatus = contests.map(contest => ({
            ...contest.toObject(),
            ended: endedContestIds.has(contest._id.toString()),
        }));

        return res.status(200).json({ contest: contestWithStatus });
    } catch (error) {
        next(error);
    }
};


// ------------------
// GET ALL Contest Of User
// -------------------

const getContestsUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { classy, division, batch, _id } = req.user;
        const classyear = classy;

        // Fetch relevant contests
        const contests = await CodeContest.find({
            $or: [
                { classyear, division, batch },
                { classyear, division, batch: "ALL" },
                { classyear, division: "ALL", batch },
                { classyear, division: "ALL", batch: "ALL" },
                { classyear: "ALL", division, batch },
                { classyear: "ALL", division: "ALL", batch: "ALL" },
            ],
        })
            .select('name difficulty category startTime endTime classyear score createdAt')
            .sort({ createdAt: -1 });

        // Fetch user's ended contests
        const ended = await EndContest.find({ user: _id });

        // Create a Set of ended contest IDs for quick lookup
        const endedContestIds = new Set(ended.map(e => e.problemId.toString()));

        // Add `ended: true/false` flag to each contest
        const contestWithStatus = contests.map(contest => ({
            ...contest.toObject(),
            ended: endedContestIds.has(contest._id.toString()),
        }));

        return res.status(200).json({ contest: contestWithStatus });
    } catch (error) {
        next(error);
    }
};



const submitContestSubmission = async (req, res, next) => {
    try {
        const { problemId, score, userId, code, accuracy, avgRuntime, testCasesPassed, output, isSuccessfullyRun } = req.body;

        // Validate required fields
        if (!problemId || score === undefined || !userId || !code || !output || accuracy === undefined || avgRuntime === undefined || testCasesPassed === undefined) {
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
        const newSubmission = new CodeContestSubmission({
            problemId,
            userId,
            code,
            output,
            accuracy,
            avgRuntime,
            testCasesPassed,
            isSuccessfullyRun,
            score,
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


const getAllContestSubmissionByUserByProblem = async (req, res, next) => {
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
        const submissions = await CodeContestSubmission.find({ problemId, userId }).sort({ createdAt: -1 });;
        // Send response
        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        console.error("Error in getAllContestSubmissionByUserByProblem:", error);
        next(error); // Pass error to middleware
    }
};

const deleteCodingContestById = async (req, res, next) => {
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
        const deletedProblem = await CodeContest.findByIdAndDelete(problemId);
        if (!deletedProblem) {
            return res.status(404).json({ success: false, message: "Problem not found." });
        }
        // Delete all submissions related to the problem
        await CodeContestSubmission.deleteMany({ problemId });
        await ContestCheat.deleteMany({ problemId })
        console.log(`Contest ${problemId} and related submissions deleted successfully.`);

        return res.status(200).json({ success: true, message: "Contest and related submissions deleted successfully." });
    } catch (error) {
        console.error("Error in Delete Contest: ", error);

        next(error);
    }
}

// ----------------
// POST TO STUDENT IS CHEATED IN CONTEST
// -------------------

const postContestCheat = async (req, res, next) => {
    const { user, problemId, reason } = req.body;

    try {
        // Validate required fields
        if (!user || !problemId || !reason) {
            return res.status(400).json({ message: "Missing required data." });
        }
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: "Problem ID is required" })
        }

        // Check if a record for this user and paperKey already exists
        let cheatRecord = await ContestCheat.findOne({ user, problemId });

        if (cheatRecord) {
            // If record exists, check if `isWarning` is true
            if (cheatRecord.isWarning) {
                // If `isWarning` is true, update `isCheat` to true
                cheatRecord.isCheat = true;
                cheatRecord.reason = reason;
                await cheatRecord.save();
                return res
                    .status(200)
                    .json({ message: "Cheat status updated successfully." });
            } else {
                // If `isWarning` is false, set `isWarning` to true
                cheatRecord.isWarning = true;
                cheatRecord.reason = reason;
                await cheatRecord.save();
                return res
                    .status(200)
                    .json({ message: "Warning status set successfully." });
            }
        } else {
            // If no record exists, create a new record with `isWarning` true
            const newCheatRecord = new ContestCheat({
                user,
                problemId,
                reason,
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
// GET CONTEST CHEAT STATUS BY USER AND PROBLEMID
// -------------------

const getContestCheatStatus = async (req, res, next) => {
    const { user, problemId } = req.params;

    try {
        // Validate required parameters
        if (!user || !problemId) {
            return res.status(400).json({ message: "Missing required parameters." });
        }
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: "problemId  is required" })
        }

        // Find the cheat record by user and paperKey
        const cheatRecord = await ContestCheat.findOne({ user, problemId });

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
                .json({ message: "No cheat record found for this user and contest." });
        }
    } catch (error) {
        next(error);
    }
};

// --------------------
// Code Contest Result
// --------------------

const getResultOfSingleContest = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Verify id by Mongoose
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid contest id" })
        }
        // Step 1: Find the Code contest 
        const contest = await CodeContest.findById(id);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        // Step 2: Find the user's results associated with contest id
        const contestResults = await CodeContestSubmission.find({ problemId: id });
        if (contestResults.length === 0) {
            return res.status(404).json({ message: "No results found for this contest." });
        }
        //  Step 3: Calculate Total Points and Attempted Contest For Each user
        const userData = {};
        contestResults.forEach((result) => {
            const userId = result.userId.toString();

            // Initialize user data if not present
            if (!userData[userId]) {
                userData[userId] = {
                    accuracy: result.accuracy,
                    testCasesPassed: result.testCasesPassed,
                    code: result.code,
                    userDetails: null,
                    output: result.output,
                    avgRuntime: result.avgRuntime,
                    score: result.score,
                    isCheat: false,
                };
            }
            // Update only if the new score is higher
            else if (result.score > userData[userId].score) {
                userData[userId] = {
                    accuracy: result.accuracy,
                    testCasesPassed: result.testCasesPassed,
                    code: result.code,
                    userDetails: null,
                    isCheat: false,
                    output: result.output,
                    avgRuntime: result.avgRuntime,
                    score: result.score,
                };
            }
        });

        // step 4: Fetch user Details for all unique users
        const userIds = Object.keys(userData);
        const users = await User.find({ _id: { $in: userIds } }, { name: 1, username: 1, classy: 1, division: 1 }); // Fetch only necessary fields

        // Get All Cheat
        const cheatsData = await ContestCheat.find({ problemId: id });

        cheatsData.forEach(cheat => {
            const userId = cheat.user.toString();
            if (userData[userId]) {
                userData[userId].isCheat = cheat.isCheat;
            }
        })


        // Attach user details to user data
        users.forEach(user => {
            const userId = user._id.toString();
            if (userData[userId]) {
                userData[userId].userDetails = user;
            }
        });

        // Prepare final data and sort by score 
        const sortedUsers = Object.keys(userData)
            .map(userId => ({
                userId,
                accuracy: userData[userId].accuracy,
                testCasesPassed: userData[userId].testCasesPassed,
                code: userData[userId].code,
                output: userData[userId].output,
                avgRuntime: userData[userId].avgRuntime,
                score: userData[userId].score,
                userDetails: userData[userId].userDetails,
                isCheat: userData[userId].isCheat
            }))
            .sort((a, b) => b.score - a.score);


        // Prepare final data
        const finalData = {
            contest: {
                name: contest.name,
                title: contest.title,
                startTime: contest.startTime,
                endTime: contest.endTime,
            },
            users: sortedUsers,// Sorted users with their details
        };

        // Step 5: Send the response
        return res.status(200).json({ contestId: id, results: finalData });
    } catch (error) {
        next(error);
    }
}


// Download Contest Result Data Export
const exportContestDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify id by Mongoose
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid contest id" })
        }
        // Step 1: Find the Code contest 
        const contest = await CodeContest.findById(id);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        // Step 2: Find the user's results associated with contest id
        const contestResults = await CodeContestSubmission.find({ problemId: id });
        if (contestResults.length === 0) {
            return res.status(404).json({ message: "No results found for this contest." });
        }
        //  Step 3: Calculate Total Points and Attempted Contest For Each user
        const userData = {};
        contestResults.forEach((result) => {
            const userId = result.userId.toString();

            // Initialize user data if not present
            if (!userData[userId]) {
                userData[userId] = {
                    accuracy: result.accuracy,
                    testCasesPassed: result.testCasesPassed,
                    code: result.code,
                    userDetails: null,
                    output: result.output,
                    avgRuntime: result.avgRuntime,
                    score: result.score,
                    isCheat: false,
                    isWarning: false,
                    cheatReason: null,
                };
            }
            // Update only if the new score is higher
            else if (result.score > userData[userId].score) {
                userData[userId] = {
                    accuracy: result.accuracy,
                    testCasesPassed: result.testCasesPassed,
                    code: result.code,
                    userDetails: null,
                    isCheat: false,
                    isWarning: false,
                    cheatReason: null,
                    output: result.output,
                    avgRuntime: result.avgRuntime,
                    score: result.score,
                };
            }
        });

        // step 4: Fetch user Details for all unique users
        const userIds = Object.keys(userData);
        const users = await User.find({ _id: { $in: userIds } }, { name: 1, username: 1, classy: 1, division: 1 }); // Fetch only necessary fields

        // Get All Cheat
        const cheatsData = await ContestCheat.find({ problemId: id });

        cheatsData.forEach(cheat => {
            const userId = cheat.user.toString();
            if (userData[userId]) {
                userData[userId].isCheat = cheat.isCheat;
                userData[userId].isWarning = cheat.isWarning;
                userData[userId].cheatReason = cheat.reason;
            }
        })


        // Attach user details to user data
        users.forEach(user => {
            const userId = user._id.toString();
            if (userData[userId]) {
                userData[userId].userDetails = user;
            }
        });

        // Prepare final data and sort by score 
        const sortedUsers = Object.keys(userData)
            .map(userId => ({
                userId,
                accuracy: userData[userId].accuracy,
                testCasesPassed: userData[userId].testCasesPassed,
                code: userData[userId].code,
                output: userData[userId].output,
                avgRuntime: `${userData[userId].avgRuntime}ms`,
                score: userData[userId].score,
                userDetails: userData[userId].userDetails,
                isCheat: userData[userId].isCheat,
                isWarning: userData[userId].isWarning,
                cheatReason: userData[userId].cheatReason,
                name: userData[userId].userDetails?.name || 'N/A',
                username: userData[userId].userDetails?.username || 'N/A',
                classy: userData[userId].userDetails?.classy || 'N/A',
                division: userData[userId].userDetails?.division || 'N/A',
            }))
            .sort((a, b) => b.score - a.score);

        const csvFields = [
            // { label: 'User ID', value: 'userId' },
            { label: 'Name', value: 'name' },
            { label: 'Username', value: 'username' },
            { label: 'Class', value: 'classy' },
            { label: 'Division', value: 'division' },
            { label: 'Accuracy', value: 'accuracy' },
            { label: 'Test Case Passed', value: 'testCasesPassed' },
            { lable: 'Avg._RunTime', value: 'avgRuntime' },
            { label: 'Score', value: 'score' },
            { label: 'Cheat', value: 'isCheat' },
            { label: 'Warning', value: 'isWarning' },
            { label: 'Cheat_Reason', value: 'cheatReason' },

        ];

        const csvHeader = `
        Question Paper Details
        Title: ${contest.title}
        Name: ${contest.name}
        Class: ${contest.classyear}
        Division: ${contest.division}
        Start Time: ${contest.startTime}
        End Time: ${contest.endTime}
                `.trim();


        const json2csvParser = new Parser({ fields: csvFields });
        const csvBody = json2csvParser.parse(sortedUsers);
        const csvData = `${csvHeader}\n\n${csvBody}`;


        res.header('Content-Type', 'text/csv');
        res.attachment(`${contest.title.replace(/\s+/g, '_')}_Results.csv`);
        return res.status(200).send(csvData);

    } catch (error) {
        console.error('Error fetching paper details:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching paper details'
        });
    }
}

// --------------------
// END CONTEST OF USER
// -----------------

const endContestByUser = async (req, res, next) => {
    const { user, problemId } = req.body;
    try {
        if (!user || !problemId) {
            return res.status(400).json({ message: "Missing required parameters." });
        }
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: "problemId  is required" })
        }
        // Check if the user has already submitted the problem
        // FInd User is Exist 
        const userExist = await User.findOne({ _id: user });
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }
        // Find Problem is Exist
        const problemExist = await CodeContest.findOne({ _id: problemId });
        if (!problemExist) {
            return res.status(404).json({ message: "Problem not found" });
        }
        // Check if the user has already submitted the problem
        const userSubmitted = await EndContest.findOne({ problemId: problemId, user: user });
        if (userSubmitted) {
            return res.status(400).json({ message: "You have already Ended this Contest" });
        }
        // Create a new EndContest document
        const endContest = new EndContest({
            problemId: problemId,
            user: user

        })
        // Save the EndContest document
        await endContest.save();
        return res.status(200).json({ message: "Contest Ended Successfully" });
    } catch (error) {
        next(error);
    }
}

// -----------------------
// Check User Contest Ended Or Not
// -----------------------

const checkContestEnd = async (req, res, next) => {
    const { user, problemId } = req.params;
    try {
        if (!user || !problemId) {
            return res.status(400).json({ message: "Missing required parameters." });
        }

        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: "Invalid Problem ID" });
        }

        // Check if the user exists
        const userExist = await User.findById(user);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the contest exists
        const problemExist = await CodeContest.findById(problemId);
        if (!problemExist) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Check if the user ended the contest
        const userSubmitted = await EndContest.findOne({ problemId, user });
        if (userSubmitted) {
            return res.status(200).json({ message: "Contest Ended" });
        } else {
            return res.status(404).json({ message: "Contest not ended yet" }); // 404 if not found
        }
    } catch (error) {
        next(error);
    }
}


module.exports = {
    createProblem,
    getProblemById,
    getProblems,
    submitSubmission,
    getAllSubmissionByUserByProblem,
    deleteProblemById,
    createCodeContest,
    getContests,
    getContestById,
    submitContestSubmission,
    getAllContestSubmissionByUserByProblem,
    deleteCodingContestById,
    getTop2Contests,
    postContestCheat,
    getContestCheatStatus,
    getResultOfSingleContest,
    updateCodeContest,
    exportContestDetails,
    endContestByUser,
    checkContestEnd,
    getContestsUser
};
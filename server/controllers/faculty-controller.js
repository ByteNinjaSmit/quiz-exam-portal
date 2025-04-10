require("dotenv").config();
const User = require("../database/models/user-model");
const Faculty = require("../database/models/faculty-model")
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { Parser } = require('json2csv'); // Import the json2csv library

const QuestionPaper = require("../database/models/question-paper-model");
const Result = require("../database/models/result-model");
const Cheat = require("../database/models/cheat-model");
const CodeSubmission = require("../database/models/code-submission-model");
const ContestCheat = require("../database/models/code-cheat-model");
const CodeContestSubmission = require("../database/models/codeContest-submission-model");
const CodeContest = require("../database/models/code-contest-model");

// ---------------------------
// GET ALL User
// -----------------------

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, { password: 0 }).exec();
        res.status(200).json(users);
    } catch (error) {
        next(error)
    }
}

//------------------
// GET Single User
//----------------
const getUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        const user = await User.findById(userId, { password: 0 }).exec();
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

// ------------
// GET Total Number of Users
//-----------------
const getTotalUsers = async (req, res, next) => {
    try {
        // console.log("API HITTING");

        // Count the total number of users in the database
        const totalUsers = await User.countDocuments().exec();

        // Return the total user count as a response
        return res.status(200).json({
            message: "Total users retrieved successfully.",
            data: totalUsers,
        });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};


//------------------
// Results Analysis
//----------------------

const getAllResults = async (req, res) => {
    try {
        // Step 1: Fetch all results
        const allResults = await Result.find();

        // Step 2: Extract unique paper keys
        const uniquePaperKeys = [...new Set(allResults.map(result => result.paperKey))];

        // Step 3: Find unique users for each paperKey
        const paperKeyData = uniquePaperKeys.map(paperKey => {
            const paperResults = allResults.filter(result => result.paperKey === paperKey); // Filter results by paperKey
            const uniqueUsers = [...new Set(paperResults.map(result => result.user.toString()))];
            return { paperKey, uniqueUsers, paperResults };
        });


        // Step 4: Fetch question papers for each paperKey
        const questionPapers = await QuestionPaper.find({ paperKey: { $in: uniquePaperKeys } }, { questions: 0 });
        const paperKeyToQuestionPaper = questionPapers.reduce((acc, qp) => {
            acc[qp.paperKey] = qp; // Map paperKey to its question paper object
            return acc;
        }, {});

        // Step 5: Prepare final data
        const finalData = paperKeyData.map(({ paperKey, uniqueUsers, paperResults }) => {
            const questionPaper = paperKeyToQuestionPaper[paperKey]; // Fetch question paper details

            return {
                paperKey,
                questionPaper: {
                    title: questionPaper.title,
                    startTime: questionPaper.startTime,
                    endTime: questionPaper.endTime,
                    classyear: questionPaper.classyear,
                }, // Question paper details
                numberOfUniqueUsers: uniqueUsers.length, // Count of unique users
                // uniqueUsers, // List of unique user IDs
                // results: paperResults // All results for this paperKey
            };
        });

        // Return response
        return res.status(200).json({
            success: true,
            data: finalData
        });

    } catch (error) {
        console.error('Error fetching results:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching results'
        });
    }
};


//--------------------
//Question Paper Result
//--------------------

const getPaperDetails = async (req, res) => {
    try {
        const { paperKey } = req.params; // Step 1: Get the paperKey from request params

        // Step 1: Fetch the question paper using paperKey
        const questionPaper = await QuestionPaper.findOne({ paperKey }, { questions: 0 }); // Exclude questions for brevity
        if (!questionPaper) {
            return res.status(404).json({ success: false, message: "Question paper not found" });
        }

        // Step 2: Fetch results associated with the paperKey
        const paperResults = await Result.find({ paperKey });
        if (paperResults.length === 0) {
            return res.status(404).json({ success: false, message: "No results found for this paperKey" });
        }

        // Step 3: Calculate total points and attempted questions for each user
        const userData = {};
        paperResults.forEach(result => {
            const userId = result.user.toString();
            if (!userData[userId]) {
                userData[userId] = {
                    totalPoints: 0,
                    correctAnswers: 0,
                    attemptedQuestions: 0,
                    userDetails: null // Placeholder for user details
                };
            }
            userData[userId].totalPoints += result.points;
            userData[userId].attemptedQuestions += 1;
            // If result.point >0 then increase by 1 correct answer

            // Increase correctAnswers only if points > 0
            if (result.points > 0) {
                userData[userId].correctAnswers += 1;
            }
        });

        // Step 4: Fetch user details for all unique users
        const userIds = Object.keys(userData);
        const users = await User.find({ _id: { $in: userIds } }, { name: 1, username: 1, classy: 1, division: 1 }); // Fetch only necessary fields

        // Attach user details to userData
        users.forEach(user => {
            const userId = user._id.toString();
            if (userData[userId]) {
                userData[userId].userDetails = user;
            }
        });

        // Prepare final data and sort by totalPoints
        const sortedUsers = Object.keys(userData)
            .map(userId => ({
                userId,
                totalPoints: userData[userId].totalPoints,
                attemptedQuestions: userData[userId].attemptedQuestions,
                userDetails: userData[userId].userDetails,
                correctAnswers: userData[userId].correctAnswers,
            }))
            .sort((a, b) => b.totalPoints - a.totalPoints);

        // Prepare final data
        const finalData = {
            questionPaper: {
                title: questionPaper.title,
                startTime: questionPaper.startTime,
                endTime: questionPaper.endTime,
                isQuiz: questionPaper.isQuiz,
                isFastQuiz: questionPaper.isFastQuiz,
            },
            users: sortedUsers,// Sorted users with their details
        };

        // Return the response
        return res.status(200).json({
            success: true,
            data: finalData
        });
    } catch (error) {
        console.error('Error fetching paper details:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching paper details'
        });
    }
};

//------------------
// LeaderBoard
//------------------
const getLeaderboard = async (req, res) => {
    try {
        // Step 1: Fetch all users
        const users = await User.find({}, { name: 1, username: 1 }); // Fetch only necessary fields
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "No users found" });
        }

        // Step 2: Calculate total points for each user
        const leaderboardData = await Promise.all(users.map(async (user) => {
            const userResults = await Result.find({ user: user._id }); // Fetch results for this user
            const totalPoints = userResults.reduce((sum, result) => sum + result.points, 0); // Sum up points

            return {
                userId: user._id,
                name: user.name,
                username: user.username,
                totalPoints
            };
        }));

        // Step 3: Rank users by their total points
        leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints); // Descending order

        // Add rank to each user
        leaderboardData.forEach((data, index) => {
            data.rank = index + 1;
        });

        // Step 4: Return the response
        return res.status(200).json({
            success: true,
            data: leaderboardData
        });

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching leaderboard"
        });
    }
};


// ---------------------------
// Delete User Specefix Question Paper Result
// --------------------------
const deleteUserPaperResult = async (req, res) => {
    try {
        const { userId, paperKey } = req.params; // Extract userId and paperKey from request parameters
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        // Check if the user and paperKey exist
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const paperExists = await QuestionPaper.exists({ paperKey });
        if (!paperExists) {
            return res.status(404).json({
                success: false,
                message: "Question paper not found"
            });
        }

        // Delete results for the given user and paperKey
        const deletedResults = await Result.deleteMany({ user: userId, paperKey });

        if (deletedResults.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No results found for the specified user and question paper"
            });
        }

        // Return success response
        return res.status(200).json({
            success: true,
            message: `${deletedResults.deletedCount} result(s) deleted successfully`
        });

    } catch (error) {
        next(error);
    }
};


//-----------------------
// Download Question Paper Result 
// --------------------------
const exportPaperDetails = async (req, res, next) => {
    try {
        const { paperKey } = req.params; // Step 1: Get the paperKey from request params

        // Step 1: Fetch the question paper using paperKey
        const questionPaper = await QuestionPaper.findOne({ paperKey }, { questions: 0 }); // Exclude questions for brevity
        if (!questionPaper) {
            return res.status(404).json({ success: false, message: "Question paper not found" });
        }

        // Step 2: Fetch results associated with the paperKey
        const paperResults = await Result.find({ paperKey });
        if (paperResults.length === 0) {
            return res.status(404).json({ success: false, message: "No results found for this paperKey" });
        }

        // Step 3: Calculate total points and attempted questions for each user
        const userData = {};
        paperResults.forEach(result => {
            const userId = result.user.toString();
            if (!userData[userId]) {
                userData[userId] = {
                    totalPoints: 0,
                    attemptedQuestions: 0,
                    userDetails: null,// Placeholder for user details
                    correctAnswers: 0,
                };
            }
            userData[userId].totalPoints += result.points;
            userData[userId].attemptedQuestions += 1;
            if (result.points > 0) {
                userData[userId].correctAnswers += 1;
            }
        });

        // Step 4: Fetch user details for all unique users
        const userIds = Object.keys(userData);
        const users = await User.find({ _id: { $in: userIds } }, { name: 1, username: 1, classy: 1, division: 1 }); // Fetch only necessary fields

        // Attach user details to userData
        users.forEach(user => {
            const userId = user._id.toString();
            if (userData[userId]) {
                userData[userId].userDetails = user;
            }
        });

        // Prepare final data and sort by totalPoints
        const sortedUsers = Object.keys(userData)
            .map(userId => ({
                userId,
                totalPoints: userData[userId].totalPoints,
                attemptedQuestions: userData[userId].attemptedQuestions,
                correctAnswers: userData[userId].correctAnswers,
                name: userData[userId].userDetails?.name || 'N/A',
                username: userData[userId].userDetails?.username || 'N/A',
                classy: userData[userId].userDetails?.classy || 'N/A',
                division: userData[userId].userDetails?.division || 'N/A',
            }))
            .sort((a, b) => b.totalPoints - a.totalPoints);

        // Prepare CSV data
        const csvFields = [
            // { label: 'User ID', value: 'userId' },
            { label: 'Name', value: 'name' },
            { label: 'Username', value: 'username' },
            { label: 'Class', value: 'classy' },
            { label: 'Division', value: 'division' },
            { label: 'Total Points', value: 'totalPoints' },
            { label: 'Attempted Questions', value: 'attemptedQuestions' },
            { label: 'Correct Questions', value: 'correctAnswers' }
        ];

        const csvHeader = `
        Question Paper Details
        Title: ${questionPaper.title}
        Class: ${questionPaper.classyear}
        Division: ${questionPaper.division}
        Batch: ${questionPaper.batch}
        Start Time: ${questionPaper.startTime}
        End Time: ${questionPaper.endTime}
        Is Quiz: ${questionPaper.isQuiz}
        Is Fast Quiz: ${questionPaper.isFastQuiz}
                `.trim();

        const json2csvParser = new Parser({ fields: csvFields });
        const csvBody = json2csvParser.parse(sortedUsers);
        const csvData = `${csvHeader}\n\n${csvBody}`;

        // Prepare final data
        const finalData = {
            questionPaper: {
                title: questionPaper.title,
                startTime: questionPaper.startTime,
                endTime: questionPaper.endTime,
                isQuiz: questionPaper.isQuiz,
                isFastQuiz: questionPaper.isFastQuiz,
            },
            users: sortedUsers,// Sorted users with their details
        };

        res.header('Content-Type', 'text/csv');
        res.attachment(`${questionPaper.title.replace(/\s+/g, '_')}_Results.csv`);
        return res.status(200).send(csvData);

        // Return the response
        // return res.status(200).json({
        //     success: true,
        //     data: finalData
        // });
    } catch (error) {
        console.error('Error fetching paper details:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching paper details'
        });
    }
};


//--------------------------------
// DELETE USER
//----------------------------------

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        // console.log("user ID : ",userId)
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Find and delete the user
        const userData = await User.findByIdAndDelete(userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete related data concurrently
        const [cheatData, resultsData] = await Promise.all([
            Cheat.deleteMany({ user: userData._id }),
            Result.deleteMany({ user: userData._id })
        ]);
        await CodeSubmission.deleteMany({ userId: userId });
        await ContestCheat.deleteMany({ user: userId })
        await CodeContestSubmission.deleteMany({ userId: userId });
        // Check if any related data was deleted
        let relatedDataMessage = "User and related data deleted successfully";

        if (cheatData.deletedCount === 0 && resultsData.deletedCount === 0) {
            relatedDataMessage = "User deleted, but no related cheat or result data found";
        } else {
            if (cheatData.deletedCount === 0) {
                relatedDataMessage = "User deleted, but no cheat data found";
            }
            if (resultsData.deletedCount === 0) {
                relatedDataMessage = "User deleted, but no result data found";
            }
        }

        return res.status(200).json({
            message: relatedDataMessage,
        });
    } catch (error) {
        next(error);
    }
};



// -------------
// Update Profile
// ---------------
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.userID;
        const { name, username, email, phone, subject, password } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "User ID is required" })
        }
        // Validate All Fields
        const updateData = {};
        if (name) updateData.name = name;
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (subject) updateData.subject = subject;
        if (password) {
            const saltRound = await bcrypt.genSalt(10);
            const hash_password = await bcrypt.hash(password, saltRound);
            updateData.password = hash_password;
        }
        const updatedUser = await Faculty.findByIdAndUpdate({ _id: userId }, updateData, { new: true }).exec();
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({ message: "User Profile Updated successfully" })

    } catch (error) {
        next(error);
    }
}


// --------------------
// Quiz Exam Cheat Data GET
// --------------------
const getQuizCheatData = async (req, res, next) => {
    try {
        const { paperKey } = req.params;

        if (!paperKey) {
            return res.status(400).json({ message: "Quiz paperKey is required" });
        }

        // Check if QuestionPaper with this paperKey exists
        const isExist = await QuestionPaper.findOne({ paperKey: paperKey });

        if (!isExist) {
            return res.status(404).json({ message: "Paper Not Found" });
        }

        // Fetch all cheat records for the paperKey and populate user details
        const cheatData = await Cheat.find({ paperKey: paperKey }).populate('user', '-password').exec();

        return res.status(200).json({
            message: "Cheat data fetched successfully",
            cheatData,
            count: cheatData.length,
        });

    } catch (error) {
        console.error("Error in getQuizCheatData:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// --------------------
// Code Contest Cheat Data GET
// --------------------
const getContestCheatData = async (req, res, next) => {
    try {
        const { problemId } = req.params;

        if (!problemId) {
            return res.status(400).json({ message: "Contest problemId is required" });
        }
        // Valid Problem id by Mongoose Object Id
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: "Invalid Problem Id" });
        }

        // Check if QuestionPaper with this paperKey exists
        const isExist = await CodeContest.findOne({ _id: problemId });

        if (!isExist) {
            return res.status(404).json({ message: "Code Contest Not Found" });
        }

        // Fetch all cheat records for the paperKey and populate user details
        const cheatData = await Cheat.find({ problemId: problemId }).populate('user', '-password').exec();

        return res.status(200).json({
            message: "Cheat data fetched successfully",
            cheatData,
            count: cheatData.length,
        });

    } catch (error) {
        console.error("Error in getQuizCheatData:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ---------------------
// Delete Quiz Cheat Of Particular Student
// ---------------------

const deleteQuizCheatStudent = async (req, res, next) => {
    try {
        const { studentId, paperKey } = req.params;

        if (!studentId || !paperKey) {
            return res.status(400).json({ message: "All Fields Are Required" });
        }

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "Invalid Student Id" });
        }

        // Check if QuestionPaper with this paperKey exists
        const isExist = await QuestionPaper.findOne({ paperKey });

        if (!isExist) {
            return res.status(404).json({ message: "Paper Not Found" });
        }

        // Find and delete the cheat entry
        const deleted = await Cheat.findOneAndDelete({ user: studentId, paperKey });

        if (!deleted) {
            return res.status(404).json({ message: "Cheat record not found for this student and paper" });
        }

        return res.status(200).json({
            message: "Cheat record deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting cheat record:", error);
        next(error);
    }
};



module.exports = { getUsers, getUser, getTotalUsers, getAllResults, getPaperDetails, getLeaderboard, deleteUserPaperResult, exportPaperDetails, deleteUser, updateProfile, getQuizCheatData, getContestCheatData,deleteQuizCheatStudent };
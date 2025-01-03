require("dotenv").config();
const User = require("../database/models/user-model");
const mongoose = require("mongoose");

const QuestionPaper = require("../database/models/question-paper-model");
const Result = require("../database/models/result-model");
const Cheat = require("../database/models/cheat-model");
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
                    attemptedQuestions: 0,
                    userDetails: null // Placeholder for user details
                };
            }
            userData[userId].totalPoints += result.points;
            userData[userId].attemptedQuestions += 1;
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
                userDetails: userData[userId].userDetails
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





module.exports = { getUsers, getUser, getTotalUsers, getAllResults, getPaperDetails, getLeaderboard,deleteUserPaperResult };
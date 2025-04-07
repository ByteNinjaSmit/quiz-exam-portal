require("dotenv").config();
const User = require("../database/models/user-model");
const mongoose = require("mongoose");
const QuestionPaper = require("../database/models/question-paper-model");
const bcrypt = require("bcryptjs");
const Result = require("../database/models/result-model");


const getExam = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { classyear } = req.params;
        const { division, batch, department, isHonors } = req.user;
        if (!classyear) {
            return res.status(400).json({ message: "Class year is required" });
        }
        if (!division) {
            return res.status(400).json({ message: "Division is required" });
        }
        if (!batch) {
            return res.status(400).json({ message: "Batch is required" });
        }
        if (!department) {
            return res.status(400).json({ message: "Department is required" });
        }
        if (!isHonors) {
            return res.status(400).json({ message: "Is Honors is required" });
        }
        // Fetch exams where classyear matches or is 'All', and isPublished is true
        const exams = await QuestionPaper.find({
            isPublished: true, // Ensure only published exams
            $or: [
                // 1. Exact match on everything OR isHonors = "ALL"
                { classyear, division, batch, department, isHonors },
                { classyear, division, batch, department, isHonors: "ALL" },

                // 2. Fully generic
                { classyear: "ALL", division: "ALL", batch: "ALL", department: "ALL", isHonors },
                { classyear: "ALL", division: "ALL", batch: "ALL", department: "ALL", isHonors: "ALL" },

                // 3. Dept = ALL, classyear ≠ ALL → division & batch must be ALL
                { classyear, division: "ALL", batch: "ALL", department: "ALL", isHonors },
                { classyear, division: "ALL", batch: "ALL", department: "ALL", isHonors: "ALL" },

                // 4. Dept match, classyear match, division = ALL, batch = ALL
                { classyear, division: "ALL", batch: "ALL", department, isHonors },
                { classyear, division: "ALL", batch: "ALL", department, isHonors: "ALL" },

                // 5. Dept match, classyear match, division match, batch = ALL
                { classyear, division, batch: "ALL", department, isHonors },
                { classyear, division, batch: "ALL", department, isHonors: "ALL" },
            ]
        })
            .select("-questions") // Exclude questions from response
            .sort({ createdAt: -1 }); // Sort by creation date (newest first)

        // Slice to get only the first two exams
        const slicedExams = exams.slice(0, 2);

        // if (slicedExams.length === 0) {
        //     return res.status(404).json({ message: "No published exams found for this class year" });
        // }

        return res.status(200).json({ exams: slicedExams });
    } catch (error) {
        next(error);
    }
};

const getExams = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { classyear } = req.params;
        const { division, batch, department,isHonors } = req.user;
        if (!classyear) {
            return res.status(400).json({ message: "Class year is required" });
        }
        if (!division) {
            return res.status(400).json({ message: "Division is required" });
        }
        if (!batch) {
            return res.status(400).json({ message: "Batch is required" });
        }
        if (!department) {
            return res.status(400).json({ message: "Department is required" });
        }
        if(isHonors){
            return res.status(400).json({ message: "isHonors is required" });
        }

        // Query prioritization order: Exact match first, "ALL" only if needed
        const exams = await QuestionPaper.find({
            isPublished: true, // Ensure only published exams
            $or: [
                // 1. Exact match on everything OR isHonors = "ALL"
                { classyear, division, batch, department, isHonors },
                { classyear, division, batch, department, isHonors: "ALL" },

                // 2. Fully generic
                { classyear: "ALL", division: "ALL", batch: "ALL", department: "ALL", isHonors },
                { classyear: "ALL", division: "ALL", batch: "ALL", department: "ALL", isHonors: "ALL" },

                // 3. Dept = ALL, classyear ≠ ALL → division & batch must be ALL
                { classyear, division: "ALL", batch: "ALL", department: "ALL", isHonors },
                { classyear, division: "ALL", batch: "ALL", department: "ALL", isHonors: "ALL" },

                // 4. Dept match, classyear match, division = ALL, batch = ALL
                { classyear, division: "ALL", batch: "ALL", department, isHonors },
                { classyear, division: "ALL", batch: "ALL", department, isHonors: "ALL" },

                // 5. Dept match, classyear match, division match, batch = ALL
                { classyear, division, batch: "ALL", department, isHonors },
                { classyear, division, batch: "ALL", department, isHonors: "ALL" },
            ]

        })
            .select("-questions") // Exclude questions from response
            .sort({ createdAt: -1 }); // Sort by creation date (newest first)

        return res.status(200).json({ exams });
    } catch (error) {
        next(error);
    }
};

// ---------------------
// Edit Profile
// ---------------------

const updateUser = async (req, res, next) => {
    const userId = req.userID;
    // console.log("Update Password UserId: ",userId);
    // console.log("userData",req.user);

    const { password } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "User ID is required" })
        }

        // passeword exceptional
        if (!password) {
            return res.status(400).json({ message: "Please enter Password fields" });
        }
        const updateData = {};
        // If the password is provided, hash it before updating
        if (password) {
            const saltRound = await bcrypt.genSalt(10);
            const hash_password = await bcrypt.hash(password, saltRound);
            updateData.password = hash_password;
        }
        const updatedUser = await User.findByIdAndUpdate({ _id: userId }, updateData, { new: true }).exec();
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({ message: "User Profile Updated successfully" })


    } catch (error) {
        next(error)
    }
}

// ----------------------
// Particular Exam LeaderBoard
// ----------------------
const getExamLeaderBoard = async (req, res, next) => {
    try {
        const { paperKey } = req.params;
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
                    userDetails: null // Placeholder for user details
                };
            }
            userData[userId].totalPoints += result.points;
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
                userDetails: userData[userId].userDetails,
            }))
            .sort((a, b) => b.totalPoints - a.totalPoints);
        // Add rank to each user
        sortedUsers.forEach((data, index) => {
            data.rank = index + 1;
        });
        // Prepare final data
        const leaderboardData = {
            questionPaper: {
                title: questionPaper.title,
            },
            users: sortedUsers,// Sorted users with their details
        };


        // Return the response
        return res.status(200).json({
            success: true,
            data: leaderboardData
        });
    } catch (error) {
        next(error);
    }
}


module.exports = { getExam, getExams, updateUser, getExamLeaderBoard };
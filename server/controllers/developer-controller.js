require("dotenv").config();
const Developer = require("../database/models/developer-model");
const User = require("../database/models/user-model");
const Faculty = require("../database/models/faculty-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
// ALL MODEL OTHERS
const Cheat = require("../database/models/cheat-model");
const Result = require("../database/models/result-model");
const QuestionPaper = require("../database/models/question-paper-model");
const fs = require('fs').promises; // Promisified fs module for async/await

// *--------------------------
// Developer Registration Logic
// *--------------------------


const developerRegister = async (req, res) => {
    try {
        // const { name, username, email, password } = req.body;
        const name = process.env.DEVELOPER_NAME;
        const username = process.env.DEVELOPER_USERNAME;
        const email = process.env.DEVELOPER_EMAIL;
        const password = process.env.DEVELOPER_PASSWORD;


        const userExist = await Developer.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Creating Account
        const userCreated = await Developer.create({
            name,
            username,
            email,
            password,
        });

        res.status(200).json({
            message: "Registration Successful",
        });
    } catch (error) {
        next(error);
    }
}

// *--------------------------
// Developer Login Logic
// *--------------------------
const developerLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists
        const userExist = await Developer.findOne({ username });
        if (!userExist) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Validate password
        const user = await userExist.comparePassword(password);
        if (user) {
            // Generate token
            const token = await userExist.generateToken();

            return res.status(200).json({
                message: "Login Successful",
                token,
                userId: userExist._id.toString(),
            });
        } else {
            return res.status(401).json({ message: "Invalid Email Or Password" });
        }
    } catch (error) {
        next(error);
    }
};

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
// ---------------------------
// GET ALL Admins
// -----------------------

const getAdmins = async (req, res, next) => {
    try {
        const users = await Faculty.find({}, { password: 0 }).exec();
        return res.status(200).json(users);
    } catch (error) {
        next(error)
    }
}

// *--------------------------
// User Registration Logic
// *--------------------------
const userRegister = async (req, res, next) => {
    try {
        // const reqBody = await request.json();
        const { name, username, classy, division, rollNo, password } = req.body;
        // Validate that all fields are provided
        if (!username || !classy || !name || !division || !password || !rollNo) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await User.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Creating Account
        await User.create({
            name,
            username,
            classy,
            division,
            rollNo,
            password
        });

        res.status(200).json({
            message: "Registration Successful",
        });
    } catch (error) {
        next(error);
    }
}

// *--------------------------
// Faculty Registration Logic
// *--------------------------

const facultyRegister = async (req, res, next) => {
    try {
        // const reqBody = await request.json();
        const { name, username, email, isTeacher, isHod, subject, isTnp, phone, password } = req.body;
        // Validate that all fields are provided
        if (!username || !email || !phone || !password || !name || !subject) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await Faculty.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "Faculty already exists" });
        }

        // Creating Account
        const userCreated = await Faculty.create({
            name,
            username,
            email,
            phone,
            isTeacher,
            isHod,
            subject,
            isTnp,
            password
        });

        res.status(200).json({ message: "Registration Successful" });
    } catch (error) {
        next(error);
    }
}

//--------------------------------
// DELETE USER
//----------------------------------

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

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
            deletedRelatedData: {
                cheatsDeleted: cheatData.deletedCount,
                resultsDeleted: resultsData.deletedCount,
            },
        });
    } catch (error) {
        next(error);
    }
};


//--------------------------------
// DELETE FACULTY
//--------------------------------
const deleteFaculty = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Find and delete the faculty
        const facultyData = await Faculty.findByIdAndDelete(userId);
        if (!facultyData) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Fetch related QuestionPapers
        const questionPapers = await QuestionPaper.find({ createdBy: facultyData._id });

        // also deleting the results
        // Result.deleteMany({paperKey: questionpaper.paperKey})
        // Delete associated results using paperKey
        const deleteResults = await Result.deleteMany({
            paperKey: { $in: questionPapers.map((paper) => paper.paperKey) }
        });

        // Delete associated Cheats using PaperKey
        const deleteCheats = await Cheat.deleteMany({
            paperKey: {
                $in: questionPapers.map((paper) => paper.paperKey)
            }
        });

        // Iterate over the question papers and delete the image files
        for (let paper of questionPapersData) {
            if (paper.questions) {
                for (let question of paper.questions) {
                    if (question.image) {
                        // Assuming image path is relative to the root directory, adjust if needed
                        const filePath = path.join(__dirname, '..', question.image);
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Failed to delete file: ${filePath}`, err);
                            } else {
                                console.log(`Successfully deleted file: ${filePath}`);
                            }
                        });
                    }
                }
            }
        }

        // Delete the question papers after deleting their images
        const deleteResult = await QuestionPaper.deleteMany({ createdBy: facultyData._id });

        return res.status(200).json({
            message: "Faculty and related data deleted successfully",
            deletedRelatedData: {
                questionPapersDeleted: deleteResult.deletedCount,
                resultsDeleted: deleteResults.deletedCount,
                cheatsDeleted: deleteCheats.deletedCount,
            },
        });
    } catch (error) {
        next(error);
    }
};



module.exports = { developerRegister, developerLogin, getUsers, getAdmins, facultyRegister, userRegister, deleteUser,deleteFaculty };
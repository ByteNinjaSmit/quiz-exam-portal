require("dotenv").config();
const User = require("../database/models/user-model");
const mongoose = require("mongoose");
const QuestionPaper = require("../database/models/question-paper-model");
const bcrypt = require("bcryptjs");


const getExam = async (req, res, next) => {
    try {
        const { classyear } = req.params;
        if (!classyear) {
            return res.status(400).json({ message: "Class year is required" });
        }

        // Fetch exams where classyear matches or is 'All', and isPublished is true
        const exams = await QuestionPaper.find({
            $or: [{ classyear: classyear }, { classyear: "ALL" }],
            isPublished: true, // Ensure that only published exams are fetched
        })
            .select("-questions") // Exclude questions from the result
            .sort({ createdAt: -1 }); // Sort by creation date

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
        const { classyear } = req.params;
        if (!classyear) {
            return res.status(400).json({ message: "Class year is required" });
        }

        // Fetch exams where classyear matches or is 'All', and isPublished is true
        const exams = await QuestionPaper.find({
            $or: [{ classyear: classyear }, { classyear: "ALL" }],
            isPublished: true, // Ensure that only published exams are fetched
        })
            .select("-questions") // Exclude questions from the result
            .sort({ createdAt: -1 }); // Sort by creation date

        // Slice to get only the first two exams
        // const slicedExams = exams.slice(0, 2);

        // if (exams.length === 0) {
        //     return res.status(404).json({ message: "No published exams found for this class year" });
        // }
        return res.status(200).json({ exams: exams });
    } catch (error) {
        next(error);
    }
}

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


module.exports = { getExam, getExams,updateUser};
require("dotenv").config();
const User = require("../database/models/user-model");
const mongoose = require("mongoose");
const QuestionPaper = require("../database/models/question-paper-model");


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

const getExams = async(req,res,next)=>{
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
        return res.status(200).json({ exams: exams  });
    } catch (error) {
        next(error);
    }
}

    
module.exports = { getExam,getExams};
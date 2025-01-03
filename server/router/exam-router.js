const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const facultyMiddleware = require("../middlewares/faculty-middleware");

const multer = require('multer');
const path = require('path');

router.route("/all/exams").get(authMiddleware,examController.getExams);
router.route("/set/result").post(authMiddleware,examController.storeResult);
//  to post is Cheated or not
router.route("/set/cheat").post(authMiddleware,examController.postCheat);
// To get
router.route("/cheat-status/:user/:paperKey").get(authMiddleware,examController.getCheatStatus);


// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './database/uploads'); // Directory where files are stored
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + "_" + Date.now() +"_"+Math.round(Math.random() * 1e9) + path.extname(file.originalname) // Unique file name
      );
    },
  });

const upload = multer({
    storage:storage,
})
// To upload file
router.route("/new-exam").post(authMiddleware,facultyMiddleware,upload.array('files',20),examController.newExam);

// Get Recent Exam Result For home
router.route("/get/results/:userId").get(authMiddleware,examController.GetResultsOfUserRecent);
//  GET ALL Paper Of Single User
router.route("/get/all/results/:userId").get(authMiddleware,examController.GetResultsOfUser);
// GET Result Of Single Question Paper
router.route("/get/result/:userId/:key").get(authMiddleware,examController.GetResultOfSinglePaper);

// Make For Delete Exam
router.route("/delete/exam/:examId").delete(authMiddleware,facultyMiddleware,examController.deleteExam);

// view question paper GET
router.route("/view/exam/:examId/:title/:paperkey").get(authMiddleware,facultyMiddleware,examController.getExamQuestionPaperData);

// GET Leaderboard
router.route("/get/leaderboard").get(authMiddleware,examController.getLeaderBoard);



module.exports = router;
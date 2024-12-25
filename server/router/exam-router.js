const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam-controller");
const authMiddleware = require("../middlewares/auth-middleware");
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
router.route("/new-exam").post(authMiddleware,upload.array('files',20),examController.newExam);



module.exports = router;
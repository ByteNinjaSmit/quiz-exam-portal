const express  = require("express");
const router = express.Router();
const userControllers = require("../controllers/user-controller");
const authMiddleware = require("../middlewares/auth-middleware");

router.route("/get-exam/:classyear").get(userControllers.getExam);
router.route("/get-exams/:classyear").get(userControllers.getExams)

router.route("/update-profile").patch(authMiddleware,userControllers.updateUser);
router.route("/get-current-quiz/leaderboard/:paperKey").get(authMiddleware,userControllers.getExamLeaderBoard)

module.exports = router;
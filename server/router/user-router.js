const express  = require("express");
const router = express.Router();
const userControllers = require("../controllers/user-controller");

router.route("/get-exam/:classyear").get(userControllers.getExam);
router.route("/get-exams/:classyear").get(userControllers.getExams)
module.exports = router;
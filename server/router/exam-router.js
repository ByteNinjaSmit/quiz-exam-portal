const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam-controller");
const { signupSchema, logininSchema } = require("../validators/auth-validator");
const authMiddleware = require("../middlewares/auth-middleware");

router.route("/all/exams").get(authMiddleware,examController.getExams);

module.exports = router;
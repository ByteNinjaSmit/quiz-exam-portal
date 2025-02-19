const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const CodeProblemControllers = require("../controllers/code-problem-controller");
const facultyMiddleware = require("../middlewares/faculty-middleware");



// Post Code
router.route("/new-problem").post(authMiddleware, facultyMiddleware, CodeProblemControllers.createProblem);

// GEt Problem 
router.route("/get-problem/:id").get(authMiddleware, CodeProblemControllers.getProblemById);
// GET All Problems for table mapping
router.route("/get-all-problems").get(authMiddleware, CodeProblemControllers.getProblems);
// Submit the Submission
router.route("/submit-problem").post(authMiddleware, CodeProblemControllers.submitSubmission);
// Get Submission 
router.route("/get-submission/:problemId/:userId").get(authMiddleware, CodeProblemControllers.getAllSubmissionByUserByProblem);
// Delete Problem by Id
router.route("/delete-problem/:problemId").delete(authMiddleware, facultyMiddleware, CodeProblemControllers.deleteProblemById);

module.exports = router;

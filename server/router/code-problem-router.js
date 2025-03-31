const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const CodeProblemControllers = require("../controllers/code-problem-controller");
const facultyMiddleware = require("../middlewares/faculty-middleware");



// Post Code
router.route("/new-problem").post(authMiddleware, facultyMiddleware, CodeProblemControllers.createProblem);
// New Contest Post
router.route("/new-coding-contest").post(authMiddleware, facultyMiddleware, CodeProblemControllers.createCodeContest);

// GEt Problem 
router.route("/get-problem/:id").get(authMiddleware, CodeProblemControllers.getProblemById);
router.route("/get-contest/:id").get(authMiddleware, CodeProblemControllers.getContestById);
// GET All Problems for table mapping
router.route("/get-all-problems").get(authMiddleware, CodeProblemControllers.getProblems);
router.route("/get-all-contest").get(authMiddleware, CodeProblemControllers.getContests);
router.route("/get-latest-contest").get(authMiddleware, CodeProblemControllers.getTop2Contests);

// Submit the Submission
router.route("/submit-problem").post(authMiddleware, CodeProblemControllers.submitSubmission);
router.route("/submit-contest").post(authMiddleware, CodeProblemControllers.submitContestSubmission);
// Get Submission 
router.route("/get-submission/:problemId/:userId").get(authMiddleware, CodeProblemControllers.getAllSubmissionByUserByProblem);
router.route("/get-contest-submission/:problemId/:userId").get(authMiddleware, CodeProblemControllers.getAllContestSubmissionByUserByProblem);
// Delete Problem by Id
router.route("/delete-problem/:problemId").delete(authMiddleware, facultyMiddleware, CodeProblemControllers.deleteProblemById);
router.route("/delete-coding-contest/:problemId").delete(authMiddleware, facultyMiddleware, CodeProblemControllers.deleteCodingContestById);
//  to post is Cheated or not
router.route("/set/cheat").post(authMiddleware,CodeProblemControllers.postContestCheat);
// To get
router.route("/cheat-status/:user/:problemId").get(authMiddleware,CodeProblemControllers.getContestCheatStatus);

// Get Result Of Code Contest 
router.route("/get-contest-result/:id").get(authMiddleware,facultyMiddleware,CodeProblemControllers.getResultOfSingleContest);

// Update Coding Contest by Id
router.route("/update-coding-contest/:id").put(authMiddleware, facultyMiddleware, CodeProblemControllers.updateCodeContest);

module.exports = router;

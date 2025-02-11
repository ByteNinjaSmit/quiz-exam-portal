const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const CodeProblemControllers = require("../controllers/code-problem-controller");



// Post Code
router.route("/new-problem").post(authMiddleware,CodeProblemControllers.createProblem);

// GEt Problem 
router.route("/get-problem/:id").get(CodeProblemControllers.getProblemById);
// GET All Problems for table mapping
router.route("/get-all-problems").get(CodeProblemControllers.getProblems);
module.exports = router;

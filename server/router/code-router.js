// ./server/router/code-router.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const CodeControllers = require("../controllers/code-controller");
const CodeJudgeCOntrollers = require("../controllers/code-judge-controller");

// Post Code
router.route("/run-code").post(authMiddleware,CodeControllers.executeAndFetchResult);
// router.route("/run-code").post(authMiddleware,CodeControllers.executeAndFetchResult);

//  New Code Judge 
router.route("/new-code-judge").post(CodeJudgeCOntrollers.executeCodeSubmission);




module.exports = router;
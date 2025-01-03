// ./server/router/code-router.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const CodeControllers = require("../controllers/code-controller");

// Post Code
router.route("/run-code").post(authMiddleware,CodeControllers.executeAndFetchResult);



module.exports = router;
// ./server/router/code-router.js
const express = require("express");
const router = express.Router();

const CodeControllers = require("../controllers/code-controller");

// Post Code
router.route("/run-code").post(CodeControllers.executeAndFetchResult);



module.exports = router;
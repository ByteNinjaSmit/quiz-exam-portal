
const express = require("express");
const router = express.Router();
const DevloperControllers = require("../controllers/developer-controller");


// Register
router.route("/register-developer").post(DevloperControllers.developerRegister);
// Login
router.route("/login-developer").post(DevloperControllers.developerLogin);


module.exports = router;
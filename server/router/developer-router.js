
const express = require("express");
const router = express.Router();
const DevloperControllers = require("../controllers/developer-controller");


// Register
router.route("/register-developer").post(DevloperControllers.developerRegister);
router.route("/register-faculty").post(DevloperControllers.facultyRegister);
router.route("/register-user").post(DevloperControllers.userRegister);
// Login
router.route("/login-developer").post(DevloperControllers.developerLogin);
router.route("/get-all-users").get(DevloperControllers.getUsers);  // GET Current Developer
router.route("/get-all-admins").get(DevloperControllers.getAdmins);  // GET Current Developer

module.exports = router;
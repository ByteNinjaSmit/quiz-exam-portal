
const express = require("express");
const router = express.Router();
const DevloperControllers = require("../controllers/developer-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const devMiddleware = require("../middlewares/developer-middleware")


// Register
router.route("/register-developer").post(DevloperControllers.developerRegister);
router.route("/register-faculty").post(authMiddleware,devMiddleware,DevloperControllers.facultyRegister);
router.route("/register-user").post(authMiddleware,devMiddleware,DevloperControllers.userRegister);
// Login
router.route("/login-developer").post(DevloperControllers.developerLogin);
router.route("/get-all-users").get(authMiddleware,devMiddleware,DevloperControllers.getUsers);  // GET Current Developer
router.route("/get-all-admins").get(authMiddleware,devMiddleware,DevloperControllers.getAdmins);  // GET Current Developer

// Delete the user
router.route("/delete-user/:userId").delete(authMiddleware,devMiddleware,DevloperControllers.deleteUser);
// Delete The Faculty
router.route("/delete-faculty/:userId").delete(authMiddleware,devMiddleware,DevloperControllers.deleteFaculty);

module.exports = router;
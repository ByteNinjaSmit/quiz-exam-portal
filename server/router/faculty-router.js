const express = require("express");
const router = express.Router();
const facultyControllers = require("../controllers/faculty-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const facultyMiddleware = require("../middlewares/faculty-middleware");

// get all user
router
  .route("/get-all-users")
  .get(authMiddleware, facultyMiddleware, facultyControllers.getUsers);
// get single user
router
  .route("/get-user/:userId")
  .get(authMiddleware, facultyMiddleware, facultyControllers.getUser);

// get coutn total users
router.route("/get-users-count").get(authMiddleware,facultyMiddleware,facultyControllers.getTotalUsers);

// get results
router.route("/get-results").get(facultyControllers.getAllResults);

// get paper result
router.route("/get-paper-result/:paperKey").get(facultyControllers.getPaperDetails);
// get leaderboard
router.route("/get-leaderboard").get(facultyControllers.getLeaderboard);
// delete user result
router.route("/delete-user-result/:userId/:paperKey").delete(authMiddleware,facultyMiddleware,facultyControllers.deleteUserPaperResult)

// Export result get
router.route("/export-result/:paperKey").get(facultyControllers.exportPaperDetails)

// Delete User
router.route("/delete-user/:userId").delete(authMiddleware,facultyMiddleware,facultyControllers.deleteUser);


// Update Profile 
router.route("/update-profile").patch(authMiddleware,facultyMiddleware,facultyControllers.updateProfile);

module.exports = router;

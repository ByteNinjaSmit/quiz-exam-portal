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

// Get Quiz Cheat Data 
router.route("/get-quiz-cheat/:paperKey").get(authMiddleware,facultyMiddleware,facultyControllers.getQuizCheatData);
// Get Contest Cheat Data
router.route("/get-contest-cheat/:problemId").get(authMiddleware,facultyMiddleware,facultyControllers.getContestCheatData);
// Delete Quiz Cheat 
router.route("/delete-quiz-cheat/:studentId/:paperKey").delete(authMiddleware,facultyMiddleware,facultyControllers.deleteQuizCheatStudent);
// Update Warning Quiz Chaeat
router.route("/update-warning-quiz-cheat").patch(authMiddleware, facultyMiddleware, facultyControllers.toggleWarningQuizCheatStudent);
router.route("/update-ischeat-quiz-cheat").patch(authMiddleware, facultyMiddleware, facultyControllers.toggleIsCheatQuizStudent);

// Delete Contest Cheat 
router.route("/delete-contest-cheat/:studentId/:problemId").delete(authMiddleware,facultyMiddleware,facultyControllers.deleteContestCheatStudent);
// Update Warning & Cheat Contest Chaeat
router.route("/update-warning-contest-cheat").patch(authMiddleware, facultyMiddleware, facultyControllers.toggleWarningContestCheatStudent);
router.route("/update-ischeat-contest-cheat").patch(authMiddleware, facultyMiddleware, facultyControllers.toggleIsCheatContestStudent);



module.exports = router;

const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam-controller");
const authMiddleware = require("../middlewares/auth-middleware");

router.route("/all/exams").get(authMiddleware,examController.getExams);
router.route("/set/result").post(authMiddleware,examController.storeResult);
//  to post is Cheated or not
router.route("/set/cheat").post(authMiddleware,examController.postCheat);
// To get
router.route("/cheat-status/:user/:paperKey").get(authMiddleware,examController.getCheatStatus);

module.exports = router;
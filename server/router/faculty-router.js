const express = require("express");
const router = express.Router();
const facultyControllers = require("../controllers/developer-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const facultyMiddleware = require("../middlewares/faculty-middleware");


// get all user
router.get("/get-all-users", authMiddleware,facultyMiddleware,facultyControllers.getUsers);

module.exports = router;
const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controller");
const { signupSchema, logininSchema } = require("../validators/auth-validator");
const authMiddleware = require("../middlewares/auth-middleware");

const validate = require("../middlewares/validate-middleware");

router.route("/").get(authControllers.home);

// Register
// router.route("/register").post(validate(signupSchema), authControllers.register);
router.route("/register").post(validate(signupSchema),authControllers.userRegister);
router.route("/register/faculty").post(validate(signupSchema),authControllers.facultyRegister);
// Login  Of Student
router.route("/login").post(validate(logininSchema),authControllers.userLogin);
router.route("/login/faculty").post(validate(logininSchema),authControllers.facultyLogin);
router.route("/current/user").get(authMiddleware, authControllers.getCurrentUser);

// To Forgot Password
// router.route("/forgot-password").post(authControllers.forgotPassword);

// To Submit New Password 
// router.route("/reset-password/:id/:token").patch(authControllers.resetPassword);

module.exports = router;
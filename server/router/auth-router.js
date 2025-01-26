const express = require("express");
const router = express.Router();
const multer = require("multer");
const authControllers = require("../controllers/auth-controller");
const { signupSchema, logininSchema } = require("../validators/auth-validator");
const authMiddleware = require("../middlewares/auth-middleware");
const facultyMiddleware = require("../middlewares/faculty-middleware");
const devMiddleware = require("../middlewares/developer-middleware")
const validate = require("../middlewares/validate-middleware");
const path = require("path"); // Add this line


router.route("/").get(authControllers.home);

// Register
router.route("/register").post(authMiddleware,facultyMiddleware,authControllers.userRegister);   // user register
router.route("/register/faculty").post(authMiddleware,devMiddleware,authControllers.facultyRegister);
// Login  Of Student
router.route("/login").post(validate(logininSchema),authControllers.userLogin);
router.route("/login/faculty").post(validate(logininSchema),authControllers.facultyLogin);
router.route("/current/user").get(authMiddleware, authControllers.getCurrentUser);
// Update User Details
router.route("/update-user/:userId").put(authMiddleware, facultyMiddleware,authControllers.updateUser);


router.route("/user-template").get(authControllers.downloadTemplate);

// Upload Users
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './database/uploads'); // Directory where files are stored
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));

    },
  });

const upload = multer({
    storage:storage,
})
router.route("/upload-users").post(upload.single("csvFile"), authControllers.uploadUsers);



module.exports = router;
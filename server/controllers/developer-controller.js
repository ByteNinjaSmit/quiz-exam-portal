require("dotenv").config();
const Developer = require("../database/models/developer-model");
const User = require("../database/models/user-model");
const Faculty = require("../database/models/faculty-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// *--------------------------
// Developer Registration Logic
// *--------------------------


const developerRegister = async (req, res) => {
    try {
        // const { name, username, email, password } = req.body;
        const name = process.env.DEVELOPER_NAME;
        const username = process.env.DEVELOPER_USERNAME;
        const email = process.env.DEVELOPER_EMAIL;
        const password = process.env.DEVELOPER_PASSWORD;


        const userExist = await Developer.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Creating Account
        const userCreated = await Developer.create({
            name,
            username,
            email,
            password,
        });

        res.status(200).json({
            message: "Registration Successful",
        });
    } catch (error) {
        next(error);
    }
}

// *--------------------------
// Developer Login Logic
// *--------------------------
const developerLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists
        const userExist = await Developer.findOne({ username });
        if (!userExist) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Validate password
        const user = await userExist.comparePassword(password);
        if (user) {
            // Generate token
            const token = await userExist.generateToken();
            
            return res.status(200).json({
                message: "Login Successful",
                token,
                userId: userExist._id.toString(),
            });
        } else {
            return res.status(401).json({ message: "Invalid Email Or Password" });
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------
// GET ALL User
// -----------------------

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, { password: 0}).exec();
        res.status(200).json(users);
    } catch (error) {
        next(error)
    }
}
// ---------------------------
// GET ALL Admins
// -----------------------

const getAdmins = async (req, res, next) => {
    try {
        const users = await Faculty.find({}, { password: 0 }).exec();
        return res.status(200).json(users);
    } catch (error) {
        next(error)
    }
}

// *--------------------------
// User Registration Logic
// *--------------------------
const userRegister = async (req, res,next) => {
    try {
        // const reqBody = await request.json();
        const { name, username, classy, division,rollNo, password } = req.body;
        // Validate that all fields are provided
        if (!username || !classy || !name || !division || !password ||!rollNo) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await User.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Creating Account
        const userCreated = await User.create({
            name,
            username,
            classy,
            division,
            rollNo,
            password
        });

        res.status(200).json({
            message: "Registration Successful",
        });
    } catch (error) {
        next(error);
    }
}

// *--------------------------
// Faculty Registration Logic
// *--------------------------

const facultyRegister = async (req, res,next) => {
    try {
        // const reqBody = await request.json();
        const {name, username, email,isTeacher,isHod,subject,isTnp, phone, password } = req.body;
        // Validate that all fields are provided
        if (!username || !email || !phone || !password || !name  ||!subject) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await Faculty.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "Faculty already exists" });
        }

        // Creating Account
        const userCreated = await Faculty.create({
            name,
            username,
            email,
            phone,
            isTeacher,
            isHod,
            subject,
            isTnp,
            password
        });

        res.status(200).json({ message: "Registration Successful" });
    } catch (error) {
        next(error);
    }
}


module.exports = {developerRegister,developerLogin,getUsers,getAdmins,facultyRegister,userRegister };
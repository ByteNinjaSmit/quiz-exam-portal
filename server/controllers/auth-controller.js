require("dotenv").config();
const User = require("../database/models/user-model");
const Developer = require("../database/models/developer-model");
const Faculty = require("../database/models/faculty-model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); // Ensure mongoose is required for ObjectId validation
const bcrypt = require("bcryptjs");



// on Route
const home = async (req, res) => {
    try {
        res
            .status(200)
            .send(
                "Welcome to world best website mern series by smitraj using router"
            );
    } catch (error) {
        console.log(error);
    }
};


// *--------------------------
// User Registration Logic
// *--------------------------
const userRegister = async (req, res) => {
    try {
        const { name, username, classy, division, rollNo, password } = req.body;
        if (!name || !username || !classy || !division || !rollNo || !password) {
            return res.status(400).json({ msg: "Please enter all fields" });
        }
        const userExist = await User.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Creating Account
        await User.create({
            name,
            username,
            classy,
            division,
            rollNo,
            password,
        });

        return res.status(200).json({
            message: "New User Registration Successful",
        });
    } catch (error) {
        next(error);
    }
}

// *--------------------------
// Faculty Registration Logic
// *--------------------------

const facultyRegister = async (req, res) => {
    try {
        const { name, username, email, phone, subject, password } = req.body;
        const userExist = await Faculty.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Creating Account
        const userCreated = await Faculty.create({
            name,
            username,
            email,
            phone,
            subject,
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
// Faculty Login Logic
// *--------------------------

const facultyLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists
        const userExist = await Faculty.findOne({ username });
        if (!userExist) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Validate password
        const user = await userExist.comparePassword(password);
        if (user) {
            // Generate token
            const token = await userExist.generateToken();

            // Set the cookie with token, secure, httpOnly, and expiration options
            // res.cookie("authToken", token, {
            //     httpOnly: true,        // Accessible only by web server
            //     secure: process.env.NODE_ENV === "production",  // Cookie only sent over HTTPS in production
            //     maxAge: 60 * 60 * 1000, // Cookie expires in 1 hour
            //     sameSite: "strict"      // Protect against CSRF
            // });

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


// *--------------------------
// User Login Logic
// *--------------------------

const userLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists
        const userExist = await User.findOne({ username });
        if (!userExist) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Validate password
        const user = await userExist.comparePassword(password);
        if (user) {
            // Generate token
            const token = await userExist.generateToken();

            // Set the cookie with token, secure, httpOnly, and expiration options
            // res.cookie("authToken", token, {
            //     httpOnly: true,        // Accessible only by web server
            //     secure: process.env.NODE_ENV === "production",  // Cookie only sent over HTTPS in production
            //     maxAge: 60 * 60 * 1000, // Cookie expires in 1 hour
            //     sameSite: "strict"      // Protect against CSRF
            // });

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



const getCurrentUser = async (req, res) => {
    try {
        const token = req.cookies.authToken; // Retrieve token from cookies

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { userID, role } = decoded;

        if (!role || (role !== "faculty" && role !== "student" && role !== "developer")) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        // Find the user based on role
        let model;

        if (role === "student") {
            model = User; // Use User model for regular users
        } else if (role === "faculty") {
            model = Faculty; // Use Faculty model for admins or high-authority users
        } else if (role === "developer") {
            model = Developer; // Use Faculty model for admins or high-authority users
        } else {
            return res.status(401).json({ error: "Authentication token not found" });
        }

        const userData = await model
            .findById({ _id: userID })
            .select("-password");

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with user data (excluding sensitive fields)
        res.status(200).json({
            userData,
        });

    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ------------------
// Update User
//-------------------

const updateUser = async (req, res, next) => {
    const { userId } = req.params;
    const { name, username, classy, division, rollNo, password } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "User ID is required" })
        }

        // passeword exceptional
        if (!name || !username || !classy || !division || !rollNo) {
            return res.status(400).json({ message: "Please enter all fields" });
        }
        const updateData = {};
        if (name) updateData.name = name;
        if (username) updateData.username = username;
        if (classy) updateData.classy = classy;
        if (division) updateData.division = division;
        if (rollNo) updateData.rollNo = rollNo;
        // If the password is provided, hash it before updating
        if (password) {
            const saltRound = await bcrypt.genSalt(10);
            const hash_password = await bcrypt.hash(password, saltRound);
            updateData.password = hash_password;
        }
        const updatedUser = await User.findByIdAndUpdate({ _id: userId }, updateData, { new: true }).exec();
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({ message: "User updated successfully" })


    } catch (error) {
        next(error)
    }


}


module.exports = { home, userRegister, userLogin, facultyRegister, facultyLogin, getCurrentUser,updateUser };
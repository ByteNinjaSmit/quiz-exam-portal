const jwt = require("jsonwebtoken");
const User = require("../database/models/user-model");
const Faculty = require("../database/models/faculty-model"); // Assuming Faculty model exists

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Token not provided" });
  }

  const jwtToken = token.replace("Bearer", "").trim();

  try {
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const { username, role } = isVerified; // Assuming `role` is part of token payload

    let userData;

    // Search based on role
    if (role === "faculty") {
      userData = await Faculty.findOne({ username }).select({ password: 0 });
    } else {
      userData = await User.findOne({ username }).select({ password: 0 });
    }

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = userData;
    req.token = token;
    req.userID = userData._id;

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized. Invalid Token." });
  }
};

module.exports = authMiddleware;

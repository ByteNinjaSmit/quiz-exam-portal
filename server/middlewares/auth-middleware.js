const jwt = require("jsonwebtoken");
const User = require("../database/models/user-model");
const Faculty = require("../database/models/faculty-model"); // Assuming Faculty model exists
const Developer = require("../database/models/developer-model");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  if(token){
    console.log("Token Recived: ",token);

  }
  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Token not provided" });
  }

  const jwtToken = token.replace("Bearer", "").trim();

  try {
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const { userID, role } = isVerified; // Assuming `role` is part of token payload


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

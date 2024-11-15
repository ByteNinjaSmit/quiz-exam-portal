const jwt = require('jsonwebtoken');
const Developer = require("../database/models/developer-model");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. Token not provided" });
    }
    const jwtToken = token.replace("Bearer", "").trim();

    try {
      const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
      const { username, role } = isVerified; // Assuming `role` is part of token payload

      let userData;

      // Searching Based on Role
      if(role==='developer'){
        userData = await Faculty.findOne({ username }).select({ password: 0 });
      }
      if (!userData) {
        return res.status(404).json({ message: "Developer not found" });
      }
    

      req.user = userData;
      req.token = token;
      req.userID = userData._id;
      next();
    } catch (error) {
      console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized. Invalid Token." });
    }

  } catch (error) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

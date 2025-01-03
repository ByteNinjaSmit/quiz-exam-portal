const jwt = require('jsonwebtoken');
const Developer = require("../database/models/developer-model");

const devMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. Token not provided" });
    }
    const jwtToken = token.replace("Bearer", "").trim();

    try {
      const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
      const { userID,username, role } = isVerified; // Assuming `role` is part of token payload

      let userData;

      // Searching Based on Role
      if(role==='developer'){
        userData = await Developer.findOne({ _id:userID , username:username }).select({ password: 0 });
      }
      if (!userData) {
        return res.status(404).json({ message: "Developer not found" });
      }

      if(!userData.isDeveloper){
        return res.status(401).json({ message: "Unauthorized. Developer not found" });
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

module.exports  =devMiddleware;
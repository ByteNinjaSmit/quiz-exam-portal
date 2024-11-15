const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const developerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type:String,
        required:true,
    },
    password: {
        type: String,
        required: true,
    },
});


// secure the password
developerSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password")) {
        console.log("Password is not modified");
        return next(); // Added return here
    }

    try {
        const saltRound = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(user.password, saltRound);
        user.password = hash_password;
    } catch (error) {
        console.log(error);
    }
});

// Compare bcrypt password
developerSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// JSON WEB TOKEN
developerSchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
            {
                userID: this._id.toString(),
                username: this.username,
                rollNo: this.rollNo,
                role:"developer",
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1d",
            }
        );
    } catch (error) {
        console.error(error);
    }
};

//  Exporting Model
const Developer = new mongoose.model("Developers", developerSchema);
module.exports = Developer;
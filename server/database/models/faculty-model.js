const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const facultySchema = new mongoose.Schema({
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
        required: true,
    },
    phone:{
        type:String,
        required:true,
    },
    isTeacher:{
        type:Boolean,
        default:false,
    },
    isHod:{
        type:Boolean,
        default:false,
    },
    subject:{
        type:String,
    },
    isTnp:{
        type:Boolean,
        default:false,
    },
    password: {
        type: String,
        required: true,
    },
});

// secure the password
facultySchema.pre("save", async function (next) {
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
facultySchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// JSON WEB TOKEN
facultySchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
            {
                userID: this._id.toString(),
                username: this.username,
                email: this.email,
                phone: this.phone,
                name: this.name,
                role:"faculty",
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
const Faculty = new mongoose.model("Faculties", facultySchema);
module.exports = Faculty;
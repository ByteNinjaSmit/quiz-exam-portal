const mongoose = require('mongoose');

const cheatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    },
    isWarning:{
        type:Boolean,
        default:false
    },
    isCheat:{
        type:Boolean,
        default:false,
    },
    paperKey: {
        type: String,
        required: true, // Make the paperKey mandatory
    },
}, { timestamps: true }
);

const Cheat = mongoose.model(`Cheat`,cheatSchema);
module.exports = Cheat;
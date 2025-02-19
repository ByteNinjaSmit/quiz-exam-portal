const mongoose = require('mongoose');

const contestCheatSchema = new mongoose.Schema({
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
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodeContest',
        required: true, // Make the paperKey mandatory
    },
}, { timestamps: true }
);

const ContestCheat = mongoose.model(`ContestCheat`,contestCheatSchema);
module.exports = ContestCheat;
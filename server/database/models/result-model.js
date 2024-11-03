const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    points: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true,
    },

    paperKey: {
        type: String,
        required: true, // Make the paperKey mandatory
    },
}, { timestamps: true }
);

const Result = mongoose.model(`Result`,resultSchema);
module.exports = Result;
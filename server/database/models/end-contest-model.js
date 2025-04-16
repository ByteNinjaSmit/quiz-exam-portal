const mongoose = require('mongoose');

const endContestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodeContest',
        required: true, // Make the paperKey mandatory
    },
}, { timestamps: true }
);

const EndContest = mongoose.model('EndContest', endContestSchema);
module.exports = EndContest;
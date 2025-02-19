const mongoose = require('mongoose');

const codeContestSubmissionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodeContest',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    output:{
        type:String,
        required:true,
    },
    accuracy: {
        type: Number,
        required: true,
    },
    avgRuntime: {
        type: Number,
        required: true,
    },
    testCasesPassed: {
        type: Number,
        required: true,
    },
    isSuccessfullyRun:{
        type:Boolean,
        required:true,
    },
    score:{
        type:Number,
        required:true,
    }
},
    {
        timestamps: true
    }
);

const CodeContestSubmission = mongoose.model('CodeContestSubmission',codeContestSubmissionSchema);
module.exports = CodeContestSubmission;

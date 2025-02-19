const mongoose = require('mongoose');

const codeSubmissionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodeProblem',
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
    }
},
    {
        timestamps: true
    }
);

const CodeSubmission = mongoose.model('CodeSubmission',codeSubmissionSchema);
module.exports = CodeSubmission;

const express = require("express");
const router = express.Router();
const { startExamQue } = require('../controllers/exam-controller');
const authMiddleware = require("../middlewares/auth-middleware");

const injectIoMiddleware = (io) => (req, res) => startExamQue(req, res, io);

module.exports = (io) => {
    router.post('/start-exam',authMiddleware, injectIoMiddleware(io));
    return router;
};
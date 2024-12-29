// server.js
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./database/db');
const { Server } = require('socket.io');
const http = require("http");
const cookieParser = require("cookie-parser");
const path = require('path');

// Importing Router
const authRoute = require("./router/auth-router");
const questionRoute = require('./router/question-router');
const examRoute = require('./router/exam-router');
const devloperRoute = require('./router/developer-router');
const codeRoute = require("./router/code-router");
// Importing Middlewares
const errorMiddleware = require("./middlewares/error-middleware");

// Imprting Workers
const { initWorker } = require('./workers/job-worker');
const { codeQueue } = require('./queue'); // Import the code queue
const logger = require('./utils/logger'); // Import the logger



// Importing Controller To Broadcasr
const {
    loadQuestionPaper,
    checkAndStartExam,
    handleSocketConnection
} = require('./controllers/exam-controller');


// Server
const app = express();
const server = http.createServer(app);
app.use(cookieParser());
// CORS Policy
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_SERVER,
        methods: ["GET", "POST", "DELETE", "PATCH", "HEAD", "PUT"],
        credentials: true,
    },
});
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CORS_SERVER, credentials: true }));
app.use(express.json());

// Error Catch
app.use(errorMiddleware);
// Defining Routes & API
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Make UploadFolder Static
// Serve static files from the uploads folder
app.use('/database/uploads', express.static(path.join(__dirname, '/database/uploads')));


app.use("/api/auth", authRoute);
app.use("/api/question",questionRoute(io));
app.use("/api/exam",examRoute);
app.use("/api/dev",devloperRoute);
app.use("/api/code",codeRoute);


// Broadcasting Question Paper
// Pass the io instance and controller functions to handleSocketConnection
handleSocketConnection(io, loadQuestionPaper, checkAndStartExam);



// For Handeling Code Queue

const Concurrency = process.env.CONCURRENCY;    // for handeling process at a time
console.log(Concurrency);

connectToDatabase()
    .then(() => {
        console.log("Connected to MongoDB successfully");
        server.listen(PORT, () => {
            initWorker(Concurrency);
            console.log(`Server running on port ${PORT}`);
            logger.info('Server running on port 5000');
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });




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
const helmet = require("helmet");
// Rate Limitter 
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");

// Importing Router
const authRoute = require("./router/auth-router");
const questionRoute = require('./router/question-router');
const examRoute = require('./router/exam-router');
const devloperRoute = require('./router/developer-router');
const codeRoute = require("./router/code-router");
const facRoute = require("./router/faculty-router");
const userRoute = require("./router/user-router");
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
const logController = require('./controllers/log-controller');


// Server
const app = express();
const server = http.createServer(app);
app.use(helmet());

const redisClient = new Redis(process.env.REDIS_URL);


app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:4173',
    'https://localhost:4173',
    'http://localhost:5173',
    'http://147.93.106.184:4173',
    'https://147.93.106.184:4173',
    'https://147.93.106.184:80',
    'http://147.93.106.184:80',
    'http://devquizapp.tech',
    'https://devquizapp.tech',
    'http://www.devquizapp.tech',
    'https://www.devquizapp.tech',
];

// CORS Policy
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "DELETE", "PATCH", "HEAD", "PUT"],
        credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    allowEIO3: true, // backward compatibility
});
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Error Catch
app.use(errorMiddleware);
// Defining Routes & API
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});


// DDos Protection 

//DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 100,
    duration: 60,
});

app.use((req, res, next) => {
    rateLimiter
        .consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({ success: false, message: "Too many requests" });
        });
});



//Ip based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests" });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        skipFailedRequests: true,
    }),
});

//apply this sensitiveEndpointsLimiter to our routes
app.use("/api/auth/login", sensitiveEndpointsLimiter);
app.use("/api/auth/login/faculty", sensitiveEndpointsLimiter);
app.use("/api/auth/register", sensitiveEndpointsLimiter);
app.use("/api/auth/register/faculty", sensitiveEndpointsLimiter);


// Make UploadFolder Static
// Serve static files from the uploads folder
app.use('/database/uploads', express.static(path.join(__dirname, '/database/uploads')));


app.use("/api/auth", authRoute);
app.use("/api/question",questionRoute(io));
app.use("/api/exam",examRoute);
app.use("/api/dev",devloperRoute);
app.use("/api/code",codeRoute);
app.use("/api/faculty",facRoute);
app.use("/api/user",userRoute);



// Broadcasting Question Paper
// Pass the io instance and controller functions to handleSocketConnection
handleSocketConnection(io, loadQuestionPaper, checkAndStartExam);

// Log Broadcasting
// logController(io);


// For Handeling Code Queue

const Concurrency = process.env.CONCURRENCY;    // for handeling process at a time

connectToDatabase()
    .then(() => {
        console.log("Connected to MongoDB successfully");
        server.listen(PORT, () => {
            initWorker(Concurrency);
            console.log(`Server running on port ${PORT}`);
            logger.info('Server running on port 5000');
            logController(io);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });




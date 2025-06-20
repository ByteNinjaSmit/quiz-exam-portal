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
const codeProblemRoute = require('./router/code-problem-router')

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
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.set('trust proxy', 1); // Trust first proxy (e.g., Nginx, Cloudflare)


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
    'http://bytequiz.tech',
    'https://bytequiz.tech',
    'http://www.bytequiz.tech',
    'https://www.bytequiz.tech',
    'https://bytequiz-gamma.vercel.app/',
    'https://bytequiz-no4g.onrender.com',
];

// CORS Policy
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "DELETE", "PATCH", "HEAD", "PUT"],
        credentials: true,
    },
    pingInterval: 5000,
    pingTimeout: 20000,
    allowEIO3: true, // backward compatibility
});
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin); // ✅ Allow only one
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.options('*', cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

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
    points: 30000,
    duration: 5,
    blockDuration: 5,
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
    windowMs: 10 * 1000,
    max: 30000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip, // ✅ Use IP directly
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

app.use('/database/uploads', express.static(path.join(__dirname, '/database/uploads'), {
    setHeaders: (res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
}));

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    logger.info(`Request IP, ${req.ip}`);
    // console.log(`Incoming request: ${req.method} ${req.url} from ${req.ip}`);

    next();
});

app.use('/database/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'image/jpeg');
    next();
}, express.static(path.join(__dirname, '/database/uploads')));



app.use("/api/auth", authRoute);
app.use("/api/question", questionRoute(io));
app.use("/api/exam", examRoute);
app.use("/api/dev", devloperRoute);
app.use("/api/code", codeRoute);
app.use("/api/problem", codeProblemRoute);
app.use("/api/faculty", facRoute);
app.use("/api/user", userRoute);



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




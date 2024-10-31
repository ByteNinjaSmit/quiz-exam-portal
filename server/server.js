// server.js
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./database/db');
const { Server } = require('socket.io');
const http = require("http");
const cookieParser = require("cookie-parser");

// Importing Router
const authRoute = require("./router/auth-router");


// Importing Middlewares
const errorMiddleware = require("./middlewares/error-middleware");




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
app.use("/api/auth", authRoute);



connectToDatabase()
    .then(() => {
        console.log("Connected to MongoDB successfully");
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });




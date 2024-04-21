import express from 'express';
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import "dotenv/config";
import UserRoutes from "./Users/routes.js";
import ReviewRoutes from './Reviews/routes.js';

// Initialize database connection
const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

const app = express();


// Configure CORS first
app.use(cors({
    origin: ['https://main--bookazon.netlify.app', 'http://localhost:3000'],
    credentials: true
}));

// Enable JSON body parsing for incoming requests
app.use(express.json());

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true
};
if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
        sameSite: "none",
        secure: true,
        domain: "bookazon-node-server.onrender.com"
    };
}
app.use(session(sessionOptions));


// Setup session management
// app.use(session({
//     secret: 'secret',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: 'auto' }
// }));


mongoose.connect(CONNECTION_STRING, {dbName: "bookazon"}).then(() => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
}).catch(error => {
    console.log('Error connecting to MongoDB:', error.message);
});

// Setup routes
app.get('/', (req, res) => {
    res.send('Welcome to Full Stack Development!')
});

UserRoutes(app);
ReviewRoutes(app);

// Start listening on a specific port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

import express from 'express';
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import "dotenv/config";

import userRoutes from "./Users/userRoutes";



const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
mongoose.connect(CONNECTION_STRING, {dbName: "bookazon"});

const app = express();
app.get('/', (req, res) => {res.send('Welcome to Full Stack Development!')})
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

userRoutes(app);

app.listen(4000);

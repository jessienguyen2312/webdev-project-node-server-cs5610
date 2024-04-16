import express from 'express';
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";

const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
mongoose.connect(CONNECTION_STRING, {dbName: "bookazon"});

const app = express();
app.listen(4000);

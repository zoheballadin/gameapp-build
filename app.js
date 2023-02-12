import express from "express";
import userRoutes from "./controllers/user/user.js"
import gameRoutes from "./controllers/game/game.js"
import connectDB from "./connectDB.js";
import mongoose from "mongoose";

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 5001;

await connectDB(process.env.MONGO_STRING).catch(err => console.log(err))

app.use(express.json())
app.use("/api/user", userRoutes)
app.use("/api/games", gameRoutes)
app.use(express.static(path.join(__dirname, 'build')));

app.use("/api/images", express.static("assets"))

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });



app.use("/api/images", express.static("assets"))

app.listen(port, ()=>{
    console.log("Listening on port ",port)
})
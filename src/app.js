import express from "express";
const app = express();
import cors from "cors";
import { connectDB } from "./config/db.js";

app.use(express.json());
app.use(cors());
connectDB()


export default app;

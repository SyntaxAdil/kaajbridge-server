import express from "express";
const app = express();
import cors from "cors";
import { connectDB } from "./config/db.js";
import jobRoutes from "./routes/jobs.routes.js";
app.use(express.json());
app.use(cors());
connectDB();

app.use("/api/jobs", jobRoutes);

export default app;

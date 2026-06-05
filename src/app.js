import express from "express";
const app = express();
import cors from "cors";
import { connectDB } from "./config/db.js";
import jobRoutes from "./routes/jobs.routes.js";
import companyRoutes from "./routes/company.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import favoritesRoutes from "./routes/favjobs.routes.js";
app.use(express.json());
app.use(cors());
connectDB();

app.use("/api/jobs", jobRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/favorites", favoritesRoutes);

export default app;

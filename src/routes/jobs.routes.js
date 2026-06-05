import jobsController from "../controllers/jobs.controller.js";
import express from "express";

const router = express.Router();

router.post("/new", jobsController.newJobController);
router.get("/", jobsController.getJobsController);

export default router;

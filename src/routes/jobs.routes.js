import jobsController from "../controllers/jobs.controller.js";
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRoleMiddleware from "../middleware/role.middleware.js";


const router = express.Router();

// public routes
router.get("/", jobsController.getJobsController);
router.get("/latest-jobs", jobsController.latestJobsController);


// protected routes for recruiter
router.post("/new", authMiddleware,checkRoleMiddleware("recruiter"), jobsController.newJobController);
router.get("/my-jobs", authMiddleware,checkRoleMiddleware("recruiter"), jobsController.myJobsController);



// protected for seeker
router.get("/:id", authMiddleware,checkRoleMiddleware("seeker"), jobsController.getJobByIdController);


export default router;

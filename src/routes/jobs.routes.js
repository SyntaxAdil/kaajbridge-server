import jobsController from "../controllers/jobs.controller.js";
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRoleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", jobsController.getJobsController);
router.get("/latest-jobs", jobsController.latestJobsController);

router.get(
  "/admin/all",
  authMiddleware,
  checkRoleMiddleware("admin"),
  jobsController.adminGetAllJobsController,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  checkRoleMiddleware("admin"),
  jobsController.adminDeleteJobController,
);

router.post(
  "/",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  jobsController.newJobController,
);
router.get(
  "/my-jobs",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  jobsController.myJobsController,
);
router.patch(
  "/my-jobs/:id",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  jobsController.updateJobController,
);
router.delete(
  "/my-jobs/:id",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  jobsController.deleteJobController,
);

router.get(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(["seeker", "recruiter", "admin"]),
  jobsController.getJobByIdController,
);

export default router;
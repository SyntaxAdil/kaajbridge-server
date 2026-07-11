import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRoleMiddleware from "../middleware/role.middleware.js";
import favjobsController from "../controllers/favjobs.controller.js";

const router = express.Router();

// view fav jobs
router.get(
  "/",
  authMiddleware,
  checkRoleMiddleware("seeker"),
  favjobsController.getFavJobsController
);

// save fav jobs
router.post(
  "/:jobId", 
  authMiddleware,
  checkRoleMiddleware("seeker"),
  favjobsController.addToFavJobsController
);

// delete fav jobs
router.delete(
  "/:jobId", 
  authMiddleware,
  checkRoleMiddleware("seeker"),
  favjobsController.deleteFavJobsController
);

export default router;
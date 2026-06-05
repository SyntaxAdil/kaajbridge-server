import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRoleMiddleware from "../middleware/role.middleware.js";
import favjobsController from "../controllers/favjobs.controller.js";

const router = express.Router();

// save fav jobs
router.post(
  "/",
  authMiddleware,
  checkRoleMiddleware("seeker"),
  favjobsController.addToFavJobsController,
);

// view fav jobs
router.get(
  "/",
  authMiddleware,
  checkRoleMiddleware("seeker"),
  favjobsController.getFavJobsController,
);

// delete fav jobs
router.patch(
  "/:id",
  authMiddleware,
  checkRoleMiddleware("seeker"),
  favjobsController.deleteFavJobsController,
);

export default router;

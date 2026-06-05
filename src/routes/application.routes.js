import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRoleMiddleware from "../middleware/role.middleware.js";
import applicationController from "../controllers/application.controller.js";

const router = express.Router();

// seeker can apply for job
router.post(
  "/",
  authMiddleware,
  checkRoleMiddleware("seeker"),
  applicationController.postApplicationController,
);

//   recruiter  can saw all the application from every user/seeker
router.get(
  "/",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  applicationController.getAllApplicationController,
);
// recruiter can change the application status
router.patch(
  "/",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  applicationController.updateApplicationController,
);
// recruiter can delete the application
router.delete(
  "/",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  applicationController.deleteApplicationController,
);

//  Seeker  can view particular their application
router.get(
  "/my-applications",
  authMiddleware,
  checkRoleMiddleware("seeker"),
  applicationController.myApplicationController,
);
// Particular application info by its id
router.get(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(["seeker","recruiter"]),
  applicationController.viewApplicationController,
);

export default router;

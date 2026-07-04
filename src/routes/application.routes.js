import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRoleMiddleware from "../middleware/role.middleware.js";
import applicationController from "../controllers/application.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  checkRoleMiddleware("seeker"),
  applicationController.postApplicationController
);

router.get(
  "/admin/all",
  authMiddleware,
  checkRoleMiddleware("admin"),
  applicationController.adminGetAllApplicationsController
);

router.get(
  "/my-applications",
  authMiddleware,
  checkRoleMiddleware("seeker"),
  applicationController.myApplicationController
);

router.get(
  "/all-job-applications",
  authMiddleware,
  checkRoleMiddleware(["recruiter", "admin"]),
  applicationController.getAllApplicationController
);

router.patch(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(["recruiter", "admin"]),
  applicationController.updateApplicationController
);

router.delete(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(["seeker", "recruiter", "admin"]),
  applicationController.deleteApplicationController
);

router.get(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(["seeker", "recruiter", "admin"]),
  applicationController.viewApplicationController
);

export default router;
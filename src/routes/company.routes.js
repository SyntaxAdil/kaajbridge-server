import express from "express";
import companyController from "../controllers/company.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRoleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

// Public Routes
router.get("/", companyController.getCompanyController);
router.get("/top-companies", companyController.topCompaniesController);

//  Protected Routes for Recruiter
router.post(
  "/",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  companyController.newCompanyController,
);

router.get(
  "/my-company",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  companyController.myCompanyController,
);

router.patch(
  "/my-company/:id",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  companyController.updateCompanyController,
);

router.delete(
  "/my-company/:id",
  authMiddleware,
  checkRoleMiddleware("recruiter"),
  companyController.deleteCompanyController,
);

// protected route for seeker
router.get(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(["seeker", "recruiter"]),

  companyController.getCompanyByIdController,
);

export default router;

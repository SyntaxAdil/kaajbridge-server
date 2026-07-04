import express from "express";
import companyController from "../controllers/company.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRoleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", companyController.getCompanyController);
router.get("/top-companies", companyController.topCompaniesController);

router.get(
  "/admin/all",
  authMiddleware,
  checkRoleMiddleware("admin"),
  companyController.adminGetAllCompaniesController,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  checkRoleMiddleware("admin"),
  companyController.adminDeleteCompanyController,
);

router.patch(
  "/:id/status",
  authMiddleware,
  checkRoleMiddleware("admin"),
  companyController.updateCompanyValidationStatusController,
);

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

router.get(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(["seeker", "recruiter","admin"]),
  companyController.getCompanyByIdController,
);

export default router;
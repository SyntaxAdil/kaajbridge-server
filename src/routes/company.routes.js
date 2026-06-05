
import express from "express";
import companyController from "../controllers/company.controller.js";

const router = express.Router();

router.post("/new", companyController.newCompanyController);
router.get("/", companyController.getCompanyController);
// router.get("/:id", companyController.getJobByIdController);

export default router;

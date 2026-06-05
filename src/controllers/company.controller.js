import companyModel from "../models/company.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// post new company
const newCompanyController = asyncHandler(async (req, res) => {
  const company = await companyModel.create(req.body);

  res.status(201).json({
    success: true,
    message: "Company created successfully",
    data: company,
  });
});

// get compines data with filters and all
const getCompanyController = asyncHandler(async (req, res) => {
  const {
    search,
    industry,
    location,
    sort = "newest",
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Search
  if (search) {
    query.name = {
      $regex: search,
      $options: "i",
    };
  }

  // Filters
  if (industry) {
    query.industry = industry;
  }

  if (location) {
    query["address.country"] = {
      $regex: location,
      $options: "i",
    };
  }

  const pageNumber = Number(page);
  const pageSize = Number(limit);
  const skip = (pageNumber - 1) * pageSize;

  const totalCompany = await companyModel.countDocuments(query);

  let companyQuery = companyModel.find(query);

  if (sort === "newest") {
    companyQuery = companyQuery.sort({ createdAt: -1 });
  }

  if (sort === "oldest") {
    companyQuery = companyQuery.sort({ createdAt: 1 });
  }

  companyQuery = companyQuery.skip(skip).limit(pageSize);

  const companies = await companyQuery;

  res.status(200).json({
    success: true,
    totalCompany,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalCompany / pageSize),
    count: companies.length,
    data: companies,
  });
});
export default { newCompanyController, getCompanyController };

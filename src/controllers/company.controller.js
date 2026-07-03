import mongoose from "mongoose";
import companyModel from "../models/company.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// post new company
const newCompanyController = asyncHandler(async (req, res) => {
  const company = await companyModel.create({
    ...req.body,
    ownedBy: req.user.sub,
  });

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

  const totalCompany = await companyModel.countDocuments({...query, isVerified: true});

  let companyQuery = companyModel.find({ ...query, isVerified: true });

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

// get one companty data

const getCompanyByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Company Id",
    });
  }
  const companyData = await companyModel.findById(id);
  if (!companyData) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Company fetched successfully",
    data: companyData,
  });
});

// update company
const updateCompanyController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;
  const companyId = req.params.id;
  const body = req.body;

  const findCompany = await companyModel.findById(companyId);

  if (!findCompany) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  }
  if (findCompany.ownedBy.toString() !== recruiterId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const updatedCompany = await companyModel.findByIdAndUpdate(
    companyId,
    {
      $set: body,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Company updated successfully",
    data: updatedCompany,
  });
});

// update company validation status

const updateCompanyValidationStatusController = asyncHandler(
  async (req, res) => {
    {
      const companyId = req.params.id;
      const status = req.body.status;
      const company = await companyModel.findById(companyId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found"
        })
      }
      const updatedCompany = await companyModel.findByIdAndUpdate(companyId, {
        $set: {
          isVerified: status
        }
      }, {
        new: true,
        runValidators: true
      })
      res.status(200).json({
        success: true,
        message: "Company updated successfully",
        data: updatedCompany
      })
    }
  })

// delete company
const deleteCompanyController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;
  const companyId = req.params.id;

  const findCompany = await companyModel.findById(companyId);

  if (!findCompany) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  }

  if (findCompany.ownedBy.toString() !== recruiterId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const deletedCompany = await companyModel.findByIdAndDelete(companyId);

  res.status(200).json({
    success: true,
    message: "Company deleted successfully",
    data: deletedCompany,
  });
});

// top companies

const topCompaniesController = asyncHandler(async (req, res) => {
  const company = await companyModel
    .find({
      isVerified: true,
    })
    .limit(8);

  const companyData = company.map((c) => {
    return {
      name: c.name,
      companyLogo: c.companyLogo,
      location: c.address.country,
    };
  });

  res.status(200).json({
    success: true,
    message: "Top Company fetched successfully",
    data: companyData,
  });
});

// my company
const myCompanyController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const totalCompanies = await companyModel.countDocuments({
    ownedBy: recruiterId,
  });

  const myCompany = await companyModel
    .find({
      ownedBy: recruiterId,
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCompanies / limit);

  res.status(200).json({
    success: true,
    message: "My Company fetched successfully",
    pagination: {
      total: totalCompanies,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data: myCompany,
  });
});
// exports
export default {
  newCompanyController,
  getCompanyController,
  getCompanyByIdController,
  topCompaniesController,
  myCompanyController,
  updateCompanyController,
  deleteCompanyController,
  updateCompanyValidationStatusController
};

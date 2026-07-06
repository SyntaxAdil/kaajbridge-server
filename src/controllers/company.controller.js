import mongoose from "mongoose";
import companyModel from "../models/company.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const allowedStatuses = ["pending", "verified", "rejected"];

const newCompanyController = asyncHandler(async (req, res) => {
  const alreadyExist = await companyModel.findOne({ name: req.body.name });

  if (alreadyExist) {
    return res.status(400).json({
      success: false,
      message: "Company already exists",
    });
  }

  const company = await companyModel.create({
    ...req.body,
    verificationStatus: "pending",
    ownedBy: [
      {
        id: req.user.sub || req.user.id || req.user._id,
        name: req.user.name,
        image: req.user.image || req.user.avatar || ""
      }
    ],
  });

  res.status(201).json({
    success: true,
    message: "Company created successfully",
    data: company,
  });
});

const getCompanyController = asyncHandler(async (req, res) => {
  const {
    search,
    industry,
    location,
    size,
    sort = "newest",
    page = 1,
    limit = 10,
  } = req.query;

  const query = { verificationStatus: "verified" };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (industry) {
    query.industry = industry;
  }

  if (location) {
    query["address.country"] = { $regex: location, $options: "i" };
  }

  if (size) {
    query.size = size;
  }

  const pageNumber = Number(page);
  const pageSize = Number(limit);
  const skip = (pageNumber - 1) * pageSize;

  const totalCompany = await companyModel.countDocuments(query);

  let companyQuery = companyModel.find(query);

  if (sort === "newest") {
    companyQuery = companyQuery.sort({ createdAt: -1 });
  } else if (sort === "oldest") {
    companyQuery = companyQuery.sort({ createdAt: 1 });
  } else if (sort === "name_asc") {
    companyQuery = companyQuery.sort({ name: 1 });
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

const adminGetAllCompaniesController = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    industry,
    sort = "newest",
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  if (status && allowedStatuses.includes(status)) {
    query.verificationStatus = status;
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (industry) {
    query.industry = industry;
  }

  const pageNumber = Number(page);
  const pageSize = Number(limit);
  const skip = (pageNumber - 1) * pageSize;

  const totalCompany = await companyModel.countDocuments(query);

  let companyQuery = companyModel.find(query);

  if (sort === "newest") {
    companyQuery = companyQuery.sort({ createdAt: -1 });
  } else if (sort === "oldest") {
    companyQuery = companyQuery.sort({ createdAt: 1 });
  } else if (sort === "name_asc") {
    companyQuery = companyQuery.sort({ name: 1 });
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

  const hasOwnership = findCompany.ownedBy && findCompany.ownedBy.some(owner => owner.id === recruiterId);

  if (!hasOwnership) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const allowedUpdates = {
    name: body.name,
    industry: body.industry,
    description: body.description,
    address: body.address ? {
      street: body.address.street,
      city: body.address.city,
      country: body.address.country
    } : undefined,
    size: body.size,
    website: body.website,
    companyLogo: body.companyLogo
  };

  Object.keys(allowedUpdates).forEach(
    (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );

  const updatedCompany = await companyModel.findByIdAndUpdate(
    companyId,
    {
      $set: allowedUpdates,
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

const updateCompanyValidationStatusController = asyncHandler(
  async (req, res) => {
    const companyId = req.params.id;
    const status = req.body.status;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const company = await companyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      })
    }
    const updatedCompany = await companyModel.findByIdAndUpdate(companyId, {
      $set: {
        verificationStatus: status
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
)

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

  const hasOwnership = findCompany.ownedBy && findCompany.ownedBy.some(owner => owner.id === recruiterId);

  if (!hasOwnership) {
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

const adminDeleteCompanyController = asyncHandler(async (req, res) => {
  const companyId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Company Id",
    });
  }

  const deletedCompany = await companyModel.findByIdAndDelete(companyId);

  if (!deletedCompany) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Company deleted successfully",
    data: deletedCompany,
  });
});

const topCompaniesController = asyncHandler(async (req, res) => {
  const company = await companyModel
    .find({
      verificationStatus: "verified",
    })
    .limit(8);

  const companyData = company.map((c) => {
    return {
      name: c.name,
      companyLogo: c.companyLogo,
      location: c.address?.country,
    };
  });

  res.status(200).json({
    success: true,
    message: "Top Company fetched successfully",
    data: companyData,
  });
});

const myCompanyController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status;

  const skip = (page - 1) * limit;

  const query = {
    "ownedBy.id": recruiterId,
  };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (status && allowedStatuses.includes(status)) {
    query.verificationStatus = status;
  }

  const totalCompanies = await companyModel.countDocuments(query);

  const myCompany = await companyModel
    .find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCompanies / limit);
  const allComapniesName = await companyModel.find({ "ownedBy.id": recruiterId }).select("name companyLogo");
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
    allCompanyName: allComapniesName
  });
});
const getCompanyAnalyticsController = asyncHandler(async (req, res) => {
  const userId = req.user.sub || req.user.id || req.user._id;
  const role = req.user.role;

  const statusPipeline = [];
  if (role !== "admin") {
    statusPipeline.push({ $match: { "ownedBy.id": userId } });
  }
  statusPipeline.push({
    $group: {
      _id: "$verificationStatus",
      count: { $sum: 1 },
    },
  });

  const industryPipeline = [];
  if (role !== "admin") {
    industryPipeline.push({ $match: { "ownedBy.id": userId } });
  }
  industryPipeline.push(
    {
      $group: {
        _id: "$industry",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 6 }
  );

  const [statusAnalytics, industryAnalytics] = await Promise.all([
    companyModel.aggregate(statusPipeline),
    companyModel.aggregate(industryPipeline),
  ]);

  const statusChartData = statusAnalytics.map((item) => ({
    name: item._id || "pending",
    value: item.count,
  }));

  const industryChartData = industryAnalytics.map((item) => ({
    name: item._id || "Other",
    value: item.count,
  }));

  res.status(200).json({
    success: true,
    message: "Company analytics metrics synchronized successfully",
    data: {
      statusChartData,
      industryChartData,
    },
  });
});
export default {
  newCompanyController,
  getCompanyController,
  adminGetAllCompaniesController,
  getCompanyByIdController,
  topCompaniesController,
  myCompanyController,
  updateCompanyController,
  deleteCompanyController,
  adminDeleteCompanyController,
  updateCompanyValidationStatusController,
  getCompanyAnalyticsController
};
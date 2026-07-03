import mongoose from "mongoose";
import jobsModel from "../models/jobs.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import companyModel from "../models/company.model.js";

// post new job
const newJobController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;
  const { company } = req.body;
  const findCompanyForTheRecrutier = await companyModel.findOne({
    name: company,
    ownedBy: recruiterId,
  });
  if (!findCompanyForTheRecrutier) {
    return res.status(404).json({
      success: false,
      message: "Unauthorized ! No company found",
    });
  }
  const job = await jobsModel.create({
    ...req.body,
    recruiterId: recruiterId,
  });

  res.status(201).json({
    success: true,
    message: "Job created successfully",
    data: job,
  });
});

// get jobs data with filters ,search and sort

const getJobsController = asyncHandler(async (req, res) => {
  const now = new Date();

  await jobsModel.updateMany(
    {
      applicationDeadline: { $lt: now },
      status: "open"
    }, {
    $set: { status: "closed" }
  }
  )
  await jobsModel.updateMany(
    {
      applicationDeadline: { $gt: now },
      status: "closed"
    }, {
    $set: { status: "open" }
  })
  const {
    search,
    type,
    experience,
    location,
    sort = "newest",
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { skills: { $regex: search, $options: "i" } },
    ];
  }

  // Filters
  if (type) {
    query.type = type;
  }

  if (experience) {
    query.experience = experience;
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  // Pagination
  const pageNumber = Number(page);
  const pageSize = Number(limit);
  const skip = (pageNumber - 1) * pageSize;

  // Total matching jobs
  const totalJobs = await jobsModel.countDocuments(query);


  // Query
  let jobsQuery = jobsModel.find(query);

  // Sorting
  if (sort === "newest") {
    jobsQuery = jobsQuery.sort({ createdAt: -1 });
  }

  if (sort === "oldest") {
    jobsQuery = jobsQuery.sort({ createdAt: 1 });
  }

  jobsQuery = jobsQuery.skip(skip).limit(pageSize);

  const jobs = await jobsQuery;

  res.status(200).json({
    success: true,
    totalJobs,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalJobs / pageSize),
    count: jobs.length,
    data: jobs,
  });
});

// get particular one job with jobId

const getJobByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Job Id",
    });
  }
  const jobData = await jobsModel.findById(id);
  if (!jobData) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Job fetched successfully",
    data: jobData,
  });
});

//update logic for jobs

const updateJobController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;
  const jobId = req.params.id;
  const body = req.body;

  const findJob = await jobsModel.findById(jobId);

  if (!findJob) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  if (findJob.recruiterId.toString() !== recruiterId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { company, companyLogo, ...allowedUpdates } = body;

  const updatedJob = await jobsModel.findByIdAndUpdate(
    jobId,
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
    message: "Job updated successfully",
    data: updatedJob,
  });
});

// delete logic for jobs
const deleteJobController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;
  const jobId = req.params.id;

  const findJob = await jobsModel.findById(jobId);

  if (!findJob) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  if (findJob.recruiterId !== recruiterId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const deleteJob = await jobsModel.findByIdAndDelete(jobId);

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
    data: deleteJob,
  });
});
// latest jobs

const latestJobsController = asyncHandler(async (req, res) => {
  const jobData = await jobsModel.find().sort({ createdAt: -1 }).limit(6);

  res.status(200).json({
    success: true,
    message: "Top Company fetched successfully",
    data: jobData,
  });
});

// my jobs route

const myJobsController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;
  const now = new Date()
  await jobsModel.updateMany(
    {
      applicationDeadline: { $lt: now },
      status: "open"
    }, {
    $set: { status: "closed" }
  })
  await jobsModel.updateMany(
    {
      applicationDeadline: { $gt: now },
      status: "closed"
    }, {
    $set: { status: "open" }
  })
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status;

  const skip = (page - 1) * limit;

  const query = {
    recruiterId: recruiterId,
  };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (status !== undefined && status !== "") {
    query.status = status;
  }

  const totalJobs = await jobsModel.countDocuments(query);

  const myJobs = await jobsModel
    .find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalJobs / limit);

  res.status(200).json({
    success: true,
    message: "My Jobs fetched successfully",
    pagination: {
      total: totalJobs,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data: myJobs,
  });
});

export default {
  newJobController,
  getJobsController,
  getJobByIdController,
  latestJobsController,
  myJobsController,
  updateJobController,
  deleteJobController,
};

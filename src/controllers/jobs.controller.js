import mongoose from "mongoose";
import jobsModel from "../models/jobs.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// post new job
const newJobController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;

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

  if (!recruiterId) {
    return res.status(400).json({
      success: false,
      message: "Invalid Recruiter Id",
    });
  }

  const myJobs = await jobsModel.find({
    recruiterId: recruiterId,
  });

  res.status(201).json({
    success: true,
    message: "My Jobs fetched successfully",
    data: myJobs,
  });
});

export default {
  newJobController,
  getJobsController,
  getJobByIdController,
  latestJobsController,
  myJobsController,
};

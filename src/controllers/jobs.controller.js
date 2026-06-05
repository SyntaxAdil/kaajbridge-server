import jobsModel from "../models/jobs.model.js";
import asyncHandler from "../utils/asyncHandler.js";


// post new job
const newJobController = asyncHandler(async (req, res) => {
  const job = await jobsModel.create(req.body);

  res.status(201).json({
    success: true,
    message: "Job created successfully",
    data: job,
  });
});

// get jobs data with filters ,search and sort

const getJobsController = asyncHandler(async (req, res) => {
  const { search, type, experience, location, sort } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { skills: { $regex: search, $options: "i" } },
    ];
  }
  if (type) {
    query.type = type;
  }
  if (experience) {
    query.experience = experience;
  }
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  let jobsQuery = jobsModel.find(query);

  if (sort === "newest") {
    jobsQuery = jobsQuery.sort({ createdAt: -1 });
  }

  const jobs = await jobsQuery;
  res.status(200).json({
    success: true,
    message: "Job fetched successfully",
    data: jobs,
  });
});


// get particular one job with jobId





export default { newJobController, getJobsController };

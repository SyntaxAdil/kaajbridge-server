import applicationModel from "../models/application.model.js";
import jobsModel from "../models/jobs.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDB } from "../config/db.js";

// post application by seeker
const postApplicationController = asyncHandler(async (req, res) => {
  const { job, resume, coverLetter, experience, expectedSalary } = req.body;

  const findJob = await jobsModel.findById(job);

  if (!findJob) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  const existing = await applicationModel.findOne({
    job,
    applicant: req.user.sub,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Already applied for this job",
    });
  }

  const application = await applicationModel.create({
    job,
    applicant: req.user.sub,
    recruiterId: findJob.recruiterId,
    resume,
    coverLetter,
    experience,
    expectedSalary,
  });

  res.status(201).json({
    success: true,
    data: application,
  });
});

const attachApplicantInfo = async (applications) => {
  const db = getDB();

  return Promise.all(
    applications.map(async (application) => {
      const user = await db.collection("user").findOne(
        { id: application.applicant },
        { projection: { name: 1, email: 1, image: 1 } }
      );

      return {
        ...application.toObject(),
        applicantInfo: user,
      };
    })
  );
};
// get all application by seeker
const getAllApplicationController = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status } = req.query;

  const job = await jobsModel.findById(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  if (job.recruiterId !== req.user.sub && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const allowedStatuses = ["pending", "reviewed", "shortlisted", "interviewing", "accepted", "rejected"];
  let filterQuery = { job: jobId };
  if (status && allowedStatuses.includes(status)) {
    filterQuery.status = status;
  }

  const totalApplications = await applicationModel.countDocuments(filterQuery);

  const applications = await applicationModel
    .find(filterQuery)
    .populate("job", "title company location")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const applicationsWithUser = await attachApplicantInfo(applications);

  res.status(200).json({
    success: true,
    count: applicationsWithUser.length,
    pagination: {
      total: totalApplications,
      page,
      limit,
      pages: Math.ceil(totalApplications / limit),
    },
    data: applicationsWithUser,
  });
});

// admin can view all the application
const adminGetAllApplicationsController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, jobId } = req.query;

  const allowedStatuses = ["pending", "reviewed", "shortlisted", "interviewing", "accepted", "rejected"];
  let filterQuery = {};

  if (status && allowedStatuses.includes(status)) {
    filterQuery.status = status;
  }

  if (jobId) {
    filterQuery.job = jobId;
  }

  const totalApplications = await applicationModel.countDocuments(filterQuery);

  const applications = await applicationModel
    .find(filterQuery)
    .populate("job", "title company location")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const applicationsWithUser = await attachApplicantInfo(applications);

  res.status(200).json({
    success: true,
    count: applicationsWithUser.length,
    pagination: {
      total: totalApplications,
      page,
      limit,
      pages: Math.ceil(totalApplications / limit),
    },
    data: applicationsWithUser,
  });
});

// update application by seeker

const updateApplicationController = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = ["pending", "reviewed", "shortlisted", "interviewing", "accepted", "rejected"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  const application = await applicationModel.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  if (application.recruiterId !== req.user.sub && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  application.status = status;
  await application.save();

  res.status(200).json({
    success: true,
    data: application,
  });
});

// delete application by seeker
const deleteApplicationController = asyncHandler(async (req, res) => {
  const isRecruiter = req.user.role === "recruiter";
  const isAdmin = req.user.role === "admin";

  let query = {};

  if (isAdmin) {
    query = { _id: req.params.id };
  } else if (isRecruiter) {
    query = {
      _id: req.params.id,
      recruiterId: req.user.sub,
    };
  } else {
    query = {
      _id: req.params.id,
      applicant: req.user.sub,
    };
  }

  const application = await applicationModel.findOneAndDelete(query);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Application deleted successfully",
  });
});

// my application by seeker
const myApplicationController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status } = req.query;

  const allowedStatuses = ["pending", "reviewed", "shortlisted", "interviewing", "accepted", "rejected"];
  let filterQuery = { applicant: req.user.sub };
  if (status && allowedStatuses.includes(status)) {
    filterQuery.status = status;
  }

  const totalApplications = await applicationModel.countDocuments(filterQuery);

  const applications = await applicationModel
    .find(filterQuery)
    .populate("job", "title company location type status")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    pagination: {
      total: totalApplications,
      page,
      limit,
      pages: Math.ceil(totalApplications / limit),
    },
    data: applications,
  });
});

// view application by id
const viewApplicationController = asyncHandler(async (req, res) => {
  const application = await applicationModel
    .findById(req.params.id)
    .populate("job", "title company location type experience salary");

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  const isRecruiter = req.user.role === "recruiter";
  const isAdmin = req.user.role === "admin";

  if (!isAdmin) {
    if (isRecruiter) {
      if (application.recruiterId !== req.user.sub) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    } else {
      if (application.applicant !== req.user.sub) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }
  }

  const db = getDB();

  const applicantInfo = await db.collection("user").findOne(
    { id: application.applicant },
    { projection: { password: 0 } }
  );

  res.status(200).json({
    success: true,
    data: {
      ...application.toObject(),
      applicantInfo,
    },
  });
});

export default {
  postApplicationController,
  getAllApplicationController,
  adminGetAllApplicationsController,
  updateApplicationController,
  deleteApplicationController,
  myApplicationController,
  viewApplicationController,
};
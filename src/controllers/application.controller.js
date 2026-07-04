import applicationModel from "../models/application.model.js";
import jobsModel from "../models/jobs.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDB } from "../config/db.js";
import mongoose from "mongoose";

const attachApplicantInfo = async (applications) => {
  const db = getDB();
  const applicantIds = applications.map((app) => {
    try {
      return new mongoose.Types.ObjectId(app.applicant);
    } catch {
      return app.applicant;
    }
  });

  const users = await db
    .collection("user")
    .find({ _id: { $in: applicantIds } })
    .toArray();

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return applications.map((application) => ({
    ...application.toObject(),
    applicantInfo: userMap.get(application.applicant?.toString()) || null,
  }));
};

const postApplicationController = asyncHandler(async (req, res) => {
  const { job, resume, coverLetter, experience, expectedSalary, termsAccepted } = req.body;
  const db = getDB();

  const findJob = await jobsModel.findById(job);

  if (!findJob) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  const existing = await applicationModel.findOne({
    job,
    "applicant.id": req.user.sub,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Already applied for this job",
    });
  }

  const finalRecruiterId = findJob.recruiterId || findJob.userId || findJob.createdBy;

  if (!finalRecruiterId) {
    return res.status(400).json({
      success: false,
      message: "Recruiter ID missing in job details",
    });
  }

  const application = await applicationModel.create({
    job,
    applicant:
    {
      id: req.user.sub,
      name: req.user.name,
      email: req.user.email,
      image: req.user.image || req.user.avatar || ""
    }
    ,
    recruiterId: finalRecruiterId,
    resume,
    coverLetter,
    experience,
    expectedSalary,
    termsAccepted,
  });

  await db.collection("user").updateOne(
    { _id: req.user.sub },
    { $push: { applications: application._id } }
  );

  res.status(201).json({
    success: true,
    data: application,
  });
});
const getAllApplicationController = asyncHandler(async (req, res) => {
  const recruiterId = req.user.sub;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, jobId } = req.query;

  const allowedStatuses = ["pending", "reviewed", "shortlisted", "interviewing", "accepted", "rejected"];
  let filterQuery = {};

  if (req.user.role !== "admin") {
    filterQuery.recruiterId = recruiterId;
  }

  if (jobId) {
    filterQuery.job = jobId;
  }

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

const updateApplicationController = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = ["pending", "reviewed", "shortlisted", "rejected", "hired", "interviewing"];
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

const deleteApplicationController = asyncHandler(async (req, res) => {
  const isRecruiter = req.user.role === "recruiter";
  const isAdmin = req.user.role === "admin";
  const db = getDB();

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

  try {
    await db.collection("user").updateOne(
      { _id:application.applicant.id },
      { $pull: { applications: application._id } }
    );
  } catch (err) {
    console.error(err);
  }

  res.status(200).json({
    success: true,
    message: "Application deleted successfully",
  });
});

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

  let userQuery = application.applicant;
  try {
    userQuery = new mongoose.Types.ObjectId(application.applicant);
  } catch { }

  const applicantInfo = await db.collection("user").findOne({ _id: userQuery });

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
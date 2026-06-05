import applicationModel from "../models/application.model.js";
import jobsModel from "../models/jobs.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDB } from "../config/db.js";

// apply by candidate
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

// all application — recruiter only
const getAllApplicationController = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await jobsModel.findById(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  if (job.recruiterId !== req.user.sub) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const applications = await applicationModel
    .find({ job: jobId })
    .populate("job", "title company location");

  const db = getDB();

  const applicationsWithUser = await Promise.all(
    applications.map(async (application) => {
      const user = await db.collection("user").findOne(
        {
          id: application.applicant,
        },
        {
          projection: {
            name: 1,
            email: 1,
            image: 1,
          },
        }
      );

      return {
        ...application.toObject(),
        applicantInfo: user,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: applicationsWithUser.length,
    data: applicationsWithUser,
  });
});

// recruiter application update
const updateApplicationController = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const application = await applicationModel.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  if (application.recruiterId !== req.user.sub) {
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

// delete application
const deleteApplicationController = asyncHandler(async (req, res) => {
  const isRecruiter = req.user.role === "recruiter";

  let query = {};

  if (isRecruiter) {
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

// my application route
const myApplicationController = asyncHandler(async (req, res) => {
  const applications = await applicationModel
    .find({ applicant: req.user.sub })
    .populate("job", "title company location type status");

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// view particular application
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
  const db = getDB();

  const applicantInfo = await db.collection("user").findOne(
    {
      _id: application.applicant,
    },
    {
      projection: {
        password: 0,
      },
    }
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
  updateApplicationController,
  deleteApplicationController,
  myApplicationController,
  viewApplicationController,
};
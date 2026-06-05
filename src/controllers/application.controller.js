import applicationModel from "../models/application.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// apply by candidate
const postApplicationController = asyncHandler(async (req, res) => {
  const { job, resume, coverLetter, experience, expectedSalary } = req.body;
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
    resume,
    coverLetter,
    experience,
    expectedSalary,
  });

  res.status(201).json({ success: true, data: application });
});

// all application — recruiter only
const getAllApplicationController = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const applications = await applicationModel
    .find({ job: jobId })
    .populate("job", "title company location");

  res.status(200).json({ success: true, data: applications });
});

// recruiter application update
const updateApplicationController = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const application = await applicationModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );

  if (!application) {
    return res
      .status(404)
      .json({ success: false, message: "Application not found" });
  }

  res.status(200).json({ success: true, data: application });
});

// delete application
const deleteApplicationController = asyncHandler(async (req, res) => {
  const isRecruiter = req.user.role === "recruiter";

  const query = isRecruiter
    ? { _id: req.params.id }
    : { _id: req.params.id, applicant: req.user.sub };

  const application = await applicationModel.findOneAndDelete(query);

  if (!application) {
    return res
      .status(404)
      .json({ success: false, message: "Application not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "Application deleted successfully" });
});

// my application route
const myApplicationController = asyncHandler(async (req, res) => {
  const applications = await applicationModel
    .find({ applicant: req.user.sub })
    .populate("job", "title company location type status");

  res.status(200).json({ success: true, data: applications });
});

// view particular application
const viewApplicationController = asyncHandler(async (req, res) => {
  const isRecruiter = req.user.role === "recruiter";

  const query = isRecruiter
    ? { _id: req.params.id }
    : { _id: req.params.id, applicant: req.user.sub };

  const application = await applicationModel
    .findOne(query)
    .populate("job", "title company location type experience salary");

  if (!application) {
    return res
      .status(404)
      .json({ success: false, message: "Application not found" });
  }

  res.status(200).json({ success: true, data: application });
});

export default {
  postApplicationController,
  getAllApplicationController,
  updateApplicationController,
  deleteApplicationController,
  myApplicationController,
  viewApplicationController,
};

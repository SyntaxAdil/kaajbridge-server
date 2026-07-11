import favjobsModel from "../models/favjobs.model.js";
import jobsModel from "../models/jobs.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// Add to favorites
const addToFavJobsController = asyncHandler(async (req, res) => {
  const seekerId = req.user.sub;
  const { jobId } = req.params;

  const findJob = await jobsModel.findById(jobId);
  if (!findJob) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  const existingFav = await favjobsModel.findOne({
    job: jobId,
    addedBy: seekerId,
  });

  if (existingFav) {
    return res.status(400).json({
      success: false,
      message: "Job already added to favorites",
    });
  }

  const favJob = await favjobsModel.create({
    job: jobId,
    addedBy: seekerId,
  });

  res.status(201).json({
    success: true,
    message: "Added to favorites successfully",
    data: favJob,
  });
});

// Get favorite jobs
const getFavJobsController = asyncHandler(async (req, res) => {
  const seekerId = req.user.sub;

  const favJobs = await favjobsModel
    .find({ addedBy: seekerId })
    .populate("job");

  res.status(200).json({
    success: true,
    count: favJobs.length,
    message: "Favorite jobs fetched successfully",
    data: favJobs,
  });
});

// Remove from favorites
const deleteFavJobsController = asyncHandler(async (req, res) => {
  const seekerId = req.user.sub;
  const { jobId } = req.params; // রাউটারের প্যারাম নামের সাথে মিলানো হয়েছে

  const deletedFavJob = await favjobsModel.findOneAndDelete({
    job: jobId,
    addedBy: seekerId,
  });

  if (!deletedFavJob) {
    return res.status(404).json({
      success: false,
      message: "Favorite job not found in your list",
    });
  }

  res.status(200).json({
    success: true,
    message: "Favorite job removed successfully",
    data: deletedFavJob,
  });
});

export default {
  addToFavJobsController,
  getFavJobsController,
  deleteFavJobsController,
};
import applicationModel from "../models/application.model";
import asyncHandler from "../utils/asyncHandler";

const postApplicationController = asyncHandler(async (req, res) => {});
const getAllApplicationController = asyncHandler(async (req, res) => {});
const updateApplicationController = asyncHandler(async (req, res) => {});
const deleteApplicationController = asyncHandler(async (req, res) => {});
const myApplicationController = asyncHandler(async (req, res) => {});
const viewApplicationController = asyncHandler(async (req, res) => {});

export default {
  postApplicationController,
  getAllApplicationController,
  updateApplicationController,
  deleteApplicationController,
  myApplicationController,
  viewApplicationController,
};

import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "remote", "contract", "internship"],
      default: "full-time",
    },
    experience: {
      type: String,
      enum: ["entry", "mid", "senior", "lead"],
      required: true,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "BDT" },
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: [String],
    skills: [String],
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },
    termsAccepted: {
      type: Boolean,
      validate: {
        validator: (value) => value === true,
        message: "Must agree to terms & conditions to proceed",
      },
    },
    recruiterId: {
      type: String,
    },
    companyLogo: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Job || mongoose.model("Job", jobSchema);

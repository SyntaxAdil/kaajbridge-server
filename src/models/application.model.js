import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
    },
    applicant: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      image: { type: String }
    },
    resume: {
      type: String,
      required: [true, "Resume is required"],
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "hired", "interviewing"],
      default: "pending",
    },
    experience: {
      type: String,
      enum: ["entry", "mid", "senior", "lead"],
      required: true,
    },
    expectedSalary: {
      amount: { type: Number },
      currency: { type: String, default: "BDT" },
    },
    appliedAt: {
      type: Date,
      default: Date.now,
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
      required: true,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

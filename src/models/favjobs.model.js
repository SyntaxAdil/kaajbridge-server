import mongoose from "mongoose";

const favJobsSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Must select a job"],
    },
    addedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
favJobsSchema.index(
  {
    job: 1,
    addedBy: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.models.FavJob ||
  mongoose.model("FavJob", favJobsSchema);

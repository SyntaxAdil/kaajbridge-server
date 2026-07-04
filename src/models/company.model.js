import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    companyLogo: {
      type: String,
      required: [true, "Company logo is required"],
    },
    industry: {
      type: String,
      required: true,
      enum: [
        "technology",
        "finance",
        "healthcare",
        "education",
        "ecommerce",
        "media",
        "manufacturing",
        "construction",
        "telecommunication",
        "power_energy",
        "automobile",
        "garments_textile",
        "agro_food",
        "other"
      ],
    },
    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    founded: {
      type: Number,
    },
    description: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      country: { type: String, default: "Bangladesh" },
    },
    socialLinks: {
      linkedin: String,
      facebook: String,
      twitter: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    ownedBy: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String }
      }
    ]
  },
  { timestamps: true },
);

export default mongoose.models.Company ||
  mongoose.model("Company", companySchema);

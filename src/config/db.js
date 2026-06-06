// dotenv
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
// raw mongodb for user and other external   collection
export const getDB = () => mongoose.connection.db;

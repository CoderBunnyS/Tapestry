import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDatabase(): Promise<boolean> {
  if (!config.mongoUri) {
    console.warn("MONGODB_URI is not set; API is running without persistence.");
    return false;
  }

  await mongoose.connect(config.mongoUri);
  return true;
}

import mongoose from 'mongoose'
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not configured");
}

try {
  await mongoose.connect(uri);
  console.log("MongoDB connected");
} catch (error) {
  console.error("MongoDB connection failed", error);
  process.exit(1);
}
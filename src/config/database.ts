import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("Connected to mongoDB");
  } catch (error) {
    console.log("MongoDB connection Error: ", error);
    process.exit(1);
  }
};

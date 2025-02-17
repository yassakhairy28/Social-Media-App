import mongoose from "mongoose";

const connectDB = async () => {
  try {
      await mongoose.connect(process.env.DB_URI, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Don't connect to database", error);
  }
};

export default connectDB;

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10, // Maximum connections in pool
      minPoolSize: 5,  // Minimum connections in pool
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("✅ Connected to MongoDB");

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
};
import mongoose from "mongoose";
import ShowroomTarget from "../models/ShowroomTarget.js";
import { initializeCredentials } from "../services/auth.service.js";

const isValidMongoUri = (uri) => typeof uri === 'string' && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));

const connectToMongo = async (mongoUri) => {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await mongoose.connect(mongoUri, {
        maxPoolSize: 50,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError;
};

const connectToMemoryMongo = async () => {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const memoryServer = await MongoMemoryServer.create();
  process._memoryServer = memoryServer;
  return connectToMongo(memoryServer.getUri());
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!isValidMongoUri(mongoUri)) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("MONGO_URI must be configured in production");
      }
      console.warn('MONGO_URI not provided or invalid — starting in-memory MongoDB for development.');
      const connection = await connectToMemoryMongo();
      await initializeCredentials();
      console.log(`MongoDB connected: ${connection.connection.host}`);
      return;
    }

    try {
      const connection = await connectToMongo(mongoUri);
      await migrateShowroomTargets();
      await initializeCredentials();
      console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const isLocalMongo = mongoUri.startsWith('mongodb://localhost') || mongoUri.startsWith('mongodb://127.0.0.1');

      if (!isDevelopment || !isLocalMongo) {
        throw error;
      }

      console.warn('Local MongoDB is unavailable — starting in-memory MongoDB for development.');
      const connection = await connectToMemoryMongo();
      await migrateShowroomTargets();
      await initializeCredentials();
      console.log(`MongoDB connected: ${connection.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

const migrateShowroomTargets = async () => {
  await ShowroomTarget.updateMany(
    { lastYearPercentage: { $exists: true }, lastYearAchievement: { $exists: false } },
    { $rename: { lastYearPercentage: "lastYearAchievement" } }
  );
  await ShowroomTarget.updateMany(
    { year: { $exists: false } },
    { $set: { year: 2026 } }
  );
  await ShowroomTarget.syncIndexes();
};

export default connectDB;

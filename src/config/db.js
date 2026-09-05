import mongoose from "mongoose";

const isValidMongoUri = (uri) => typeof uri === 'string' && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));

const connectToMongo = async (mongoUri) => mongoose.connect(mongoUri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

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
      console.warn('MONGO_URI not provided or invalid — starting in-memory MongoDB for development.');
      const connection = await connectToMemoryMongo();
      console.log(`MongoDB connected: ${connection.connection.host}`);
      return;
    }

    try {
      const connection = await connectToMongo(mongoUri);
      console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const isLocalMongo = mongoUri.startsWith('mongodb://localhost') || mongoUri.startsWith('mongodb://127.0.0.1');

      if (!isDevelopment || !isLocalMongo) {
        throw error;
      }

      console.warn('Local MongoDB is unavailable — starting in-memory MongoDB for development.');
      const connection = await connectToMemoryMongo();
      console.log(`MongoDB connected: ${connection.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

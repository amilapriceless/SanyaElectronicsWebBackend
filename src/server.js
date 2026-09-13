import "dotenv/config";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";
import { validateEnvironment } from "./config/environment.js";

const PORT = process.env.PORT || 5000;
let server;
let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully.`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await mongoose.connection.close();
    console.log("HTTP server and MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Graceful shutdown failed:", error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

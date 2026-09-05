

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import productRoutes from "./routes/product.routes.js";
import healthRoutes from "./routes/health.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : ["http://localhost:4000"];
const isDevelopment = process.env.NODE_ENV !== "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// CORS
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin =
      isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");

    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      return callback(null, true);
    }

    const error = new Error("Origin is not allowed by CORS");
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

// Routes
app.use("/api", apiLimiter);
app.use("/api/products", productRoutes);
app.use("/health", healthRoutes);

// Error middleware must be last
app.use(errorHandler);

export default app;

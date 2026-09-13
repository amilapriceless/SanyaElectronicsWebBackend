

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import compression from "compression";

import productRoutes from "./routes/product.routes.js";
import healthRoutes from "./routes/health.routes.js";
import showroomTargetRoutes from "./routes/showroomTarget.routes.js";
import showroomArrearsRoutes from "./routes/showroomArrears.routes.js";
import authRoutes from "./routes/auth.routes.js";
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

if (!isDevelopment && configuredOrigins.length === 0) {
  throw new Error("ALLOWED_ORIGINS must contain the production frontend origin");
}

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
app.use(compression());
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    return res.status(400).json({ success: false, message: "HTTPS is required" });
  }
  return next();
});
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
app.use(cookieParser());
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Routes
app.use("/api", apiLimiter);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/showroom-targets", showroomTargetRoutes);
app.use("/api/showroom-arrears", showroomArrearsRoutes);
app.use("/health", healthRoutes);
app.use("/api/health", healthRoutes);

// Error middleware must be last
app.use(errorHandler);

export default app;

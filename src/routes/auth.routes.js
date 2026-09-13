import express from "express";
import rateLimit from "express-rate-limit";
import asyncHandler from "../utils/asyncHandler.js";
import {
  changePassword,
  logout,
  me,
  primaryLogin,
  roleLogin,
} from "../controllers/auth.controller.js";
import { requireAuth, requirePrimaryGate, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Try again later." },
});

router.post("/primary-login", authLimiter, asyncHandler(primaryLogin));
router.post("/role-login", authLimiter, requirePrimaryGate, asyncHandler(roleLogin));
router.get("/me", requireAuth, asyncHandler(me));
router.post("/logout", asyncHandler(logout));
router.put("/passwords", requireAuth, requireRole("systemAdmin"), asyncHandler(changePassword));

export default router;
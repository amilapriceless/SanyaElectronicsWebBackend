import ApiError from "../utils/ApiError.js";
import { verifyPrimaryGateToken, verifySessionToken } from "../services/auth.service.js";

export const SESSION_COOKIE = "sanya_session";
export const PRIMARY_GATE_COOKIE = "sanya_primary_gate";

export const requirePrimaryGate = (req, res, next) => {
  try {
    const payload = verifyPrimaryGateToken(req.cookies?.[PRIMARY_GATE_COOKIE]);
    if (payload.purpose !== "primary-gate") throw new Error("Invalid gate");
    next();
  } catch {
    next(new ApiError(401, "Primary verification required"));
  }
};

export const requireAuth = (req, res, next) => {
  try {
    const payload = verifySessionToken(req.cookies?.[SESSION_COOKIE]);
    if (payload.purpose !== "session" || !payload.role) throw new Error("Invalid session");
    req.auth = { role: payload.role };
    next();
  } catch {
    next(new ApiError(401, "Authentication required"));
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.auth || !allowedRoles.includes(req.auth.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }
  return next();
};

export const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge,
});

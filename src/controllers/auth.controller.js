import ApiError from "../utils/ApiError.js";
import {
  createPrimaryGateToken,
  createSessionToken,
  getSeedRoles,
  ROLES,
  updateCredential,
  verifyCredential,
} from "../services/auth.service.js";
import {
  cookieOptions,
  PRIMARY_GATE_COOKIE,
  SESSION_COOKIE,
} from "../middleware/auth.middleware.js";

const isPassword = (value) => typeof value === "string" && value.length >= 3 && value.length <= 128;
const isManagedPassword = (value) => typeof value === "string" && value.length >= 8 && value.length <= 128;

export const primaryLogin = async (req, res) => {
  if (!(await verifyCredential("primary", req.body.passcode))) {
    throw new ApiError(401, "Invalid primary passcode");
  }

  res.cookie(PRIMARY_GATE_COOKIE, createPrimaryGateToken(), cookieOptions(10 * 60 * 1000));
  res.status(200).json({ success: true });
};

export const roleLogin = async (req, res) => {
  const { role, password } = req.body;
  if (!Object.values(getSeedRoles()).includes(role) || !isPassword(password)) {
    throw new ApiError(400, "Invalid role or password");
  }

  if (!(await verifyCredential(role, password))) {
    throw new ApiError(401, "Invalid role password");
  }

  res.cookie(SESSION_COOKIE, createSessionToken(role), cookieOptions(8 * 60 * 60 * 1000));
  res.clearCookie(PRIMARY_GATE_COOKIE, cookieOptions(0));
  res.status(200).json({ success: true, data: { role } });
};

export const me = async (req, res) => {
  res.status(200).json({ success: true, data: { role: req.auth.role } });
};

export const logout = async (req, res) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions(0));
  res.clearCookie(PRIMARY_GATE_COOKIE, cookieOptions(0));
  res.status(200).json({ success: true });
};

export const changePassword = async (req, res) => {
  const { role, password } = req.body;
  if (![ROLES.OFFICER, ROLES.SYSTEM_ADMIN].includes(role) || !isManagedPassword(password)) {
    throw new ApiError(400, "New passwords must be between 8 and 128 characters");
  }
  await updateCredential(role, password);
  res.status(200).json({ success: true });
};


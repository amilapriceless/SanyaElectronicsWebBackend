import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthCredential from "../models/AuthCredential.js";

export const ROLES = {
  OFFICER: "officer",
  SYSTEM_ADMIN: "systemAdmin",
};

const PRIMARY_ROLE = "primary";
const JWT_EXPIRES_IN = process.env.AUTH_SESSION_TTL || "8h";
const PRIMARY_GATE_TTL = "10m";

const getJwtSecret = () => {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_JWT_SECRET must be set to at least 32 characters");
  }
  return secret;
};

const getSeedPassword = (role) => {
  const envKey = {
    [PRIMARY_ROLE]: "AUTH_PRIMARY_PASSCODE",
    [ROLES.OFFICER]: "AUTH_OFFICER_PASSWORD",
    [ROLES.SYSTEM_ADMIN]: "AUTH_SYSTEM_ADMIN_PASSWORD",
  }[role];
  const password = process.env[envKey];
  if (!password || password.length < 3) {
    throw new Error(`${envKey} must be set to at least 3 characters`);
  }
  return password;
};

export const initializeCredentials = async () => {
  for (const role of [PRIMARY_ROLE, ROLES.OFFICER, ROLES.SYSTEM_ADMIN]) {
    const existing = await AuthCredential.findOne({ role }).select("_id").lean();
    if (!existing) {
      const passwordHash = await bcrypt.hash(getSeedPassword(role), 12);
      await AuthCredential.create({ role, passwordHash });
    }
  }
};

export const verifyCredential = async (role, password) => {
  const credential = await AuthCredential.findOne({ role }).select("passwordHash").lean();
  return Boolean(credential && await bcrypt.compare(password, credential.passwordHash));
};

export const updateCredential = async (role, password) => {
  const passwordHash = await bcrypt.hash(password, 12);
  return AuthCredential.findOneAndUpdate(
    { role },
    { passwordHash, updatedAt: new Date() },
    { new: true, upsert: false }
  ).select("role updatedAt").lean();
};

export const createPrimaryGateToken = () => jwt.sign(
  { purpose: "primary-gate" },
  getJwtSecret(),
  { expiresIn: PRIMARY_GATE_TTL }
);

export const verifyPrimaryGateToken = (token) => jwt.verify(token, getJwtSecret());

export const createSessionToken = (role) => jwt.sign(
  { role, purpose: "session" },
  getJwtSecret(),
  { expiresIn: JWT_EXPIRES_IN }
);

export const verifySessionToken = (token) => jwt.verify(token, getJwtSecret());

export const getSeedRoles = () => ({
  officer: ROLES.OFFICER,
  systemAdmin: ROLES.SYSTEM_ADMIN,
});

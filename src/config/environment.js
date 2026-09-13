const requiredProductionVariables = [
  "MONGO_URI",
  "ALLOWED_ORIGINS",
  "AUTH_JWT_SECRET",
  "AUTH_PRIMARY_PASSCODE",
  "AUTH_OFFICER_PASSWORD",
  "AUTH_SYSTEM_ADMIN_PASSWORD",
];

export const validateEnvironment = () => {
  if (process.env.NODE_ENV !== "production") return;

  const missing = requiredProductionVariables.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }

  const placeholders = requiredProductionVariables.filter((name) =>
    /replace-with|change-this|<[^>]+>/i.test(process.env[name])
  );
  if (placeholders.length > 0) {
    throw new Error(`Production environment variables still contain placeholders: ${placeholders.join(", ")}`);
  }

  if (process.env.AUTH_JWT_SECRET.length < 32) {
    throw new Error("AUTH_JWT_SECRET must be at least 32 characters in production");
  }

  for (const name of requiredProductionVariables.slice(3)) {
    if (process.env[name].length < 8) {
      throw new Error(`${name} must be at least 8 characters in production`);
    }
  }
}
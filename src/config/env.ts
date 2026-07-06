import dotenv from "dotenv";
dotenv.config();

const getEnvNumber = (key: string, fallback: number) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) ? value : fallback;
};

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  BCRYPT_SALT_ROUNDS: getEnvNumber("BCRYPT_SALT_ROUNDS", 10),
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@fixitnow.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin123!",
  ADMIN_NAME: process.env.ADMIN_NAME || "Super Admin",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};

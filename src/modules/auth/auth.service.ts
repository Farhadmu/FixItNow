import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";
import { generateAccessToken, generateRefreshToken } from "../../lib/jwt";
import { env } from "../../config/env";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "CUSTOMER" | "TECHNICIAN";
}

const register = async (payload: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      role: payload.role,
    },
  });

  // Auto-create a technician profile if the user registers as a TECHNICIAN
  if (payload.role === "TECHNICIAN") {
    await prisma.technicianProfile.create({
      data: { userId: user.id },
    });
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status === "BANNED") {
    throw new ApiError(403, "Your account has been banned. Contact support.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const { password: _pw, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { technicianProfile: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const authService = { register, login, getMe };

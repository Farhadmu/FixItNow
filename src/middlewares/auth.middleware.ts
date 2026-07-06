import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import { verifyAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import catchAsync from "../utils/catchAsync";

export interface AuthUser {
  id: string;
  email: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const auth = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "You are not authorized. Please login.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new ApiError(401, "User no longer exists.");
    }

    if (user.status === "BANNED") {
      throw new ApiError(403, "Your account has been banned. Contact support.");
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  });

export default auth;

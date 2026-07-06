import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";

// Every error in this API is returned in the SAME shape:
// { success: false, message: string, errorDetails: any }
const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorDetails: unknown = err?.message || err;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails ?? err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    if (err.code === "P2002") {
      message = `Duplicate value for field: ${(err.meta?.target as string[])?.join(", ")}`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Requested resource not found";
    } else {
      message = "Database error";
    }
    errorDetails = err.meta || err.message;
  } else if (err?.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    errorDetails = err.message;
  } else if (err?.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
    errorDetails = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
    stack: env.NODE_ENV === "development" ? err?.stack : undefined,
  });
};

export default errorMiddleware;

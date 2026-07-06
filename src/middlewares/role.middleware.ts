import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";

const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "You are not authorized. Please login.");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. This action requires role(s): ${roles.join(", ")}`
      );
    }

    next();
  };
};

export default authorizeRoles;

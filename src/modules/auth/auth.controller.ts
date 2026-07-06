import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";
import ApiError from "../../utils/ApiError";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await authService.getMe(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Current user retrieved successfully",
    data: result,
  });
});

export const authController = { register, login, getMe };

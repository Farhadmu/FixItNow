import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { users, meta } = await userService.getAllUsers(req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: "Users retrieved successfully", meta, data: users });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUserStatus(req.params.id, req.body.status);
  sendResponse(res, { statusCode: 200, success: true, message: "User status updated successfully", data: result });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const { bookings, meta } = await userService.getAllBookingsForAdmin(req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: "Bookings retrieved successfully", meta, data: bookings });
});

export const userController = { getAllUsers, updateUserStatus, getAllBookings };

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { bookingService } from "./booking.service";
import ApiError from "../../utils/ApiError";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await bookingService.createBooking(req.user.id, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Booking created successfully", data: result });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await bookingService.getMyBookings(req.user.id, req.query.status as string | undefined);
  sendResponse(res, { statusCode: 200, success: true, message: "Bookings retrieved successfully", data: result });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await bookingService.getBookingById(req.user.id, req.user.role, req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Booking retrieved successfully", data: result });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await bookingService.cancelBooking(req.user.id, req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Booking cancelled successfully", data: result });
});

export const bookingController = { createBooking, getMyBookings, getBookingById, cancelBooking };
